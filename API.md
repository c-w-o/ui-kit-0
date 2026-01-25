# ui-kit/0 — API Documentation (v0.7.0)

ui-kit/0 is a minimalist, zero-build UI framework for modern browsers.

- **Native ES modules** — no bundler required
- **50+ components** — layouts, controls, editors, charts, dialogs
- **No mandatory dependencies** — core works standalone
- **Explicit optional deps** — JSON validation, charts, editors load as globals
- **Real DOM** — no virtual DOM, predictable behavior
- **Deterministic cleanup** — via `.destroy()` and lifecycle management

---

## 1. Quick Start

### Load Dependencies (in order)

```html
<!-- Optional: AJV for JSON schema validation (Draft-07) -->
<script src="./src/third_party/ajv/ajv7.bundle.min.js"></script>

<!-- Optional: Ace Editor for JSON editing -->
<script src="./src/third_party/ace/ace.js"></script>
<script src="./src/third_party/ace/mode-json.js"></script>
<script src="./src/third_party/ace/worker-json.js"></script>

<!-- Optional: json-editor for visual schema forms -->
<script src="./src/third_party/json-editor/jsoneditor.min.js"></script>

<!-- Optional: Chart.js for charts -->
<script src="./src/third_party/chartjs/chart.umd.min.js"></script>

<!-- Optional: DOMPurify for HTML/SVG sanitization -->
<script src="./src/third_party/dompurify/purify.min.js"></script>

<!-- Required: CSS (fallback injected if missing) -->
<link rel="stylesheet" href="./src/ui-kit-0.theme.css" />
<link rel="stylesheet" href="./src/ui-kit-0.css" />

<!-- Required: Module -->
<script type="module" src="./src/ui-kit-0.js"></script>
```

### Minimal HTML

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>App</title>
  <link rel="stylesheet" href="./src/ui-kit-0.theme.css" />
  <link rel="stylesheet" href="./src/ui-kit-0.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import * as UI from "./src/ui-kit-0.js";

    const app = new UI.VDiv({ gap: 12 })
      .appendTo(document.getElementById("app"));

    new UI.Heading("Hello", { level: 1 }).appendTo(app);
    new UI.Text("Welcome to ui-kit/0").appendTo(app);
  </script>
</body>
</html>
```

---

## 2. Core Classes

### UINode & BaseElement

All components inherit from `BaseElement`.

```js
class BaseElement {
  // DOM
  appendTo(parent)          // Add to parent element/component
  add(...children)          // Add child elements (fluent API, smart return)
  addTo(container, ...children)  // Add children to arbitrary container
  setText(text)             // Set text content
  setStyle(obj)             // Set inline styles
  addClass(cls)             // Add CSS class
  show() / hide()           // Toggle visibility

  // Events
  on(event, handler)        // Bind event (auto-cleaned)
  on(el, event, handler)    // Bind event on other element
  on(event, selector, handler)  // Event delegation

  // Lifecycle
  own(disposer)             // Register cleanup function
  destroy(options)          // Cleanup and optionally remove from DOM

  // Store binding
  bind(store, path)         // Bind to store path (where supported)
}
```

**Smart `.add()` Behavior:**

The `.add()` method implements intelligent fluent chaining:

```js
// Single child: returns the CHILD (for chaining on it)
const btn = new UI.HDiv().add(new UI.Button("Click"))
  .onClick(() => ...)      // Chain on the button

// Multiple children: returns the PARENT (for adding more)
new UI.HDiv()
  .add(new UI.Button("A"), new UI.Button("B"), new UI.Button("C"))
  .add(new UI.Spacer())    // Chain on the container

// Arrays are flattened
const items = [btn1, btn2, btn3];
new UI.VDiv().add(...items).add(footer)

// Null/undefined filtered automatically
new UI.VDiv().add(btn1, null, btn2, undefined, btn3)

// Store propagates to children automatically
const store = new UI.Store({ count: 0 });
const container = new UI.VDiv({ store });
container.add(new UI.TextField())  // TextField inherits store
```

**Other additions:**

```js
// Add to container without becoming owner
parent.addTo(someDiv, child1, child2)

// Cleanup with DOM removal (default)
el.destroy()                  // Removes from DOM and cleans up
el.destroy({ remove: false }) // Cleanup only, keeps in DOM
```

**Conditional Rendering Best Practice:**

```js
// ⚠️ Avoid: mixing conditionals with .add()
// If cond is false, .onClick binds to container, not button!
container.add(cond && new UI.Button("A")).onClick(...) // DANGEROUS

// ✅ Recommended: explicit filtering
const items = [
  cond1 ? new UI.Button("A") : null,
  cond2 ? new UI.Button("B") : null,
].filter(Boolean);

container.add(...items);

// ✅ Alternative: conditional construction
if (cond) {
  const btn = new UI.Button("A");
  container.add(btn).onClick(...);
}
```

**Example:**

```js
const btn = new UI.Button("Click")
  .setStyle({ marginBottom: "8px" })
  .on("click", () => console.log("Clicked"));

const container = new UI.VDiv()
  .add(new UI.Heading("Title"))
  .add(btn)
  .add(new UI.Text("Done"));
```

---

## 3. Layout Components

### Div, HDiv, VDiv

```js
// Generic container
new UI.Div({ className: "custom", style: { padding: "16px" } })

// Horizontal flex layout
new UI.HDiv({ gap: 8, align: "center", wrap: true })
  .add(new UI.Button("A"))
  .add(new UI.Button("B"))

// Vertical flex layout  
new UI.VDiv({ gap: 12 })
  .add(new UI.Heading("Title"))
  .add(new UI.Text("Content"))
```

### Spacers

```js
// Flexible spacer (fills remaining space in flex)
new UI.HSpacer()

new UI.HDiv({ gap: 8 })
  .add(new UI.Button("Left"))
  .add(new UI.HSpacer())
  .add(new UI.Button("Right"))

// Fixed-width spacer
new UI.HSpacer({ gap: "2ch" })
```

### Grid Layouts

```js
new UI.HGrid({ cols: 3, gap: 12 })
  .add(card1).add(card2).add(card3)

new UI.VGrid({ rows: 2, gap: 8 })
  .add(row1).add(row2)
```

### Card

```js
new UI.Card({ title: "Settings", className: "my-card" })
  .add(new UI.TextField())
  .add(new UI.Button("Save"))
```

---

## 4. Control Components

### Button

```js
new UI.Button("Click", { variant: "primary" })
  .onClick(() => alert("Done"))

new UI.Button("Danger", { variant: "danger" })
```

Variants: `primary`, `secondary`, `danger` (default: `secondary`)

### Text & Typography

```js
new UI.Text("Hello")
new UI.Heading("Title", { level: 2 })  // level: 1-6
new UI.Label("Name")
new UI.Span("inline")
new UI.Sup("superscript")
new UI.Sub("subscript")
new UI.Pre("code\nblock")
```

### TextField / Input

```js
new UI.TextField()
  .setValue("initial")
  .on("input", (e) => console.log(e.target.value))

// Store binding
new UI.TextField()
  .bind(store, "user.email")  // Auto-syncs both directions
```

### Checkbox

```js
new UI.Checkbox(true)  // checked=true

new UI.Checkbox(false, { label: "Enabled", slider: true })
  .on("change", (e) => console.log(e.target.checked))
```

### Select (Dropdown)

```js
new UI.Select({ 
  options: ["dev", "prod"],
  value: "dev"
})
  .on("change", (e) => console.log(e.target.value))

// With option objects
new UI.Select({
  options: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" }
  ]
})
```

---

## 5. Selection & Tabs

### SelectionGroup

Button-based selection group (keyboard accessible, ARIA-aware).

```js
const sel = new UI.SelectionGroup()
  .addItem("a", "Alpha")
  .addItem("b", "Beta")
  .onChange((id) => console.log("Selected:", id))
```

### Tabs

Tab navigation with automatic dropdown on overflow.

```js
const tabs = new UI.Tabs({ active: "one" })
  .appendTo(container);

tabs.addTab("one", "First", () => new UI.Text("Tab 1"))
tabs.addTab("two", "Second", () => new UI.Text("Tab 2"))
```

---

## 6. Data Components

### Store

Simple clone-on-write state management.

```js
const store = new UI.Store({ 
  count: 0,
  user: { name: "Alice" }
});

// Get value
const count = store.getPath("count");
const name = store.getPath("user.name");

// Set value (triggers subscribers)
store.setPath("count", 1);

// Subscribe to path changes
store.subscribePath("count", (v) => console.log("Count:", v));
store.subscribePath("user.name", (v) => console.log("Name:", v));
```

**Batch Updates** (avoid multiple re-renders):

```js
// Without batching: 3 separate renders
store.setPath("count", 1);
store.setPath("user.name", "Bob");
store.setPath("user.age", 42);

// With batching: 1 render at the end
store.batch(() => {
  store.setPath("count", 1);
  store.setPath("user.name", "Bob");
  store.setPath("user.age", 42);
});
// Path-specific listeners still fire for each changed path
```

**Transactional Updates** (rollback on error):

```js
// All-or-nothing updates with automatic rollback
try {
  store.transaction(() => {
    store.setPath("balance", -100);
    store.setPath("status", "active");
    // If any error occurs, state rolls back automatically
  });
} catch (err) {
  // State was rolled back to pre-transaction snapshot
  console.error("Transaction failed:", err);
}

// With validation
store.transaction(
  () => {
    store.setPath("balance", newBalance);
    store.setPath("overdraft", true);
  },
  (state) => state.balance >= 0  // Validation function
);
// If validation fails, state rolls back and throws error
```

### TableView

Data table with sorting and selection.

```js
new UI.TableView({
  columns: [
    { key: "name", label: "Name" },
    { key: "age", label: "Age" },
    { key: "active", label: "Active" }
  ],
  data: [
    { name: "Alice", age: 31, active: true },
    { name: "Bob", age: 27, active: false }
  ]
})
```

---

## 7. Charts

Requires `window.Chart` (Chart.js).

### ChartView

Low-level Chart.js wrapper.

```js
new UI.ChartView({
  type: "line",
  map: (state) => ({
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{
      label: "Sales",
      data: state.sales
    }]
  })
}).bind(store)  // Re-renders when store changes
```

### Chart Cards

High-level chart containers.

```js
// Line chart
new UI.LineChartCard({
  title: "Metrics",
  maxPoints: 600
}).push(Date.now(), 42)

// Bar chart
new UI.BarChartCard({ title: "Distribution" })
  .push(Date.now(), 15)

// Pie chart
new UI.PieChartCard({ title: "Breakdown" })
  .setData({ labels: ["A", "B", "C"], data: [10, 20, 30] })
```

---

## 8. Images & SVG

**Security & Sanitization**

- `SvgView.setSvg()` always sanitizes SVG input using DOMPurify to mitigate XSS. There is currently no opt-out.
- `ImageView` when used with inline SVG should only receive trusted input; prefer `SvgView` for untrusted SVG.


### ImageView

Display raster images and inline SVG.

```js
new UI.ImageView({
  src: "/logo.png",
  width: 128,
  height: 128,
  alt: "Logo"
})

// Inline SVG (must be trusted)
new UI.ImageView({
  src: '<svg>...</svg>',
  inlineSvg: true
})
```

### SvgView

SVG container for programmatic drawing.

```js
new UI.SvgView({
  width: 200,
  height: 200,
  viewBox: "0 0 200 200"
})
```

---

## 9. Editors

### JsonTextEditor (Textarea)

Simple JSON editor with fallback.

```js
const editor = new UI.JsonTextEditor({
  initialValue: { name: "Alice" },
  readOnly: false
});

const data = editor.getValue();
```

### SchemaConfigEditor

Professional JSON config editor with visual + expert modes.

**Requires:** `window.JSONEditor` (user mode) and `window.ace` (expert mode)

```js
new UI.SchemaConfigEditor({
  store,
  valuePath: "config",        // Path to config object in store
  schema: mySchema,           // JSON Schema (Draft-07)
  title: "Configuration",
  allowUserWriteback: true    // json-editor updates store
})
```

**Tabs:**
- **User:** Visual form (json-editor, supports oneOf/anyOf)
- **Expert:** Raw JSON with syntax highlighting (Ace)

**Schema validation:**
- Only valid data writes to store (guarded by AJV)
- Invalid data stays in editor until fixed

---

## 10. Dialogs & Modals

## 10.5 Sanitization Defaults (HTML/SVG)

- `dom.setHtml(target, html, { sanitize = true, customConfig })` sanitizes HTML by default via DOMPurify. Disable per call with `{ sanitize: false }` or pass DOMPurify options via `customConfig`.
- `SvgView.setSvg()` always sanitizes SVG input using DOMPurify (no opt-out).
- Text APIs (`setText`, input values) use textContent/values and are safe by default.


### DialogStack

Modal/dialog management.

```js
const dialogs = new UI.DialogStack().appendTo(container);

// Show modal dialog
dialogs.push(
  new UI.ModalDialog({ title: "Confirm?" })
    .add(new UI.Text("Delete file?"))
    .addButton("Delete", "danger", async () => {
      await deleteFile();
      dialogs.pop();
    })
    .addButton("Cancel", "secondary", () => dialogs.pop())
)
```

### ModalDialog

Customizable modal.

```js
new UI.ModalDialog({
  title: "Settings",
  closable: true,
  width: "400px"
})
  .add(new UI.TextField())
  .addButton("Save", "primary", () => /* ... */)
  .addButton("Cancel")
```

---

## 11. Utilities

### Timer

Simple timer/ticker.

```js
new UI.Timer({
  interval: 1000,  // ms
  onTick: (elapsed) => console.log("Elapsed:", elapsed)
}).start()
```

### State Machine (FSM)

```js
const sm = new UI.StateMachine("idle");

sm.defineState("idle", { 
  entry: () => console.log("Idle"),
  exit: () => console.log("Leaving idle")
})

sm.defineTransition("idle", "loading", () => console.log("Starting load"))
sm.transition("loading")
```

### REST Client

Simple fetch wrapper.

```js
const client = new UI.RestClient({
  baseUrl: "http://localhost:3000",
  headers: { "Authorization": "Bearer token" }
});

const data = await client.get("/api/config");
const result = await client.post("/api/config", { name: "New" });
await client.delete("/api/config/1");
```

### WebSocket JSON-RPC Client

JSON-RPC over WebSocket.

```js
const rpc = new UI.JsonRpcWebSocketClient({
  url: "ws://localhost:8000/rpc",
  reconnectInterval: 3000
});

const result = await rpc.call("method.name", { param: "value" });
rpc.onNotification("server.event", (data) => console.log(data));
```

---

## 12. Binding Utilities

### bindText

Bind element text to store path.

```js
UI.bindText({
  target: myElement,
  store: myStore,
  path: "user.name",
  format: (v) => v.toUpperCase(),  // optional
  immediate: true
});
```

### bindValue

Bind form input value to store.

```js
UI.bindValue({
  target: myInput,
  store: myStore,
  path: "user.email",
  event: "input",  // or "change"
  parse: (v) => v.trim(),
  format: (v) => v || "",
  immediate: true
});
```

### bindStoreToFsm

Bind store changes to state machine.

```js
UI.bindStoreToFsm({
  sm: stateMachine,
  store: myStore,
  path: "status",
  event: "status_changed",
  mapPayload: (v) => ({ status: v })
});
```

---

## 13. Validation

### makeValidator

Create an AJV validator from JSON Schema.

```js
const validate = UI.makeValidator(mySchema);

const result = validate(data);
// result = { valid: true, errors: [] }
// or
// result = { valid: false, errors: [...] }
```

If AJV is not loaded, validation succeeds with a warning.

---

## 14. Complete Example

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Dashboard</title>

  <!-- CSS (fallback auto-injected if missing) -->
  <link rel="stylesheet" href="./src/ui-kit-0.theme.css" />
  <link rel="stylesheet" href="./src/ui-kit-0.css" />

  <!-- Optional third-party libraries (load BEFORE ui-kit-0.js) -->
  <script src="./src/third_party/ajv/ajv7.bundle.min.js"></script>
  <script src="./src/third_party/ace/ace.js"></script>
  <script src="./src/third_party/ace/mode-json.js"></script>
  <script src="./src/third_party/ace/worker-json.js"></script>
  <script src="./src/third_party/json-editor/jsoneditor.min.js"></script>
  <script src="./src/third_party/chartjs/chart.umd.min.js"></script>
</head>

<body>
  <div id="app"></div>

  <script type="module">
    import * as UI from "./src/ui-kit-0.js";

    // Setup store
    const store = new UI.Store({
      count: 0,
      logs: [],
      config: {}
    });

    // Main container
    const app = new UI.VDiv({ gap: 12 })
      .appendTo(document.getElementById("app"));

    // Header
    new UI.Heading("Dashboard", { level: 1 }).appendTo(app);

    // Config section
    const configCard = new UI.Card({ title: "Configuration" })
      .appendTo(app);

    new UI.SchemaConfigEditor({
      store,
      valuePath: "config",
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          port: { type: "integer", minimum: 1024 }
        }
      }
    }).appendTo(configCard);

    // Status section
    const statusCard = new UI.Card({ title: "Status" })
      .appendTo(app);

    const statusText = new UI.Text("Ready")
      .appendTo(statusCard);

    store.subscribePath("count", (v) => {
      statusText.setText(`Count: ${v}`);
    });

    // Controls
    const controlDiv = new UI.HDiv({ gap: 8 })
      .appendTo(app);

    new UI.Button("Increment", { variant: "primary" })
      .appendTo(controlDiv)
      .onClick(() => {
        const current = store.getPath("count");
        store.setPath("count", current + 1);
      });

    new UI.Button("Reset")
      .appendTo(controlDiv)
      .onClick(() => store.setPath("count", 0));

    // Chart
    new UI.LineChartCard({
      title: "Activity",
      maxPoints: 20
    })
      .appendTo(app)
      .push(Date.now(), Math.random() * 100);
  </script>
</body>
</html>
```

---

## 15. Design Principles

1. **No build step** — direct browser execution of ES modules
2. **Explicit dependencies** — third-party libraries loaded via globals
3. **Real DOM** — no virtual DOM, predictable behavior
4. **Composable** — all components can be nested
5. **Store-driven** — centralized state with path-based access
6. **Deterministic cleanup** — via `.destroy()` and `.own()`
7. **Accessibility** — ARIA labels, keyboard navigation where needed
8. **Graceful degradation** — components work without optional dependencies

---

## 16. Version Info

- **Version:** 0.7.0
- **Framework:** ui-kit/0
- **License:** (Check LICENSE in repository)
- **Dependencies:** See [sbom.json](./src/sbom.json)