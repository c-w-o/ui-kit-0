export class BaseElement {
  constructor(tag) {
    this.el = document.createElement(tag);
  }

  appendTo(parent) {
    (parent.el || parent).appendChild(this.el);
    return this;
  }

  on(event, fn) {
    this.el.addEventListener(event, fn);
    return this;
  }

  setText(t) {
    this.el.textContent = t;
    return this;
  }

  addClass(c) {
    this.el.classList.add(c);
    return this;
  }

  setStyle(obj) {
    Object.assign(this.el.style, obj);
    return this;
  }
}