import { BaseElement } from "./base.js";
import { makeValidator } from "./validation.js";

export class JsonTextEditor extends BaseElement {
  constructor({ schema, initialValue = {}, onChange } = {}) {
    super("div");

    this.validator = makeValidator(schema);
    this.onChangeCb = onChange;
    this.onValidCb = null;

    this.text = document.createElement("textarea");
    this.text.style.width = "100%";
    this.text.style.minHeight = "200px";

    this.msg = document.createElement("div");

    this.el.append(this.text, this.msg);
    this.setValue(initialValue);

    this.text.addEventListener("input", () => this._update());
  }

  setValue(obj) {
    this.text.value = JSON.stringify(obj, null, 2);
    this._update();
  }

  onValid(fn) {
    this.onValidCb = fn;
    return this;
  }

  _update() {
    let data;
    try {
      data = JSON.parse(this.text.value);
    } catch (e) {
      this.msg.innerHTML = `<div class="error">JSON parse error</div>`;
      return;
    }

    const res = this.validator(data);
    if (res.ok) {
      this.msg.textContent = "✓ valid";
      this.onValidCb?.(data);
    } else {
      this.msg.innerHTML =
        `<div class="error">Schema error</div>` +
        `<ul class="error">${res.errors.map(e => `<li>${e.instancePath} ${e.message}</li>`).join("")}</ul>`;
    }

    this.onChangeCb?.(data, res);
  }
}