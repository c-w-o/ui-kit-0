# ui-kit/0 (v0.7.0)

ui-kit/0 is a small, explicit UI toolkit for browser-based applications.
It is intended as a stable foundation for tools, dashboards, and configuration-oriented user interfaces.

The project favors **clarity, predictability, and explicit structure** over abstraction depth or framework-level convenience.

**Key Features:**
- 50+ ready-to-use components (layouts, controls, charts, editors, dialogs)
- Zero-build ES modules (direct browser execution)
- No mandatory dependencies (core is fully standalone)
- Explicit optional dependencies (JSON validation, editors, charts)
- Real DOM (no virtual DOM, predictable behavior)
- Store-driven state management with path-based access
- Deterministic cleanup and lifecycle management
- Graceful degradation when optional dependencies are missing

---

## Quick Start

### Sanitization defaults

- HTML: `dom.setHtml()` sanitizes by default using DOMPurify. You can disable it per call with `{ sanitize: false }` or pass custom DOMPurify config via `{ customConfig }`.
- SVG: `SvgView.setSvg()` always sanitizes SVG input via DOMPurify to prevent XSS.
- Text APIs (e.g., `setText`, input values) use textContent/values and are safe by default.


### Installation

No build step or npm required. Simply load the framework in your HTML:

```html
<!-- CSS (fallback auto-injected if missing) -->
<link rel="stylesheet" href="./src/ui-kit-0.theme.css" />
<link rel="stylesheet" href="./src/ui-kit-0.css" />

<!-- Optional: Third-party libraries (load BEFORE ui-kit-0.js) -->
<script src="./src/third_party/ajv/ajv7.bundle.min.js"></script>
<script src="./src/third_party/ace/ace.js"></script>
<script src="./src/third_party/ace/mode-json.js"></script>
<script src="./src/third_party/ace/worker-json.js"></script>
<script src="./src/third_party/json-editor/jsoneditor.min.js"></script>
<script src="./src/third_party/chartjs/chart.umd.min.js"></script>
<script src="./src/third_party/dompurify/purify.min.js"></script> <!-- HTML/SVG sanitization -->

<!-- Required: Module -->
<script type="module" src="./src/ui-kit-0.js"></script>
```

### Your First App

```javascript
import * as UI from "./src/ui-kit-0.js";

const store = new UI.Store({ count: 0 });

const app = new UI.VDiv({ gap: 12 })
  .appendTo(document.getElementById("app"));

new UI.Heading("Counter", { level: 1 }).appendTo(app);

const display = new UI.Text("0").appendTo(app);

new UI.Button("Increment", { variant: "primary" })
  .appendTo(app)
  .onClick(() => {
    const v = store.getPath("count") + 1;
    store.setPath("count", v);
    display.setText(String(v));
  });

store.subscribePath("count", (v) => console.log("Count:", v));
```

For complete examples and API reference, see [API.md](./API.md).

---

## Background and Motivation

Many modern frontend solutions optimize primarily for rapid iteration and developer ergonomics.
This often results in:
- complex build pipelines
- implicit dependency resolution
- tight coupling between tooling and runtime behavior
- large abstraction layers that are difficult to audit or debug later

ui-kit/0 takes a more conservative approach.

It assumes environments where:
- dependencies must be explicit and inspectable
- offline or restricted-network operation is common
- applications are expected to remain understandable and maintainable over long periods

---

## Design Philosophy

### Explicitness First

ui-kit/0 avoids implicit behavior by design.

- No automatic dependency loading
- No hidden globals
- No side effects during module import
- No runtime code generation

If a component depends on a third-party library, that dependency must be:
- loaded explicitly
- visible at runtime
- documented

Missing dependencies do not crash the application.  
Affected features disable themselves in a controlled and visible way.

---

### Browser as the Runtime

The browser is treated as the actual runtime environment, not merely as a compilation target.

ui-kit/0 relies on:
- native ES modules
- standard DOM APIs
- plain JavaScript classes
- CSS custom properties for styling

There is no virtual DOM and no framework-specific rendering model.
DOM updates are explicit and local.

---

### Deterministic Behavior

The framework favors:
- simple control flow
- explicit state updates
- predictable rendering behavior

Components are designed to be understandable with standard browser developer tools.
Understanding runtime behavior should not require knowledge of hidden framework internals.

---

### Offline and Long-Term Use

ui-kit/0 assumes that applications may run:
- without internet access
- with vendored third-party libraries
- in controlled or security-sensitive environments

No runtime dependency on CDNs or package registries is required.

---

## Project Goals

ui-kit/0 is **not** intended to be:
- a full design system
- a replacement for large SPA frameworks
- a component marketplace
- a visual layout or page builder

It **is** intended to:
- provide a small and reliable UI foundation
- support configuration-heavy and data-driven interfaces
- integrate cleanly into existing applications
- remain understandable without framework-specific knowledge

---

## Non-Goals and Anti-Patterns

ui-kit/0 deliberately avoids certain patterns and use cases.
Using it against these constraints will usually result in unnecessary complexity or frustration.

---

### Not a Full Application Framework

ui-kit/0 is not intended to manage:
- routing
- data fetching
- authentication
- application bootstrapping
- deployment concerns

It provides UI building blocks, not an application runtime.

---

### Not a Virtual DOM or Reactive Rendering System

ui-kit/0 does not:
- diff virtual trees
- batch renders automatically
- infer dependencies between state and UI

DOM updates are explicit and local.
Components update because code tells them to, not because a reactive engine decided to.

---

### Not Optimized for Large-Scale SPA Patterns

ui-kit/0 is not designed for:
- thousands of dynamically mounted components
- deep component hierarchies driven by data
- highly dynamic view switching at large scale

It is better suited for:
- tool-like interfaces
- dashboards
- configuration and control panels

---

### No Implicit Two-Way Binding

There is no automatic synchronization between UI and state.

If a component updates state:
- it does so explicitly
- at a clearly defined point in the code

If state updates UI:
- it happens via explicit subscriptions

Patterns that rely on hidden two-way data binding are intentionally avoided.

---

### No Build-Time Magic

ui-kit/0 does not assume:
- a bundler
- a transpiler
- tree-shaking
- code generation

While build tooling can be added externally, the toolkit itself does not depend on it.

---

### Not a Styling Framework

ui-kit/0 does not aim to:
- enforce a visual identity
- provide a comprehensive theme catalog
- replace CSS frameworks

Styling is token-based and minimal by design.
Visual consistency is the responsibility of the integrator.

---

### Avoid Using ui-kit/0 If You Need

ui-kit/0 is likely a poor fit if you need:
- heavy animation systems
- design-system-level theming
- highly dynamic, content-driven UIs
- rapid prototyping with minimal structure

In those cases, a more opinionated framework may be more appropriate.

---

### Anti-Pattern: Hiding Dependencies

Do not:
- implicitly load third-party libraries
- rely on globals without documenting them
- mask missing dependencies

The system is designed to make dependencies visible and explicit.

---

### Anti-Pattern: Treating Components as Declarative Templates

ui-kit/0 components are stateful objects with lifecycle.

They are not intended to be:
- stateless render functions
- declarative templates
- purely data-driven view descriptions

Attempting to use them as such will work against the design.

---

### Architectural Overview

The project is structured into clearly separated layers, each with a specific responsibility.

---

#### Core Layer (No External Dependencies)

The core layer is fully standalone and safe to use in any environment.

It provides:
- **Base Classes**: `UINode`, `BaseElement`, `Store`, `StateMachine`
- **Layouts** (8): `Div`, `HDiv`, `VDiv`, `HSpacer`, `VSpacer`, `HGrid`, `VGrid`, `Card`
- **Controls** (13): `Button`, `TextField`, `Checkbox`, `Select`, `Text`, `Heading`, `Label`, `Span`, `Sup`, `Sub`, `Pre`
- **Structural** (3): `Tabs`, `SelectionGroup`, `TableView`
- **Utilities**: `Timer`, `RestClient`

Key characteristics:
- zero third-party dependencies
- explicit DOM manipulation
- deterministic ownership and cleanup
- predictable rendering behavior
- fluent API with smart return values

The core layer does not depend on any optional features.

---

#### Optional Feature Layer

More advanced functionality is implemented as optional modules.

**Requires AJV (JSON Schema validation):**
- `validation.js` — Schema validation utilities
- `schema-config-editor.js` — Professional JSON config editor with visual & expert modes

**Requires Chart.js:**
- `chart.js` — ChartView, ChartCard, LineChartCard, BarChartCard, PieChartCard

**Requires json-editor:**
- `schema-config-editor.js` — Visual form mode (User tab)

**Requires Ace Editor:**
- `schema-config-editor.js` — Expert JSON mode (Expert tab)

**RPC & REST:**
- `rpc-rest.js` — HTTP REST client with fetch wrapper
- `rpc-ws.js` — JSON-RPC over WebSocket with auto-reconnect

**Editors:**
- `json-editor.js` — Simple JSON textarea editor

**Dialogs:**
- `dialog-stack.js` — Modal/dialog stack management

**Other:**
- `image.js` — ImageView for raster and inline SVG
- `svg-view.js` — SVG container for drawing
- `ui.js` — Utility functions and binding helpers

If a dependency is missing:
- the affected feature reports its unavailability
- a fallback UI is used where reasonable
- the rest of the system continues to function

---

#### Styling Layer

Styling is separated from logic and driven by CSS custom properties.

- Design tokens define colors, spacing, typography, and layout values
- Components consume tokens but do not hard-code design decisions
- Themes are applied by overriding tokens, not by modifying component logic

A minimal fallback stylesheet exists to keep components usable if the main CSS is missing.

---

## Component Overview

### Layouts (8)
`Div`, `HDiv`, `VDiv`, `HSpacer`, `VSpacer`, `HGrid`, `VGrid`, `Card`

### Controls (13)
`Button`, `TextField`, `Checkbox`, `Select`, `Text`, `Heading`, `Label`, `Span`, `Sup`, `Sub`, `Pre`, `UIKText`, `Input`

### Structural (3)
`Tabs`, `SelectionGroup`, `TableView`

### Charts (5)
`ChartView`, `ChartCard`, `LineChartCard`, `BarChartCard`, `PieChartCard`

### Editors (2)
`JsonTextEditor`, `SchemaConfigEditor`

### Dialogs & Modals (2)
`DialogStack`, `ModalDialog`

### Images & SVG (2)
`ImageView`, `SvgView`

### RPC & REST (2)
`RestClient`, `JsonRpcWebSocketClient`

### State & FSM (3)
`Store`, `StateMachine`, `State`

### Utilities (4)
`Timer`, `BaseElement`, `AppMain`, `EventRegistry`

**Total: 50+ components**

---

## State and Data Flow

ui-kit/0 follows a simple and explicit data flow model:

- application state lives in a central Store
- updates are immutable
- components may subscribe to the full state or to specific paths
- state changes trigger explicit UI updates

There is no implicit two-way binding and no hidden synchronization layer.

---

## Dependency Strategy

Dependencies are handled explicitly and conservatively:

- Core: no dependencies
- Optional features: documented global dependencies
- No dynamic imports
- No automatic polyfills
- No runtime dependency resolution

This makes deployments reproducible and easy to audit.

---

## Documentation

The project provides separate documentation for different aspects:

1. **README.md** (this file)  
   Philosophy, design goals, and architectural overview

2. **[API.md](./API.md)**  
   Complete API reference with examples for all 50+ components

3. **[Styling.md](./Styling.md)** (if available)  
   Design tokens, themes, and CSS customization

Start with [API.md](./API.md) for practical examples and detailed component documentation.

---

## License and Attribution

ui-kit/0 is released under the MIT License.  
Third-party libraries retain their respective licenses.

See [sbom.json](./src/sbom.json) for exact versions, hashes, and license details of all dependencies.

---

## Maintenance and Support

This is a stable, single-author project focused on long-term usability.

The framework is designed to remain understandable and maintainable without constant updates.
Updates are made conservatively to preserve backward compatibility.