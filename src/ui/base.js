export class BaseElement {
  constructor(tag) {
    this.el = document.createElement(tag);
    this._cleanup = [];
    this._children = [];
    this._destroyed = false;
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

  // Register a cleanup function to be called on destroy()
  own(fn) {
    if (typeof fn === "function") this._cleanup.push(fn);
    return this;
  }

  // Attach an event listener and auto-remove it on destroy()
  on(event, fn, opts) {
    this.el.addEventListener(event, fn, opts);
    return this.own(() => this.el.removeEventListener(event, fn, opts));
  }

  // Own a child: destroy cascades
  add(child) {
    if (!child) return this;
    const node = child.el ?? child;
    this.el.appendChild(node);

    if (child?.destroy) this._children.push(child);
    return this;
  }

  // Idempotent destroy: safe to call multiple times
  destroy({ remove = true } = {}) {
    if (this._destroyed) return;
    this._destroyed = true;

    // Destroy children first (reverse order)
    for (let i = this._children.length - 1; i >= 0; i--) {
      try { this._children[i].destroy({ remove: false }); } catch {}
    }
    this._children.length = 0;

    // Run cleanups (reverse order)
    for (let i = this._cleanup.length - 1; i >= 0; i--) {
      try { this._cleanup[i](); } catch {}
    }
    this._cleanup.length = 0;

    // Optionally remove element from DOM
    if (remove) this.el.remove();
  }
}