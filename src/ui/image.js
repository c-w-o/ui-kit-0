import { BaseElement } from "./base.js";

/**
 * ImageView
 * - raster images: <img>
 * - SVG files (as <img> src)
 *
 * For inline SVG rendering, use SvgView instead.
 */
import { ui } from "./ui.js";

export class ImageView extends BaseElement {
  constructor({
    src = null,
    alt = "",
    title = "",
    width = null,
    height = null,
    fit = "contain", // contain | cover | fill | none | scale-down
    className = "",
  } = {}) {
    super("div");
    this.el.className = `ui-image ${className}`.trim();

    this.img = ui.img().el;
    this.img.className = "ui-image-img";
    this.img.alt = alt ?? "";
    if (title) this.img.title = title;

    // Default styling
    this.initStyle({
      display: "block",
    });

    // apply sizing
    this.setSize({ width, height });
    this.setFit(fit);

    this.el.appendChild(this.img);

    if (src) this.setSrc(src);
  }

  setFit(fit = "contain") {
    this.img.style.objectFit = fit;
    return this;
  }

  setSize({ width = null, height = null } = {}) {
    // Accept number => px, or string (e.g. "24px", "100%")
    const w = typeof width === "number" ? `${width}px` : width;
    const h = typeof height === "number" ? `${height}px` : height;

    if (w != null) this.el.style.width = w;
    if (h != null) this.el.style.height = h;

    // For <img> it helps to not overflow container
    this.img.style.maxWidth = "100%";
    this.img.style.maxHeight = "100%";
    return this;
  }

  /**
   * Set image source (raster or SVG file).
   */
  setSrc(src) {
    if (!src) return this;
    this.img.src = src;
    return this;
  }


}
