/**
 * Shared X-Ray instance for the server
 * This is the central point where all traces are stored
 */
import { XRay } from '../xray-lib/index.js';

// Create a shared X-Ray instance
export const xray = new XRay({
  defaultMetadata: {
    service: 'competitor-selection-demo'
  }
});

