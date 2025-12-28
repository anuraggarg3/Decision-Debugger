import { Step } from './step.js';
import { generateId } from './utils.js';

/**
 * Trace class - represents a complete pipeline execution
 * Contains multiple steps that represent decision points
 */
export class Trace {
  constructor(name, metadata = {}, storage) {
    this.id = generateId('trace');
    this.name = name;
    this.metadata = metadata;
    this.storage = storage;
    this.steps = [];
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.duration = null;
    this.status = 'running';
    this.error = null;
  }

  /**
   * Create a new step in this trace
   * @param {string} name - Name of the step (e.g., 'keyword_generation', 'apply_filters')
   * @param {string} type - Type of step: 'generation', 'search', 'filter', 'evaluation', 'ranking', 'custom'
   * @returns {Step} A new step instance with fluent API
   */
  step(name, type = 'custom') {
    const step = new Step(name, type, this);
    this.steps.push(step);
    return step;
  }

  /**
   * Add a pre-built step data object directly
   * Useful when you want to record step data without using the fluent API
   * @param {object} stepData - Complete step data object
   */
  addStepData(stepData) {
    const step = new Step(stepData.name, stepData.type || 'custom', this);
    
    if (stepData.input) step._input = stepData.input;
    if (stepData.output) step._output = stepData.output;
    if (stepData.reasoning) step._reasoning = stepData.reasoning;
    if (stepData.filters) step._filters = stepData.filters;
    if (stepData.evaluations) step._evaluations = stepData.evaluations;
    if (stepData.metadata) step._metadata = stepData.metadata;
    
    step.end();
    return this;
  }

  /**
   * Mark the trace as completed successfully
   * @param {object} result - Optional final result/output of the pipeline
   */
  end(result = null) {
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
    this.status = 'completed';
    this.result = result;
    
    // Persist to storage
    this._persist();
    
    return this;
  }

  /**
   * Mark the trace as failed with an error
   * @param {Error|string} error - The error that occurred
   */
  fail(error) {
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
    this.status = 'error';
    this.error = error instanceof Error ? error.message : error;
    
    // Persist to storage
    this._persist();
    
    return this;
  }

  /**
   * Get a serializable representation of this trace
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      metadata: this.metadata,
      steps: this.steps.map(s => s.toJSON()),
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      status: this.status,
      result: this.result,
      error: this.error
    };
  }

  /**
   * Get a summary of this trace for list views
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      metadata: this.metadata,
      stepCount: this.steps.length,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      status: this.status
    };
  }

  /**
   * Persist this trace to storage
   */
  _persist() {
    if (this.storage) {
      this.storage.saveTrace(this.toJSON());
    }
  }
}

