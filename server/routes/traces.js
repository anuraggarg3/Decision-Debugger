import { Router } from 'express';
import { xray } from '../xray-instance.js';

export const tracesRouter = Router();

/**
 * GET /api/traces
 * List all traces with optional filtering
 */
tracesRouter.get('/', async (req, res) => {
  try {
    const { limit, offset, status, name } = req.query;
    
    const traces = await xray.getTraces({
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
      status,
      name
    });
    
    res.json({
      success: true,
      count: traces.length,
      traces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/traces/:id
 * Get a specific trace by ID
 */
tracesRouter.get('/:id', async (req, res) => {
  try {
    const trace = await xray.getTrace(req.params.id);
    
    if (!trace) {
      return res.status(404).json({
        success: false,
        error: 'Trace not found'
      });
    }
    
    res.json({
      success: true,
      trace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/traces/:id
 * Delete a specific trace
 */
tracesRouter.delete('/:id', async (req, res) => {
  try {
    const storage = xray.getStorage();
    const deleted = await storage.deleteTrace(req.params.id);
    
    res.json({
      success: deleted,
      message: deleted ? 'Trace deleted' : 'Trace not found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/traces
 * Clear all traces
 */
tracesRouter.delete('/', async (req, res) => {
  try {
    await xray.clearTraces();
    
    res.json({
      success: true,
      message: 'All traces cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

