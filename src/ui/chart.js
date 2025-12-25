// src/ui/chart.js
import { BaseElement } from "./base.js";
import { Card } from "./layout.js";

/**
 * ChartView wraps Chart.js (UMD global: window.Chart).
 *
 * Design goals:
 * - No rebuild by default: always update() (per your requirement).
 * - Store binding via mapper: map(state) -> Chart.js { labels, datasets }.
 * - Lazy init: works with Card.add(chart) (no need to call appendTo()).
 * - Offline: requires a local third_party/chart.umd.js script include.
 */
export class ChartView extends BaseElement {
  constructor({
    type = "line",
    map = null,          // function(state) => { labels, datasets }
    data = null,         // optional initial Chart.js data
    options = null,      // optional Chart.js options
    height = 260,        // CSS height in px (Chart.js needs canvas height)
  } = {}) {
    super("canvas");
    this.el.classList.add("ui-chart");

    this.type = type;
    this.map = map;
    this.data = data ?? { labels: [], datasets: [] };
    this.options = options ?? {};
    this.height = height;

    this.chart = null;
    this._unsub = null;

    // Make sizing predictable for responsive charts
    this.el.style.width = "100%";
    this.el.style.height = `${height}px`;
    this.el.style.display = "block";
  }

  /**
   * Ensure Chart.js is initialized (lazy). Safe to call repeatedly.
   */
  _ensureChart() {
    if (this.chart) return true;

    // Must be in DOM, otherwise Chart.js gets wrong sizes in many browsers.
    if (!this.el.isConnected) return false;

    const Chart = window.Chart;
    if (!Chart) {
      console.error(
        "Chart.js not found. Make sure you included ./src/third_party/chart.umd.js before the module script."
      );
      return false;
    }

    const ctx = this.el.getContext("2d");
    if (!ctx) return false;

    // Reasonable defaults; user can override via options
    const mergedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: { enabled: true },
        legend: { display: true },
      },
      ...this.options,
    };

    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: mergedOptions,
    });

    return true;
  }

  /**
   * Update chart data (no rebuild). If chart isn't ready yet, it will
   * initialize on the next animation frame when connected.
   */
  setData(nextData) {
    this.data = nextData ?? { labels: [], datasets: [] };

    if (this._ensureChart()) {
      this.chart.data = this.data;
      this.chart.update();
    } else {
      // Try again after mount/layout
      requestAnimationFrame(() => {
        if (this._ensureChart()) {
          this.chart.data = this.data;
          this.chart.update();
        }
      });
    }
    return this;
  }

  /**
   * Bind to store. Mapper maps state -> Chart.js data shape.
   * Uses update() only (no rebuild).
   */
  bind(store, mapFn = null) {
    const mapper = mapFn ?? this.map;
    if (typeof mapper !== "function") {
      throw new Error("ChartView.bind(store, mapFn): mapFn must be a function(state) => {labels, datasets}");
    }

    const update = () => {
      const state = store.get();
      const next = mapper(state);
      this.setData(next);
    };

    update();

    // Subscribe to full store updates (simple and consistent with your other widgets)
    this.own(store.subscribe(() => update()));
    return this;
  }

  destroy() {
    try {
      this.chart?.destroy();
    } catch { /* ignore */ }
    this.chart = null;

    super.destroy({ remove: true });
  }
}

/**
 * ChartCard: always render charts inside a Card.
 * Title is required by design.
 */
export class ChartCard extends Card {
  constructor({
    title,
    chart = {}, // passed to ChartView
  } = {}) {
    if (!title) throw new Error("ChartCard requires a title.");
    super({ title });

    this.chartView = new ChartView(chart);
    this.add(this.chartView);
  }

  bind(store, mapFn) {
    this.chartView.bind(store, mapFn);
    return this;
  }

  setData(data) {
    this.chartView.setData(data);
    return this;
  }

  destroy() {
    this.chartView?.destroy();
    super.destroy({ remove: true });
  }
}