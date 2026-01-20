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
  constructor({ gap = 0, fill=false, wrap = true, align = "stretch", className = "", style = {} } = {}) {
    super({ className: `ui-hdiv ${className}`.trim(), style });
    this.initStyle({
      display: fill ? "flex" : "inline-flex",
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

// Spacer for flex layouts: consumes remaining horizontal space (for HDiv/row contexts)
// If gap is provided (e.g. "2ch", "1em"), creates a fixed-width spacer instead
export class HSpacer extends Div {
  constructor({ gap = null } = {}) {
    super({ className: "ui-hspacer" });
    if (gap) {
      // Fixed-width spacer
      const width = typeof gap === "number" ? `${gap}px` : gap;
      this.initStyle({ width });
    } else {
      // Flex spacer (consumes remaining space)
      this.initStyle({ 
        flex: "1 1 0",
        width: "0"
      });
    }
  }
}

/* Spacer for flex layouts: consumes remaining vertical space (for VDiv/column contexts)
   If gap is provided (e.g. "2em"), creates a fixed-height spacer instead */
export class VSpacer extends Div {
  constructor({ gap = null } = {}) {
    super({ className: "ui-vspacer" });
    if (gap) {
      // Fixed-height spacer
      const height = typeof gap === "number" ? `${gap}px` : gap;
      this.initStyle({ height });
    } else {
      // Flex spacer (consumes remaining space)
      this.initStyle({ 
        flex: "1 1 0",
        height: "0"
      });
    }
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

    this.header = ui.div().el;
    this.header.className = "ui-card-header";
    this.body = ui.div().el;
    this.body.className = "ui-card-body";
    this.el.append(this.header, this.body);

    this.header.textContent = title ?? "";
  }

  setTitle(title) {
    this.header.textContent = title ?? "";
    return this;
  }

  /**
   * Add content to the card body (NOT the root).
   * This keeps the internal structure consistent:
   *   .card
   *     .ui-card-header
   *     .ui-card-body  <-- children go here
   */
  add(child) {
    // Important: keep BaseElement ownership tracking intact so that
    // destroy() cascades into children.
    return this.addTo(this.body, child);
  }

  /**
   * Convenience alias (optional): same as add().
   */
  append(child) {
    return this.add(child);
  }

  /**
   * Convenience: clear body content.
   */
  clear() {
    this.body.textContent = "";
    return this;
  }
}