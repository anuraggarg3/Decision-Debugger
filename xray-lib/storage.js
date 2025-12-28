/**
 * Storage adapters for X-Ray traces
 * 
 * The library is designed to be storage-agnostic.
 * This file provides an in-memory implementation for demo/testing.
 * In production, we will swap this for Redis, PostgreSQL, etc.
 */

/**
 * In-memory storage adapter
 * Stores traces in memory - suitable for development and demos
 */
export class InMemoryStorage {
  constructor() {
    this.traces = new Map();
  }

  /**
   * Save a trace
   * @param {object} trace - The trace data to save
   */
  async saveTrace(trace) {
    this.traces.set(trace.id, {
      ...trace,
      savedAt: new Date().toISOString()
    });
    return trace;
  }

  /**
   * Get all traces with optional filtering
   * @param {object} options - Query options
   * @param {number} options.limit - Max traces to return
   * @param {number} options.offset - Skip first N traces
   * @param {string} options.status - Filter by status
   * @param {string} options.name - Filter by trace name
   * @returns {Array} Array of traces
   */
  async getTraces(options = {}) {
    let traces = Array.from(this.traces.values());
    
    // Apply filters
    if (options.status) {
      traces = traces.filter(t => t.status === options.status);
    }
    
    if (options.name) {
      traces = traces.filter(t => t.name.includes(options.name));
    }
    
    // Sort by start time (newest first)
    traces.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    
    return traces.slice(offset, offset + limit);
  }

  /**
   * Get a specific trace by ID
   * @param {string} traceId - The trace ID
   * @returns {object|null} The trace or null
   */
  async getTrace(traceId) {
    return this.traces.get(traceId) || null;
  }

  /**
   * Delete a trace
   * @param {string} traceId - The trace ID to delete
   */
  async deleteTrace(traceId) {
    return this.traces.delete(traceId);
  }

  /**
   * Clear all traces
   */
  async clear() {
    this.traces.clear();
  }

  /**
   * Get count of traces
   */
  async count() {
    return this.traces.size;
  }
}

/**
 * Base class for custom storage implementations
 * Extend this to create adapters for Redis, PostgreSQL, MongoDB, etc.
 */
export class StorageAdapter {
  async saveTrace(trace) {
    throw new Error('saveTrace must be implemented');
  }

  async getTraces(options) {
    throw new Error('getTraces must be implemented');
  }

  async getTrace(traceId) {
    throw new Error('getTrace must be implemented');
  }

  async deleteTrace(traceId) {
    throw new Error('deleteTrace must be implemented');
  }

  async clear() {
    throw new Error('clear must be implemented');
  }
}

