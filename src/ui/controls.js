import { BaseElement } from "./base.js";
import { ui } from "./ui.js";

export class Button extends BaseElement {
  constructor(text, { variant = "primary" } = {}) {
    super("button");
    this.setText(text);
    this.el.type = "button";
    this.el.classList.add("ui-btn");
    this.setVariant(variant);
  }

  setVariant(variant) {
    this.el.classList.remove("primary", "secondary", "danger");
    if (variant && variant !== "primary") this.el.classList.add(variant);
    return this;
  }

  setDisabled(disabled = true) {
    this.el.disabled = !!disabled;
    return this;
  }

  onClick(fn) {
    return this.on("click", fn);
  }
}

export class TextField extends BaseElement {
  constructor(value = "", { type = "text", placeholder = "", validator = null } = {}) {
    super("input");
    this.el.type = type;
    this.el.value = value ?? "";
    this.el.placeholder = placeholder;
    this.el.classList.add("ui-input");
    this._validator = validator;
    this._errorMsg = null;
  }

  getValue() { return this.el.value; }

  setValue(v) { this.el.value = v ?? ""; return this; }

  setPlaceholder(p) { this.el.placeholder = p ?? ""; return this; }

  setInvalid(invalid = true) {
    this.el.classList.toggle("invalid", !!invalid);
    return this;
  }

  validate() {
    if (!this._validator) return { valid: true };
    const result = this._validator(this.getValue());
    this.setInvalid(!result.valid);
    this._errorMsg = result.error || null;
    return result;
  }

  getErrorMessage() {
    return this._errorMsg;
  }

  /**
   * Bind to store with optional validation on input.
   * @param {Store} store
   * @param {string} path
   * @param {object} opts { validateOnChange: boolean }
   */
  bind(store, path, { validateOnChange = false } = {}) {
    store = store || this._store;
    if (!store) throw new Error("TextField.bind: no store provided");
    // init
    this.el.value = store.getPath(path) ?? "";

    // UI -> Store
    this.on("input", () => {
      const value = this.getValue();
      if (validateOnChange && this._validator) {
        const result = this.validate();
        if (!result.valid) return; // Don't update store with invalid value
      }
      store.setPath(path, value);
    });

    // Store -> UI
    this.own(store.subscribePath(path, (val) => this.setValue(val)));

    return this;
  }
}

export class Checkbox extends BaseElement {
  /**
   * A styled checkbox wrapper. Without CSS it is still usable and aligned.
   *
   * Options:
   * - label: text shown next to checkbox/slider
   * - slider: render as switch slider (CSS-enhanced)
   * - checked: initial state (or pass as first arg like before)
   */
  constructor(checked = false, { label = "", slider = false } = {}) {
    // We render a wrapper <label> so the whole row is clickable.
    super("label");
    this.el.classList.add("ui-check");

    // Minimal fallback styling (CSS can override)
    this.initStyle({
      display: "inline-flex",
    });

    // Real checkbox input
    this.input = ui.input("checkbox").el;
    this.input.checked = !!checked;

    this.textEl = ui.span().el;
    this.textEl.classList.add("ui-checkbox-text");
    this.textEl.textContent = label;

    // Optional slider track (CSS-enhanced)
    this.sliderEl = null;
    this.switchBox = null;
    
    if (slider) {
      // IMPORTANT:
      // .ui-switch in ui-kit-0.css is a fixed-size switch box (44x24).
      // Therefore it must NOT be on the outer <label>. Put it on an inner element.
      this.switchBox = ui.span().el;
      this.switchBox.className = "ui-switch";
    
      this.sliderEl = ui.span().el;
      this.sliderEl.className = "ui-slider";
    
      // switchBox contains only input + slider visuals
      this.switchBox.append(this.input, this.sliderEl);
      
      // outer label contains switchBox + text
      this.el.append(this.switchBox, this.textEl);
    } else {
      // Classic checkbox: input + text
      this.el.append(this.input, this.textEl);
    }
  }

  setLabel(text) {
    this.textEl.textContent = text ?? "";
    return this;
  }

  getValue() {
    return !!this.input.checked;
  }

  setValue(v) {
    this.input.checked = !!v;
    return this;
  }

  /**
   * Override event binding to attach to the real input for change/input events.
   * All listeners are owned and removed on destroy().
   */
  on(event, handler, options) {
    const target = this.input;
    target.addEventListener(event, handler, options);
    this.own(() => target.removeEventListener(event, handler, options));
    return this;
  }

  bind(store, path) {
    store = store || this._store;
    if (!store) throw new Error("Checkbox.bind: no store provided");
    // init
    this.setValue(store.getPath(path) ?? false);

    // UI -> Store
    this.on("change", () => store.setPath(path, this.getValue()));

    // Store -> UI
    this.own(store.subscribePath(path, (val) => {
      const next = !!val;
      if (this.getValue() !== next) this.setValue(next);
    }));

    return this;
  }
}

export class Select extends BaseElement {
  constructor({
    options = [],
    value,
    parse = (s) => s,
    format = (v) => (v ?? "") === "" ? "" : String(v),
    placeholder = null, // z.B. "Bitte wählen…"
  } = {}) {
    super("select");
    this.el.classList.add("ui-select");

    this._parse = parse;
    this._format = format;

    this.setOptions(options, { placeholder });

    if (value !== undefined) this.el.value = this._format(value);
  }

  setOptions(options = [], { placeholder = null } = {}) {
    this.el.innerHTML = "";

    if (placeholder != null) {
      const o = ui.option(String(placeholder), "").el;
      o.value = "";
      o.textContent = String(placeholder);
      this.el.appendChild(o);
    }

    for (const opt of options) {
      const value = (opt && typeof opt === "object") ? opt.value : opt;
      const label = (opt && typeof opt === "object") ? (opt.label ?? opt.value) : opt;

      const o = ui.option(label, value).el;
      o.value = String(value);
      o.textContent = String(label);
      this.el.appendChild(o);
    }
    return this;
  }

  clearOptions() {
    this.el.innerHTML = "";
    return this;
  }

  addOption(label, value) {
    const o = ui.option(label, value).el;
    o.value = String(value);
    o.textContent = String(label);
    this.el.appendChild(o);
    return this;
  }

  getValue() { return this.el.value; }

  getTypedValue() { return this._parse(this.getValue()); }

  setValue(v) { this.el.value = this._format(v); return this; }

  setInvalid(invalid = true) {
    this.el.classList.toggle("invalid", !!invalid);
    return this;
  }

  bind(store, path) {
    store = store || this._store;
    if (!store) throw new Error("Select.bind: no store provided");
    // init (Store -> UI)
    this.setValue(store.getPath(path));

    // UI -> Store
    this.on("change", () => store.setPath(path, this.getTypedValue()));

    // Store -> UI
    this.own(store.subscribePath(path, (val) => this.setValue(val)));

    return this;
  }
}

// --- Simple text blocks --------------------------------------

// Generic text container (div by default)
export class UIKText extends BaseElement {
  constructor(text = "", { tag = "div", muted = false, className = "" } = {}) {
    super(tag);
    if (className) this.el.className = className;
    if (muted) this.el.classList.add("muted");
    this.setText(text);
  }
}
export { UIKText as Text };
export { TextField as Input };

export class TextArea extends BaseElement {
  constructor(value = "", { placeholder = "", rows = 3 } = {}) {
    super("textarea");
    this.el.value = value ?? "";
    this.el.placeholder = placeholder;
    this.el.rows = rows;
    this.el.classList.add("ui-input");
  }

  getValue() { return this.el.value; }
  setValue(v) { this.el.value = v ?? ""; return this; }
  setPlaceholder(p) { this.el.placeholder = p ?? ""; return this; }
  clear() { this.el.value = ""; return this; }
}

export class RadioGroup extends BaseElement {
  constructor({ name = "radio-group", options = [], selected = null, layout = "grid" } = {}) {
    super("div");
    this.el.classList.add("ui-radio-group");
    this._name = name || `radio-${Date.now()}`;
    this._options = [];
    this._selected = selected;
    
    // Setup layout
    if (layout === "grid") {
      this.setStyle({
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "12px"
      });
    } else if (layout === "vertical") {
      this.setStyle({ display: "flex", flexDirection: "column", gap: "8px" });
    } else if (layout === "horizontal") {
      this.setStyle({ display: "flex", flexDirection: "row", gap: "12px", flexWrap: "wrap" });
    }
    
    // Add options
    if (options && options.length > 0) {
      for (const opt of options) {
        this.addOption(typeof opt === "string" ? { value: opt, label: opt } : opt);
      }
    }
  }
  
  addOption({ value, label = null, checked = false }) {
    const optLabel = label || value;
    const isChecked = checked || value === this._selected;
    
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = this._name;
    radio.value = value;
    radio.checked = isChecked;
    
    const labelSpan = document.createElement("span");
    labelSpan.textContent = optLabel;
    labelSpan.style.marginLeft = "8px";
    labelSpan.style.cursor = "pointer";
    labelSpan.style.userSelect = "none";
    
    const container = document.createElement("div");
    container.style.padding = "8px 12px";
    container.style.border = "1px solid var(--ui-color-border)";
    container.style.borderRadius = "var(--ui-radius-sm, 4px)";
    container.style.display = "flex";
    container.style.alignItems = "center";
    // Background wird später in setValue() gesetzt
    container.style.background = isChecked ? "var(--ui-color-nav-active, rgba(100,150,255,0.1))" : "";
    container.style.cursor = "pointer";
    
    container.appendChild(radio);
    container.appendChild(labelSpan);
    
    // Click handlers
    radio.addEventListener("change", (evt) => {
      if (radio.checked) {
        this._selected = radio.value;
        // Update all containers in group
        const allContainers = this.el.querySelectorAll("div");
        for (const c of allContainers) {
          const r = c.querySelector("input[type=radio]");
          if (r) {
            c.style.background = r.checked ? "var(--ui-color-nav-active, rgba(100,150,255,0.1))" : "";
          }
        }
        this.el.dispatchEvent(new CustomEvent("change", { detail: { value: radio.value }, bubbles: true }));
      }
    });
    
    labelSpan.addEventListener("click", () => {
      radio.checked = true;
      radio.dispatchEvent(new Event("change"));
    });
    
    this.el.appendChild(container);
    this._options.push({ value, label: optLabel, radio, container });
    
    return this;
  }
  
  getValue() {
    return this._selected;
  }
  
  setValue(value) {
    console.log("[RadioGroup.setValue]", "Setting value to:", value, "Available options:", this._options.map(o => o.value));
    // Normalize helper: trim and collapse whitespace
    const normalize = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
    // Strip dots and lowercase for a tolerant fallback match
    const stripDots = (v) => normalize(v).replace(/\./g, '').toLowerCase();

    let option = this._options.find(opt => normalize(opt.value) === normalize(value));
    if (!option) {
      // Fallback: ignore dots and case differences (e.g. "S.O.G. Prairie Fire" vs "S.O.G Prairie Fire")
      option = this._options.find(opt => stripDots(opt.value) === stripDots(value));
    }
    console.log("[RadioGroup.setValue]", "Found option:", option);
    if (option) {
      // Uncheck all radios first
      for (const opt of this._options) {
        opt.radio.checked = false;
      }
      // Check the selected one
      this._selected = value;
      option.radio.checked = true;
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Update all container backgrounds
        for (const opt of this._options) {
          const isChecked = opt.radio.checked;
          console.log("[RadioGroup.setValue] RAF", "Updating", opt.value, "checked:", isChecked, "radio.checked:", opt.radio.checked);
          opt.container.style.background = isChecked ? "var(--ui-color-nav-active, rgba(100,150,255,0.1))" : "";
        }
      });
      
      console.log("[RadioGroup.setValue]", "Dispatching change event for value:", value);
      option.radio.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      console.log("[RadioGroup.setValue]", "Option not found for value:", value);
    }
    return this;
  }
  
  onChange(fn) {
    return this.on("change", fn);
  }
}

export class Label extends UIKText {
  constructor(text = "") {
    super(text, { tag: "div", className: "ui-label" });
  }
}

export class Heading extends BaseElement {
  constructor(text = "", { level = 2 } = {}) {
    super(`h${Math.min(6, Math.max(1, level))}`);
    this.el.style.margin = "0";
    this.setText(text);
  }
}

export class Pre extends BaseElement {
  constructor(text = "") {
    super("pre");
    this.el.style.margin = "0";
    this.el.style.whiteSpace = "pre-wrap";
    this.setText(text);
  }
}

// --- HTML building blocks --------------------------------

export class Span extends UIKText {
  constructor(text = "", options = {}) {
    super(text, { tag: "span", ...options });
  }
}

export class Sup extends UIKText {
  constructor(text = "", options = {}) {
    super(text, { tag: "sup", ...options });
  }
}

export class Sub extends UIKText {
  constructor(text = "", options = {}) {
    super(text, { tag: "sub", ...options });
  }
}

export class Link extends BaseElement {
  constructor(text = "", href = "#", { target = "_blank", title = "" } = {}) {
    super("a");
    this.el.href = href;
    this.el.target = target;
    if (title) this.el.title = title;
    this.setText(text);
    this.el.classList.add("ui-link");
  }

  setHref(href) {
    this.el.href = href;
    return this;
  }

  setTarget(target = "_blank") {
    this.el.target = target;
    return this;
  }

  setTitle(title) {
    this.el.title = title;
    return this;
  }
}