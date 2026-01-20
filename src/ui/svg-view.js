import { BaseElement } from "./base.js";
import { ui } from "./ui.js";

/**
 * SvgView
 * - Specialized for inline SVG rendering only
 * - No <img> fallback; cleaner DOM structure
 *
 * Security note:
 * Inline SVG is basically HTML. If you inject untrusted SVG, you risk XSS.
 * This class removes <script> nodes, but that is NOT a full sanitizer.
 * Treat inline SVG as "trusted input only".
 */
export class SvgView extends BaseElement {
  constructor({
    svg = null,
    width = null,
    height = null,
    className = "",
  } = {}) {
    super("div");
    this.el.className = `ui-svg ${className}`.trim();

    // Default styling
    this.initStyle({
      display: "block",
    });

    // apply sizing
    this.setSize({ width, height });

    this._svgEl = null;

    if (svg) this.setSvg(svg);
  }

  setSize({ width = null, height = null } = {}) {
    // Accept number => px, or string (e.g. "24px", "100%")
    const w = typeof width === "number" ? `${width}px` : width;
    const h = typeof height === "number" ? `${height}px` : height;

    if (w != null) this.el.style.width = w;
    if (h != null) this.el.style.height = h;

    return this;
  }

  /**
   * Set inline SVG from a string containing <svg ...>...</svg>
   * Trusted input only.
   */
  setSvg(svgText) {
    if (!svgText) return this;

    const svgEl = this._parseSvg(svgText);
    
    // Clear old SVG if present
    if (this._svgEl) this._svgEl.remove();
    
    this._svgEl = svgEl;
    this.el.appendChild(svgEl);
    return this;
  }

  /**
   * Fetch SVG from URL and inline it.
   */
  async setSvgFromUrl(url) {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`SvgView: failed to fetch SVG (${res.status})`);
    const text = await res.text();
    this.setSvg(text);
    return this;
  }

  _parseSvg(svgText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    let svg = doc.documentElement;

    if (!svg || svg.nodeName.toLowerCase() !== "svg") {
      throw new Error("SvgView: invalid SVG (no <svg> root)");
    }

    // remove scripts (basic hardening; not a complete sanitizer!)
    doc.querySelectorAll("script").forEach((n) => n.remove());

    // Make it behave like an image inside its box
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    // ensure the SVG scales to the host box and preserves aspect ratio
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxWidth = "100%";
    svg.style.maxHeight = "100%";
    svg.style.display = "block";

    return svg;
  }
}
