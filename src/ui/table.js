import { BaseElement } from "./base.js";
import { ui } from "./ui.js";

export class TableView extends BaseElement {
  constructor({ columns = [], data = [], zebra = true, virtualize = false, rowHeight = 32, visibleRows = 20 } = {}) {
    super("div");
    this.columns = columns;
    this.data = data;
    this.rowClickCb = null;
    this.virtualize = virtualize && data.length > 100;
    this.rowHeight = rowHeight;
    this.visibleRows = visibleRows;

    this.table = ui.table().el;
    this.table.className = "ui-table";
    if (zebra) this.table.classList.add("zebra");
    this.table.style.borderCollapse = "collapse";
    this.table.style.width = "100%";

    this.thead = ui.thead().el;
    this.tbody = ui.tbody().el;

    this.table.appendChild(this.thead);
    this.table.appendChild(this.tbody);

    if (this.virtualize) {
      this.scrollContainer = document.createElement("div");
      this.scrollContainer.style.overflowY = "auto";
      this.scrollContainer.style.maxHeight = `${this.rowHeight * this.visibleRows}px`;
      this.scrollContainer.appendChild(this.table);
      this.el.appendChild(this.scrollContainer);
      this.scrollContainer.addEventListener("scroll", () => this.renderBody());
    } else {
      this.el.appendChild(this.table);
    }

    // Event delegation for row clicks
    this.on(this.tbody, "click", "tr", (e, tr) => {
      const idx = tr?.dataset?.rowIndex ? parseInt(tr.dataset.rowIndex, 10) : NaN;
      if (!Number.isFinite(idx)) return;
      const row = this.data?.[idx];
      if (row === undefined) return;
      this.rowClickCb?.(row, idx, tr, e);
    });

    this.render();
  }

  setZebra(on = true) {
    this.table.classList.toggle("zebra", !!on);
    return this;
  }

  setColumns(columns) {
    this.columns = columns || [];
    this.render();
    return this;
  }

  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    this.renderBody();
    return this;
  }
    
  bind(store, path) {
    this.setData(store.getPath(path) || []);
    this.own(store.subscribePath(path, (val) => this.setData(val || [])));
    return this;
  }

  onRowClick(fn) {
    this.rowClickCb = fn;
    return this;
  }

  render() {
    this.renderHead();
    this.renderBody();
  }

  renderHead() {
    this.thead.innerHTML = "";
    const tr = ui.tr().el;

    for (const col of this.columns) {
      const th = ui.th().el;
      th.className = "ui-th";
      th.textContent = col.label ?? col.key ?? "";
      if (col.align) th.style.textAlign = col.align;
      tr.appendChild(th);
    }

    this.thead.appendChild(tr);
  }

  renderBody() {
    this.tbody.innerHTML = "";

    if (this.virtualize) {
      const total = this.data.length;
      const container = this.scrollContainer || this.el;
      const scrollTop = container.scrollTop || 0;
      const start = Math.floor(scrollTop / this.rowHeight);
      const end = Math.min(total, start + this.visibleRows + 2); // buffer

      if (start > 0) {
        const spacer = ui.tr().el;
        spacer.style.height = `${start * this.rowHeight}px`;
        spacer.style.pointerEvents = "none";
        this.tbody.appendChild(spacer);
      }

      for (let i = start; i < end; i++) {
        const row = this.data[i];
        if (!row) continue;
        const tr = ui.tr().el;
        tr.className = "ui-tr";
        tr.dataset.rowIndex = String(i);
        for (const col of this.columns) {
          const td = ui.td().el;
          td.className = "ui-td";
          let v = col.key ? row?.[col.key] : undefined;
          if (typeof col.format === "function") {
            v = col.format(v, row);
          }
          td.textContent = v ?? "";
          if (col.align) td.style.textAlign = col.align;
          tr.appendChild(td);
        }
        this.tbody.appendChild(tr);
      }

      const bottom = this.data.length - end;
      if (bottom > 0) {
        const spacer = ui.tr().el;
        spacer.style.height = `${bottom * this.rowHeight}px`;
        spacer.style.pointerEvents = "none";
        this.tbody.appendChild(spacer);
      }
    } else {
      for (let i = 0; i < this.data.length; i++) {
        const row = this.data[i];
        const tr = ui.tr().el;
        tr.className = "ui-tr";
        tr.dataset.rowIndex = String(i);
        for (const col of this.columns) {
          const td = ui.td().el;
          td.className = "ui-td";
          let v = col.key ? row?.[col.key] : undefined;
          if (typeof col.format === "function") {
            v = col.format(v, row);
          }
          td.textContent = v ?? "";
          if (col.align) td.style.textAlign = col.align;
          tr.appendChild(td);
        }
        this.tbody.appendChild(tr);
      }
    }
  }
}

export { TableView as Table };