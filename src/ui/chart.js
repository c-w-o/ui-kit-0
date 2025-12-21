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
  
  bind(store, makeDataFn) {
    const update = () => {
      const data = makeDataFn(store.get());
      if (data) this.setData(data);
    };
  
    // initial
    update();
  
    // update on any change
    const unsub = store.subscribe(() => update());
    return unsub;
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