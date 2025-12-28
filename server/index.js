import express from 'express';
import cors from 'cors';
import { tracesRouter } from './routes/traces.js';
import { demoRouter } from './routes/demo.js';
import { xray } from './xray-instance.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/traces', tracesRouter);
app.use('/api/demo', demoRouter);

// Start server
app.listen(PORT, () => {
  console.log(`X-Ray Server running on http://localhost:${PORT}`);
  console.log(`Dashboard API: http://localhost:${PORT}/api/traces`);
  console.log(`Demo Pipeline: http://localhost:${PORT}/api/demo`);
});

export { xray };

