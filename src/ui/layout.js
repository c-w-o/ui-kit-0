import { BaseElement } from "./base.js";

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