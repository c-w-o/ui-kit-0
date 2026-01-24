import { dom } from "./dom.js";
import { Store } from "./store.js";
import { UINode } from "./ui.js";

export class BaseElement extends UINode {
  constructor(tag = "div") {
    super(document.createElement(tag));
    this._store = null;
  }

  appendTo(parent) {
    const p = dom.get(parent) ?? parent?.el ?? parent;
    (p ?? document.body).appendChild(this.el);
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
    if (typeof a === "string") {
      this.own(dom.on(this.el, a, b, c, d)); 
      return this;
    }
    this.own(dom.on(a, b, c, d, e));
    return this;
  }

  add(...children) {
    const flatChildren = children.flat(Infinity).filter(c => c);
    
    // Nur bei genau einem Kind: Logik für neues/existierendes Objekt
    if (flatChildren.length === 1) {
      const child = flatChildren[0];
      const node = child.el ?? child;
      const isNewChild = !node || node.parentNode !== this.el;
      
      if (isNewChild) {
        this.el.appendChild(node);
      } else {
        this.el.appendChild(node);
      }
      
      if (child?.destroy) this._children.push(child);
      
      // Propagate store to child
      if (child && typeof child === 'object' && child._store === null && this._store) {
        child._store = this._store;
      }
      
      // Neues Kind → das Kind zurückgeben, Existierendes → Parent
      return isNewChild ? child : this;
    }
    
    // Bei mehreren Kindern: immer Parent zurückgeben
    for (const child of flatChildren) {
      const node = child.el ?? child;
      if (node && node.parentNode !== this.el) this.el.appendChild(node);
      if (child?.destroy) this._children.push(child);
      // Propagate store to children
      if (child && typeof child === 'object' && child._store === null && this._store) {
        child._store = this._store;
      }
    }
    return this;
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

  destroy({ remove = true } = {}) {
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

export class AppMain extends BaseElement {
  static _instance = null;

  constructor({ store = new Store(), theme = "light", children = [], target = "#app" } = {}) {
    // Singleton: return existing instance
    if (AppMain._instance) {
      return AppMain._instance;
    }

    super("div");
    this.addClass("app-root");
    // Apply theme to html element per CSS contract
    document.documentElement.setAttribute("data-ui-theme", theme);
    this._store = store;
    this._theme = theme;
    this._children = [];

    children.forEach(child => this.add(child));
    
    // Mount into DOM
    this.appendTo(target);
    
    // Register as singleton instance
    AppMain._instance = this;
  }

  static getInstance() {
    return AppMain._instance;
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-ui-theme", theme);
    this._theme = theme;
    return this;
  }
}