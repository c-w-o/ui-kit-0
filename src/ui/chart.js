import { BaseElement } from "./base.js";

export class ChartView extends BaseElement {
  constructor({ type = "line", data, options } = {}) {
    super("canvas");
    this.cfg = { type, data, options };
    this.chart = null;
  }

  appendTo(parent) {
    super.appendTo(parent);
    this._init();
    return this;
  }

  _init() {
    if (!window.Chart) {
      throw new Error("Chart.js not loaded (window.Chart)");
    }
    this.chart = new window.Chart(
      this.el.getContext("2d"),
      this.cfg
    );
  }

  setData(data) {
    this.chart.data = data;
    this.chart.update();
    return this;
  }

  destroy() {
    this.chart?.destroy();
  }
}