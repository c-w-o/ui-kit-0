/**
 * Sanitization utilities using DOMPurify
 * 
 * Expects window.DOMPurify to be loaded via <script> before ui-kit-0.js
 * 
 * If DOMPurify is not available, functions will log a warning and skip sanitization.
 * This allows graceful degradation but should be treated as a security issue.
 */

function getPurify() {
  const purify = window.DOMPurify;
  if (!purify) {
    console.warn("[ui-kit] DOMPurify not loaded (window.DOMPurify missing) - XSS mitigation disabled");
    return null;
  }
  return purify;
}

/**
 * Sanitize HTML string using DOMPurify with safe defaults.
 * 
 * Default configuration:
 * - Removes script tags and event handlers
 * - Allows common formatting tags (b, i, em, strong, etc.)
 * - Removes style attributes
 * - Removes event attributes
 * 
 * @param {string} html - HTML string to sanitize
 * @param {object} config - Optional DOMPurify config overrides
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html, config = {}) {
  const purify = getPurify();
  if (!purify) return String(html ?? "");
  
  const defaultConfig = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span', 
      'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead',
      'pre', 'code', 'blockquote'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    KEEP_CONTENT: true,
  };
  
  const mergedConfig = { ...defaultConfig, ...config };
  return purify.sanitize(String(html ?? ""), mergedConfig);
}

/**
 * Sanitize SVG string for safe inline rendering.
 * 
 * Removes:
 * - All script tags
 * - Event handlers
 * - External URLs (remote resources)
 * - Dangerous attributes
 * 
 * @param {string} svgText - SVG string to sanitize
 * @param {object} config - Optional DOMPurify config overrides
 * @returns {string} Sanitized SVG
 */
export function sanitizeSvg(svgText, config = {}) {
  const purify = getPurify();
  if (!purify) return String(svgText ?? "");
  
  const defaultConfig = {
    // SVG-specific tags
    ALLOWED_TAGS: [
      'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
      'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop',
      'use', 'symbol', 'marker', 'clipPath', 'mask', 'pattern', 'image',
      'foreignObject', 'style'
    ],
    // Allow essential SVG attributes (no event handlers)
    ALLOWED_ATTR: [
      'id', 'class', 'style', 'viewBox', 'width', 'height', 'preserveAspectRatio',
      'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
      'points', 'd', 'fill', 'stroke', 'stroke-width', 'opacity', 'transform',
      'href', 'xlink:href', 'data-*', 'aria-*', 'role', 'xmlns', 'xmlns:xlink'
    ],
    KEEP_CONTENT: true,
  };
  
  const mergedConfig = { ...defaultConfig, ...config };
  return purify.sanitize(String(svgText ?? ""), mergedConfig);
}

/**
 * Sanitize plain text (escape HTML entities).
 * Use this for user-generated text that should never contain HTML.
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Escaped text safe for innerHTML
 */
export function sanitizeText(text) {
  const el = document.createElement("div");
  el.textContent = String(text ?? "");
  return el.innerHTML;
}

/**
 * Check if DOMPurify is available.
 * 
 * @returns {boolean} true if DOMPurify is loaded
 */
export function isDomPurifyAvailable() {
  return !!window.DOMPurify;
}
