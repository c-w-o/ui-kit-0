import { BaseElement } from "./base.js";

export class Button extends BaseElement {
  constructor(text, { variant = "primary" } = {}) {
    super("button");
    this.setText(text);
    this.el.type = "button";
    this.el.classList.add("ui-btn");
    this.setVariant(variant);
    this.setStyle({
      padding: "6px 10px",
      border: "1px solid #888",
      borderRadius: "4px",
      background: "#eee",
      cursor: "pointer"
    });
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
  constructor(value = "", { type = "text", placeholder = "" } = {}) {
    super("input");
    this.el.type = type;
    this.el.value = value ?? "";
    this.el.placeholder = placeholder;
    this.el.classList.add("ui-input");
    this.setStyle({
      padding: "6px",
      border: "1px solid #888",
      borderRadius: "4px",
      width: "100%"
    });
  }

  getValue() { return this.el.value; }

  setValue(v) { this.el.value = v ?? ""; return this; }

  setPlaceholder(p) { this.el.placeholder = p ?? ""; return this; }

  setInvalid(invalid = true) {
    this.el.classList.toggle("invalid", !!invalid);
    return this;
  }
  
  // in TextField class:
  bind(store, path) {
    // init
    this.el.value = store.getPath(path) ?? "";
  
    // UI -> Store
    this.on("input", () => store.setPath(path, this.getValue()));
  
    // Store -> UI
    this.own(store.subscribePath(path, (val) => this.setValue(val)));

    return this;
  }
}

export class Checkbox extends BaseElement {
  constructor(value = false, { slider = false } = {}) {
    super(slider ? "label" : "input");

    if (slider) {
      this.el.className = "ui-switch";

      this.input = document.createElement("input");
      this.input.type = "checkbox";
      this.input.checked = !!value;

      this.slider = document.createElement("span");
      this.slider.className = "ui-slider";

      this.el.append(this.input, this.slider);
    } else {
      this.el.type = "checkbox";
      this.el.checked = !!value;
      this.input = this.el;
    }
  }
  // Checkbox.on(): register cleanup via own()
  on(event, fn) {
    this.input.addEventListener(event, fn);
    this.own(() => this.input.removeEventListener(event, fn));
    return this;
  }
  
  getValue() { return !!this.input.checked; }
  
  setValue(v) { this.input.checked = !!v; return this; }
  
  // in Checkbox class:
  bind(store, path) {
    // init
    this.input.checked = !!store.getPath(path);
  
    // UI -> Store
    this.on("change", () => store.setPath(path, this.getValue()));
  
    this.own(store.subscribePath(path, (val) => this.setValue(val)));

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
      const o = document.createElement("option");
      o.value = "";
      o.textContent = String(placeholder);
      this.el.appendChild(o);
    }

    for (const opt of options) {
      const value = (opt && typeof opt === "object") ? opt.value : opt;
      const label = (opt && typeof opt === "object") ? (opt.label ?? opt.value) : opt;

      const o = document.createElement("option");
      o.value = String(value);
      o.textContent = String(label);
      this.el.appendChild(o);
    }
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
export class Text extends BaseElement {
  constructor(text = "", { tag = "div", muted = false, className = "" } = {}) {
    super(tag);
    if (className) this.el.className = className;
    if (muted) this.el.classList.add("muted");
    this.setText(text);
  }
}

export class Label extends Text {
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