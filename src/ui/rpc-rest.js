/**
 * RestClient
 * ----------------------
 * REST API client with explicit methods for GET, POST, DELETE, PUT, PATCH
 * - Promise-based requests
 * - Per-call timeout
 * - Automatic retries on network errors
 */
export class RestClient {
  constructor(baseUrl, {
    callTimeoutMs = 30000,
    retries = 1,
    retryDelayMs = 500,
    onError = null,
  } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.callTimeoutMs = callTimeoutMs;
    this.retries = retries;
    this.retryDelayMs = retryDelayMs;
    this.onError = onError;
  }

  /**
   * Send a GET request
   * @param {string} endpoint - The API endpoint path
   * @param {Object} query - Optional query parameters
   * @param {Object} options - Optional per-call overrides { timeoutMs }
   * @returns {Promise<Object>} The parsed JSON response
   */
  async get(endpoint, query = {}, { timeoutMs = null } = {}) {
    return this._callWithRetry(endpoint, null, "GET", query, timeoutMs, 0);
  }

  /**
   * Send a POST request
   * @param {string} endpoint - The API endpoint path
   * @param {Object} data - Request body data
   * @param {Object} options - Optional per-call overrides { timeoutMs }
   * @returns {Promise<Object>} The parsed JSON response
   */
  async post(endpoint, data = {}, { timeoutMs = null } = {}) {
    return this._callWithRetry(endpoint, data, "POST", null, timeoutMs, 0);
  }

  /**
   * Send a DELETE request
   * @param {string} endpoint - The API endpoint path
   * @param {Object} data - Optional request body data
   * @param {Object} options - Optional per-call overrides { timeoutMs }
   * @returns {Promise<Object>} The parsed JSON response
   */
  async delete(endpoint, data = {}, { timeoutMs = null } = {}) {
    return this._callWithRetry(endpoint, data, "DELETE", null, timeoutMs, 0);
  }

  /**
   * Send a PUT request
   * @param {string} endpoint - The API endpoint path
   * @param {Object} data - Request body data
   * @param {Object} options - Optional per-call overrides { timeoutMs }
   * @returns {Promise<Object>} The parsed JSON response
   */
  async put(endpoint, data = {}, { timeoutMs = null } = {}) {
    return this._callWithRetry(endpoint, data, "PUT", null, timeoutMs, 0);
  }

  /**
   * Send a PATCH request
   * @param {string} endpoint - The API endpoint path
   * @param {Object} data - Request body data
   * @param {Object} options - Optional per-call overrides { timeoutMs }
   * @returns {Promise<Object>} The parsed JSON response
   */
  async patch(endpoint, data = {}, { timeoutMs = null } = {}) {
    return this._callWithRetry(endpoint, data, "PATCH", null, timeoutMs, 0);
  }

  async _callWithRetry(endpoint, data, method, query, timeoutMs, attemptCount) {
    try {
      const response = await this._fetchWithTimeout(endpoint, data, method, query, timeoutMs);
      return response;
    } catch (error) {
      if (attemptCount < this.retries) {
        await this._delay(this.retryDelayMs * (attemptCount + 1));
        return this._callWithRetry(endpoint, data, method, query, timeoutMs, attemptCount + 1);
      }
      throw error;
    }
  }

  async _fetchWithTimeout(endpoint, data, method, query, timeoutMs) {
    const controller = new AbortController();
    let timeoutId = null;
    let url = this.baseUrl + endpoint;

    // Append query parameters for GET requests
    if (query && Object.keys(query).length > 0 && method === "GET") {
      const queryString = new URLSearchParams(query).toString();
      url += `?${queryString}`;
    }

    try {
      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Parse response
      let responseData = null;
      try {
        responseData = await response.json();
      } catch {
        throw {
          code: -32700,
          message: "Parse error",
          data: { status: response.status },
        };
      }

      if (!response.ok) {
        throw {
          code: response.status,
          message: `HTTP ${response.status}`,
          data: responseData,
        };
      }

      return responseData;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error.name === "AbortError") {
        throw {
          code: -32001,
          message: "timeout",
          data: { timeoutMs },
        };
      }

      // Network error
      if (error instanceof TypeError) {
        throw {
          code: -32000,
          message: "Network error",
          data: { originalError: error.message },
        };
      }

      // Re-throw if already an error object
      if (error.code !== undefined) {
        throw error;
      }

      // Generic error
      throw {
        code: -32000,
        message: "Server error",
        data: { originalError: String(error) },
      };
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
