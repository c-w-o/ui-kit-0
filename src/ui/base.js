import { dom } from "./dom.js";

export class BaseElement {
  constructor(tag = "div") {
    this.el = document.createElement(tag);
    this._owned = [];
    this._children = [];
  }

  appendTo(parent) {
    (parent.el ?? parent).appendChild(this.el);
    return this;
  }

  setText(text) { this.el.textContent = text ?? ""; return this; }

  setStyle(obj) {
    for (const [k, v] of Object.entries(obj || {})) {
      this.el.style[k] = v;
    }
    return this;
  }
  
  initStyle(obj) {
    for (const [k, v] of Object.entries(obj || {})) {
      if (this.el.style[k] === "") this.el.style[k] = v;
    }
    return this;
  }

  addClass(cls) { this.el.classList.add(cls); return this; }

  own(disposer) {
    if (typeof disposer === "function") {
      this._owned.push(disposer);
    }
    return disposer;
  }

  show() { this.el.style.display = ""; return this; }
  hide() { this.el.style.display = "none"; return this; }

  on(target, evt, selOrHandler, handler, opts) {
    return this.own(dom.on(target, evt, selOrHandler, handler, opts));
  }

  // Own a child: destroy cascades
  add(child) {
    if (!child) return this;
    const node = child.el ?? child;
    if (node && node.parentNode !== this.el) this.el.appendChild(node);

    if (child?.destroy) this._children.push(child);
    return this;
  }

  destroy({ remove = false } = {}) {
    for (const ch of this._children.splice(0)) {
      try { ch.destroy({ remove: true }); } catch {}
    }
    
    for (const off of this._owned.splice(0)) {
      try { off(); } catch {}
    }
    if (remove && this.el?.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}