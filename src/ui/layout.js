import { BaseElement } from "./base.js";

export class Div extends BaseElement {
  constructor({ className = "", style = {} } = {}) {
    super("div");
    if (className) this.el.className = className;
    this.setStyle(style);
  }

  add(child) {
    this.el.appendChild(child?.el ?? child);
    return this;
  }
}

export class HDiv extends Div {
  constructor({ gap = 12, wrap = true, align = "stretch", className = "", style = {} } = {}) {
    super({ className: `ui-hdiv ${className}`.trim(), style });
    this.setStyle({
      display: "flex",
      flexDirection: "row",
      flexWrap: wrap ? "wrap" : "nowrap",
      gap: typeof gap === "number" ? `${gap}px` : gap,
      alignItems: align,
      ...style
    });
  }
}

export class VDiv extends Div {
  constructor({ gap = 12, className = "", style = {} } = {}) {
    super({ className: `ui-vdiv ${className}`.trim(), style });
    this.setStyle({
      display: "flex",
      flexDirection: "column",
      gap: typeof gap === "number" ? `${gap}px` : gap,
      ...style
    });
  }
}

/** Spacer für Flex-Layouts (nimmt Restplatz ein) */
export class HSpacer extends Div {
  constructor({ flex = 1 } = {}) {
    super({ className: "ui-hspacer" });
    this.setStyle({ flex: String(flex), minWidth: "0" });
  }
}
export class VSpacer extends Div {
  constructor({ flex = 1 } = {}) {
    super({ className: "ui-vspacer" });
    this.setStyle({ flex: String(flex), minHeight: "0" });
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
  constructor() {
    super("div");
    this.addClass("card");
  }
}