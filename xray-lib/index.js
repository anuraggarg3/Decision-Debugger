/**
 * X-Ray Library
 * A debugging toolkit for non-deterministic, multi-step algorithmic systems.
 */

import { Trace } from './trace.js';
import { InMemoryStorage } from './storage.js';

/**
 * Main X-Ray class - entry point for the library
 */
class XRay {
  constructor(options = {}) {
    this.storage = options.storage || new InMemoryStorage();
    this.defaultMetadata = options.defaultMetadata || {};
  }

  /**
   * Start a new trace for a pipeline execution
   * @param {string} name - Name of the pipeline/process being traced
   * @param {object} metadata - Optional metadata about this execution
   * @returns {Trace} A new trace instance
   */
  startTrace(name, metadata = {}) {
    const trace = new Trace(name, {
      ...this.defaultMetadata,
      ...metadata
    }, this.storage);
    return trace;
  }

  /**
   * Get all traces from storage
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of traces
   */
  async getTraces(options = {}) {
    return this.storage.getTraces(options);
  }

  /**
   * Get a specific trace by ID
   * @param {string} traceId - The trace ID
   * @returns {Promise<object|null>} The trace or null if not found
   */
  async getTrace(traceId) {
    return this.storage.getTrace(traceId);
  }

  /**
   * Clear all traces from storage
   */
  async clearTraces() {
    return this.storage.clear();
  }

  /**
   * Get the underlying storage instance
   */
  getStorage() {
    return this.storage;
  }
}

// Create default instance for simple usage
const defaultInstance = new XRay();

export { XRay, Trace, InMemoryStorage };
export default defaultInstance;

