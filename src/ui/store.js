const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function isForbiddenKey(key) {
  return FORBIDDEN_KEYS.has(key);
}

function sanitizeObject(value) {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (isForbiddenKey(k)) continue;
      out[k] = sanitizeObject(v);
    }
    return out;
  }
  return value;
}

function clone(x) {
  let copy;
  if (typeof structuredClone === "function") copy = structuredClone(x);
  else copy = JSON.parse(JSON.stringify(x));
  return sanitizeObject(copy);
}
  
export class Store {
  constructor(initial = {}) {
    this.state = clone(initial);
    this.listeners = new Set();     // global listeners
    this.pathListeners = new Map(); // path -> Set(fn)
    this._batchDepth = 0;
    this._batchedPaths = new Set();
    this._computed = new Map();
  }
  /**
   * Define a computed property that auto-updates when dependencies change
   * @param {string} path - Path where computed value is stored
   * @param {string[]} deps - Paths to watch
   * @param {Function} fn - Compute function receiving dependency values
   */
  defineComputed(path, deps, fn) {
    this._computed.set(path, { deps, fn });
    // Subscribe to all dependencies
    for (const dep of deps) {
      this.subscribePath(dep, () => this._updateComputed(path));
    }
    // Initial computation
    this._updateComputed(path);
    return this;
  }

  _updateComputed(path) {
    const computed = this._computed.get(path);
    if (!computed) return;
    const depValues = computed.deps.map(d => this.getPath(d));
    const value = computed.fn(...depValues);
    // Set without triggering computed recursion
    this.setPath(path, value);
  }

  get() {
    return this.state;
  }
  
  // Get by "a.b.c"
  getPath(path) {
    if (!path) return this.state;
    const parts = path.split(".");
    let cur = this.state;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  // Patch by "a.b.c"
  setPath(path, value) {
    const parts = path.split(".");
    if (parts.length === 0) return;

    // clone-on-write along the path (deterministic, no accidental shared refs)
    const newState = clone(this.state);

    let cur = newState;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (isForbiddenKey(k)) throw new Error(`Store.setPath: forbidden key "${k}"`);
      if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
      cur = cur[k];
    }
    const leaf = parts[parts.length - 1];
    if (isForbiddenKey(leaf)) throw new Error(`Store.setPath: forbidden key "${leaf}"`);
    cur[leaf] = value;

    this.state = newState;
    this._emit(path);
  }

  updatePath(path, fn) {
    const prev = this.getPath(path);
    this.setPath(path, fn(prev));
  }

  // Set whole state (replaces)
  set(next) {
    this.state = clone(next);
    this._emit("*");
  }

  // Shallow merge at root
  merge(partial) {
    this.state = { ...this.state, ...clone(partial) };
    this._emit("*");
  }

  batch(fn) {
    this._batchDepth++;
    try { fn(); }
    finally {
      this._batchDepth--;
      if (this._batchDepth === 0 && this._batchedPaths.size) {
        this._batchedPaths.clear();
        this._emit("*");
      }
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  subscribePath(path, fn) {
    if (!this.pathListeners.has(path)) this.pathListeners.set(path, new Set());
    this.pathListeners.get(path).add(fn);
    return () => this.pathListeners.get(path)?.delete(fn);
  }

  _emit(path) {
    if (this._batchDepth > 0) {
      this._batchedPaths.add(path);
      return;
    }
    this._doEmit(path);
  }

  _doEmit(path) {
    // Global listeners: receive (state, changedPath)
    for (const fn of this.listeners) fn(this.state, path);

    // Path listeners: exact path and "*" listeners
    const exact = this.pathListeners.get(path);
    if (exact) for (const fn of exact) fn(this.getPath(path), this.state, path);

    const star = this.pathListeners.get("*");
    if (star) for (const fn of star) fn(undefined, this.state, path);
  }

  /**
   * Transactional update with automatic rollback on error.
   * Useful for multi-step updates that must all succeed or all fail.
   * 
   * @param {Function} fn - Update function
   * @param {Function|null} validate - Optional validation function
   */
  transaction(fn, validate = null) {
    const snapshot = clone(this.state);
    this._batchDepth++;
    
    try {
      fn();
      
      // Optional validation
      if (validate && !validate(this.state)) {
        throw new Error("Transaction validation failed");
      }
    } catch (err) {
      // Rollback on error
      this.state = snapshot;
      this._batchedPaths.clear();
      throw err;
    } finally {
      this._batchDepth--;
      if (this._batchDepth === 0 && this._batchedPaths.size) {
        const paths = Array.from(this._batchedPaths);
        this._batchedPaths.clear();
        // Emit each changed path individually (preserves granularity)
        for (const p of paths) this._doEmit(p);
      }
    }
  }
}