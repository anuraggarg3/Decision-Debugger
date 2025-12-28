import { generateId } from './utils.js';

/**
 * Step class - represents a single decision point in a pipeline
 * 
 * This is the core of X-Ray - each step captures:
 * - What went in (input)
 * - What came out (output)
 * - Why the decision was made (reasoning)
 * - What filters were applied (for filter steps)
 * - How each candidate was evaluated (evaluations)
 */
export class Step {
  constructor(name, type, trace) {
    this.id = generateId('step');
    this.name = name;
    this.type = type;
    this.trace = trace;
    
    // Core data
    this._input = null;
    this._output = null;
    this._reasoning = null;
    
    // For filter/evaluation steps
    this._filters = [];
    this._evaluations = [];
    
    // Additional context
    this._metadata = {};
    
    // Timing
    this.startTime = new Date().toISOString();
    this.endTime = null;
    this.duration = null;
  }

  /**
   * Set the input for this step
   * @param {object} data - Input data (what went into this step)
   * @returns {Step} this (for chaining)
   */
  input(data) {
    this._input = data;
    return this;
  }

  /**
   * Set the output for this step
   * @param {object} data - Output data (what came out of this step)
   * @returns {Step} this (for chaining)
   */
  output(data) {
    this._output = data;
    return this;
  }

  /**
   * Set the reasoning/explanation for this step's decision
   * @param {string} text - Human-readable explanation of why this decision was made
   * @returns {Step} this (for chaining)
   */
  reasoning(text) {
    this._reasoning = text;
    return this;
  }

  /**
   * Add a filter that was applied in this step
   * @param {string} name - Filter name (e.g., 'price_range', 'min_rating')
   * @param {object} config - Filter configuration
   * @param {*} config.value - The filter threshold/value
   * @param {string} config.rule - Human-readable rule description
   * @returns {Step} this (for chaining)
   */
  filter(name, config) {
    this._filters.push({
      name,
      ...config
    });
    return this;
  }

  /**
   * Add multiple filters at once
   * @param {object} filters - Object with filter names as keys
   * @returns {Step} this (for chaining)
   */
  filters(filtersObj) {
    for (const [name, config] of Object.entries(filtersObj)) {
      this.filter(name, config);
    }
    return this;
  }

  /**
   * Add an evaluation result for a candidate
   * @param {object} candidate - The candidate being evaluated
   * @param {object} results - Evaluation results per filter/criterion
   * @param {boolean} qualified - Whether the candidate passed all criteria
   * @returns {Step} this (for chaining)
   */
  evaluate(candidate, results, qualified) {
    this._evaluations.push({
      candidate,
      filterResults: results,
      qualified
    });
    return this;
  }

  /**
   * Add evaluation result with detailed breakdown
   * This is a more structured way to add evaluations
   * @param {object} evaluation - Complete evaluation object
   * @returns {Step} this (for chaining)
   */
  addEvaluation(evaluation) {
    this._evaluations.push(evaluation);
    return this;
  }

  /**
   * Add multiple evaluations at once
   * @param {Array} evaluations - Array of evaluation objects
   * @returns {Step} this (for chaining)
   */
  evaluations(evaluationsArr) {
    this._evaluations.push(...evaluationsArr);
    return this;
  }

  /**
   * Add metadata to this step
   * @param {string|object} key - Key or object with metadata
   * @param {*} value - Value (if key is string)
   * @returns {Step} this (for chaining)
   */
  meta(key, value) {
    if (typeof key === 'object') {
      Object.assign(this._metadata, key);
    } else {
      this._metadata[key] = value;
    }
    return this;
  }

  /**
   * Mark this step as complete
   * @returns {Trace} The parent trace (for chaining to next step)
   */
  end() {
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
    return this.trace;
  }

  /**
   * Get a serializable representation of this step
   */
  toJSON() {
    const json = {
      id: this.id,
      name: this.name,
      type: this.type,
      input: this._input,
      output: this._output,
      reasoning: this._reasoning,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration
    };

    // Only include optional fields if they have data
    if (this._filters.length > 0) {
      json.filters = this._filters;
    }
    
    if (this._evaluations.length > 0) {
      json.evaluations = this._evaluations;
    }
    
    if (Object.keys(this._metadata).length > 0) {
      json.metadata = this._metadata;
    }

    return json;
  }
}

