import { BaseElement } from "./base.js";

export class TableView extends BaseElement {
  constructor({ columns = [], data = [], zebra = true } = {}) {
    super("div");
    this.columns = columns;
    this.data = data;
    this.rowClickCb = null;

    this.table = document.createElement("table");
    this.table.className = "ui-table";
    if (zebra) this.table.classList.add("zebra");
    this.table.style.borderCollapse = "collapse";
    this.table.style.width = "100%";

    this.thead = document.createElement("thead");
    this.tbody = document.createElement("tbody");

    this.table.appendChild(this.thead);
    this.table.appendChild(this.tbody);
    this.el.appendChild(this.table);

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
    const tr = document.createElement("tr");

    for (const col of this.columns) {
      const th = document.createElement("th");
      th.className = "ui-th";
      th.textContent = col.label ?? col.key ?? "";
      if (col.align) th.style.textAlign = col.align;
      tr.appendChild(th);
    }

    this.thead.appendChild(tr);
  }

  renderBody() {
    this.tbody.innerHTML = "";

    for (const row of this.data) {
      const tr = document.createElement("tr");
      tr.className = "ui-tr";
      tr.addEventListener("click", () => {
        this.rowClickCb?.(row);
      });

      for (const col of this.columns) {
        const td = document.createElement("td");
        td.className = "ui-td";
        let v = col.key ? row?.[col.key] : undefined;

        if (typeof col.format === "function") {
          v = col.format(v, row);
        }

        td.textContent = v === undefined ? "" : String(v);
        if (col.align) td.style.textAlign = col.align;

        tr.appendChild(td);
      }

      this.tbody.appendChild(tr);
    }
  }
}