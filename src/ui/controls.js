import { BaseElement } from "./base.js";

export class Button extends BaseElement {
  constructor(text) {
    super("button");
    this.setText(text);
  }
  onClick(fn) { return this.on("click", fn); }
}

export class TextField extends BaseElement {
  constructor(value = "") {
    super("input");
    this.el.type = "text";
    this.el.value = value;
  }
  getValue() { return this.el.value; }
}

export class Checkbox extends BaseElement {
  constructor(value = false) {
    super("input");
    this.el.type = "checkbox";
    this.el.checked = value;
  }
  getValue() { return this.el.checked; }
}