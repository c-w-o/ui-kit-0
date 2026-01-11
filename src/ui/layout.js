import { BaseElement } from "./base.js";
import { ui } from "./ui.js";

export class Div extends BaseElement {
  constructor({ className = "", style = {} } = {}) {
    super("div");
    if (className) this.el.className = className;
    this.setStyle(style);
  }
}

export class HDiv extends Div {
  constructor({ gap = 12, wrap = true, align = "stretch", className = "", style = {} } = {}) {
    super({ className: `ui-hdiv ${className}`.trim(), style });
    this.initStyle({
      display: "flex",
      flexDirection: "row",
      flexWrap: wrap ? "wrap" : "nowrap",
      gap: typeof gap === "number" ? `${gap}px` : gap,
      alignItems: align
    });
  }
}

export class VDiv extends Div {
  constructor({ gap = 12, className = "", style = {} } = {}) {
    super({ className: `ui-vdiv ${className}`.trim(), style });
    this.initStyle({
      display: "flex",
      flexDirection: "column",
      gap: typeof gap === "number" ? `${gap}px` : gap
    });
  }
}

// Spacer for flex layouts: consumes remaining space
export class HSpacer extends Div {
  constructor({ flex = 1 } = {}) {
    super({ className: "ui-hspacer" });
    this.initStyle({ flex: String(flex), minWidth: "0" });
  }
}

/* legacy grid helpers (optional, fine to keep) */
export class VSpacer extends Div {
  constructor({ flex = 1 } = {}) {
    super({ className: "ui-vspacer" });
    this.initStyle({ flex: String(flex), minHeight: "0" });
  }
}

export class VGrid extends BaseElement {
  constructor() {
    super("div");
    this.addClass("col");
  }
}

export class HGrid extends BaseElement {
  constructor() {
    super("div");
    this.addClass("row");
  }
}

export class Card extends BaseElement {
  constructor({ title = null } = {}) {
    super("div");
    this.addClass("card");

    this.header = ui.div().cls("ui-card-header");
    this.body = ui.div().cls("ui-card-body");

    // Backwards-compat: raw elements if existing code relied on them
    this.headerEl = this.header.el;
    this.bodyEl = this.body.el;

    // Keep ownership + destroy cascading by adding via BaseElement/UINode layer
    this.addTo(this.el, this.header, this.body);

    this.setTitle(title);
  }

  setTitle(title) {
    this.header.text(title ?? "");
    return this;
  }

  /**
   * Add content to the card body (NOT the root).
   * This keeps the internal structure consistent:
   *   .card
   *     .ui-card-header
   *     .ui-card-body  <-- children go here
   */
  add(...children) {
    // Add content to card body (NOT the root).
    return this.addTo(this.body, ...children);
  }

  /**
   * Convenience alias (optional): same as add().
   */
  append(...children) {
    return this.add(...children);
  }

  /**
   * Convenience: clear body content.
   */
  clear() {
    // clear only body content (keep header intact)
    this.bodyEl.replaceChildren();
    return this;
  }
}