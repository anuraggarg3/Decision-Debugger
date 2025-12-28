import { Router } from 'express';
import { runCompetitorSelectionPipeline } from '../demo/pipeline.js';
import { sampleProducts } from '../demo/mockData.js';

export const demoRouter = Router();

/**
 * GET /api/demo/products
 * Get list of sample products that can be used as prospects
 */
demoRouter.get('/products', (req, res) => {
  res.json({
    success: true,
    products: sampleProducts.prospects
  });
});

/**
 * POST /api/demo/run
 * Run the competitor selection pipeline with X-Ray tracing
 * 
 * Body:
 * - productId: ID of the prospect product (optional, uses first product if not provided)
 */
demoRouter.post('/run', async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Find the prospect product
    let prospect;
    if (productId) {
      prospect = sampleProducts.prospects.find(p => p.asin === productId);
      if (!prospect) {
        return res.status(400).json({
          success: false,
          error: `Product not found: ${productId}`
        });
      }
    } else {
      // Use a random prospect if none specified
      prospect = sampleProducts.prospects[
        Math.floor(Math.random() * sampleProducts.prospects.length)
      ];
    }
    
    // Run the pipeline with X-Ray tracing
    const result = await runCompetitorSelectionPipeline(prospect);
    
    res.json({
      success: true,
      traceId: result.traceId,
      prospect: prospect,
      selectedCompetitor: result.selectedCompetitor,
      summary: result.summary
    });
  } catch (error) {
    console.error('Pipeline error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/demo/scenarios
 * Get predefined test scenarios for demonstration
 */
demoRouter.get('/scenarios', (req, res) => {
  res.json({
    success: true,
    scenarios: [
      {
        id: 'water-bottle',
        name: 'Water Bottle Selection',
        description: 'Find competitor for a stainless steel water bottle',
        prospectAsin: 'B0XYZ001'
      },
      {
        id: 'wireless-earbuds',
        name: 'Wireless Earbuds Selection',
        description: 'Find competitor for wireless earbuds',
        prospectAsin: 'B0XYZ002'
      },
      {
        id: 'yoga-mat',
        name: 'Yoga Mat Selection',
        description: 'Find competitor for a premium yoga mat',
        prospectAsin: 'B0XYZ003'
      }
    ]
  });
});

