import { dom } from "./dom.js";
import { ui } from "./ui.js";
import { UINode } from "./ui.js";


/**
 * BaseElement is an INTERNAL convenience layer for widget implementations.
 *
 * User-facing API should be the python-like chainable surface from UINode.
 *
 * By inheriting from UINode, every widget automatically behaves like a UINode:
 *  - .add(...)
 *  - .on(...)
 *  - .style(...)
 *  - .destroy(...)
 */
export class BaseElement extends UINode {
  constructor(tag = "div") {
    super(document.createElement(tag));
  }

  appendTo(parent) { return super.appendTo(parent); }

  setText(text) { return this.text(text ?? ""); }

  setStyle(obj) { return this.style(obj); }
  
  initStyle(obj) {
    for (const [k, v] of Object.entries(obj || {})) {
      if (this.el.style[k] === "") this.el.style[k] = v;
    }
    return this;
  }

  addClass(cls) { this.el.classList.add(cls); return this; }

  show() { this.el.style.display = ""; return this; }
  hide() { this.el.style.display = "none"; return this; }

  /**
   * Event binding with automatic cleanup.
   *
   * Supported forms:
   *   this.on('click', handler)
   *   this.on('click', '.child', (e, el) => ...)
   *   this.on(otherEl, 'click', handler)
   *   this.on(otherEl, 'click', '.child', handler)
   */
  on(a, b, c, d, e) {
    if (typeof a === "string") return super.on(a, b, c);
    return this.own(dom.on(a, b, c, d, e));
  }

  add(...children) {
    return this.addTo(this.el, ...children);
  }

  /**
   * Append children into an arbitrary container element while still
   * participating in ownership tracking (destroy() cascades).
   */
  addTo(container, ...children) {
    const target = container?.el ?? container;
    for (const child of children.flat(Infinity)) {
      if (!child) continue;
      const node = child.el ?? child;
      if (node && node.parentNode !== target) target.appendChild(node);
      if (child?.destroy) this._children.push(child);
    }
    return this;
  }

  destroy(opts = { remove: false }) { return super.destroy(opts); }
}