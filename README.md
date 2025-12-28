# X-Ray: Decision Debugger

A debugging toolkit for non-deterministic, multi-step algorithmic systems. Unlike traditional tracing which answers "what happened?", X-Ray answers **"why did the system make this decision?"**


## The Problem

Modern software increasingly relies on multi-step, non-deterministic processes:

1. An LLM generates search keywords from a product description
2. A search API returns thousands of results  
3. Filters narrow down candidates based on business rules
4. A ranking algorithm selects the final output

These systems are notoriously difficult to debug. Traditional logging tells you *what* happened, but not *why* a particular decision was made.

## Solution

X-Ray provides transparency into multi-step decision processes by capturing:

- **Inputs & Outputs** - What went in, what came out
- **Reasoning** - Why each decision was made
- **Evaluations** - How each candidate was scored/filtered
- **Filters Applied** - What criteria narrowed the results

##  Project Structure

```
x-ray-project/
├── xray-lib/          # Core X-Ray library
│   ├── index.js       # Main entry point
│   ├── trace.js       # Trace class
│   ├── step.js        # Step class (core decision capture)
│   ├── storage.js     # Storage adapters
│   └── utils.js       # Utility functions
│
├── server/            # Express.js backend
│   ├── index.js       # Server entry point
│   ├── routes/        # API routes
│   └── demo/          # Demo pipeline implementation
│
├── dashboard/         # React frontend
│   └── src/
│       ├── App.jsx
│       └── components/
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
# Install server dependencies
cd server
npm install

# Install dashboard dependencies  
cd ../dashboard
npm install
```

2. **Start the server:**

```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

3. **Start the dashboard (new terminal):**

```bash
cd dashboard
npm run dev
# Dashboard runs on http://localhost:5173
```

4. **Open the dashboard and run the demo!**

Visit http://localhost:5173, click "Run Demo" to execute the competitor selection pipeline and view the decision trail.

## 📚 X-Ray Library API

### Basic Usage

```javascript
import { XRay } from './xray-lib/index.js';

const xray = new XRay();

// Start a trace for your pipeline
const trace = xray.startTrace('my-pipeline', { 
  userId: '123',
  context: 'production'
});

// Record a step
trace.step('data_processing', 'filter')
  .input({ records: 1000 })
  .filter('quality_score', { min: 0.8, rule: 'Minimum quality threshold' })
  .output({ passed: 750, failed: 250 })
  .reasoning('Filtered records by quality score to ensure data integrity')
  .end();

// Complete the trace
trace.end({ result: 'success' });
```

### Step Types

| Type | Description | Icon |
|------|-------------|------|
| `generation` | LLM/AI content generation | ✨ |
| `search` | Search/retrieval operations | 🔍 |
| `filter` | Filtering/narrowing candidates | 🎯 |
| `evaluation` | Scoring/evaluation steps | 🤖 |
| `ranking` | Ranking/selection | 🏆 |
| `custom` | Custom step type | ⚙️ |

### Recording Evaluations

For filter/evaluation steps, record detailed per-candidate evaluations:

```javascript
trace.step('apply_filters', 'filter')
  .input({ candidates_count: 50 })
  .filter('price_range', { min: 10, max: 100, rule: 'Price must be $10-$100' })
  .filter('min_rating', { value: 4.0, rule: 'Minimum 4 stars' })
  .evaluations([
    {
      asin: 'B001',
      title: 'Product A',
      metrics: { price: 25, rating: 4.5 },
      filterResults: {
        price_range: { passed: true, detail: '$25 within $10-$100' },
        min_rating: { passed: true, detail: '4.5★ >= 4.0★' }
      },
      qualified: true
    },
    {
      asin: 'B002', 
      title: 'Product B',
      metrics: { price: 150, rating: 3.5 },
      filterResults: {
        price_range: { passed: false, detail: '$150 exceeds $100 max' },
        min_rating: { passed: false, detail: '3.5★ < 4.0★' }
      },
      qualified: false
    }
  ])
  .output({ passed: 1, failed: 1 })
  .reasoning('Applied price and rating filters')
  .end();
```

### API Methods

#### XRay Class

| Method | Description |
|--------|-------------|
| `startTrace(name, metadata)` | Start a new trace |
| `getTraces(options)` | Get all traces |
| `getTrace(traceId)` | Get a specific trace |
| `clearTraces()` | Clear all traces |

#### Trace Class

| Method | Description |
|--------|-------------|
| `step(name, type)` | Create a new step |
| `end(result)` | Complete the trace |
| `fail(error)` | Mark trace as failed |

#### Step Class (Fluent API)

| Method | Description |
|--------|-------------|
| `input(data)` | Set step input |
| `output(data)` | Set step output |
| `reasoning(text)` | Explain the decision |
| `filter(name, config)` | Add a filter config |
| `evaluate(candidate, results, qualified)` | Add an evaluation |
| `evaluations(array)` | Add multiple evaluations |
| `meta(key, value)` | Add metadata |
| `end()` | Complete the step |

## 🔌 REST API

### Traces API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/traces` | GET | List all traces |
| `/api/traces/:id` | GET | Get trace by ID |
| `/api/traces` | DELETE | Clear all traces |
| `/api/traces/:id` | DELETE | Delete a trace |

### Demo API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/demo/products` | GET | Get sample products |
| `/api/demo/run` | POST | Run the demo pipeline |
| `/api/demo/scenarios` | GET | Get test scenarios |

## 🎨 Dashboard Features

- **Trace List** - View all captured traces with status and metadata
- **Decision Trail** - Step-by-step visualization of the pipeline
- **Expandable Steps** - Deep dive into each decision point
- **Evaluation Browser** - Search/filter candidates by pass/fail status
- **Demo Runner** - Execute the sample pipeline interactively

## 🏗️ Architecture Decisions

### Why Not Traditional Tracing?

| Aspect | Traditional Tracing | X-Ray |
|--------|---------------------|-------|
| Focus | Performance & flow | Decision reasoning |
| Data | Spans, timing, service calls | Candidates, filters, selection logic |
| Question | "What happened?" | "Why this output?" |
| Granularity | Function/service level | Business logic level |

### Storage

The library ships with an in-memory storage adapter for simplicity. For production, you can implement custom storage adapters by extending the `StorageAdapter` base class:

```javascript
class RedisStorage extends StorageAdapter {
  async saveTrace(trace) { /* ... */ }
  async getTraces(options) { /* ... */ }
  async getTrace(traceId) { /* ... */ }
  // ...
}
```

### Data Format

X-Ray uses a flexible JSON format that can accommodate various pipeline types. The core structure is:

```json
{
  "id": "trace_xyz123",
  "name": "pipeline-name",
  "metadata": {},
  "steps": [
    {
      "id": "step_abc456",
      "name": "step_name",
      "type": "filter",
      "input": {},
      "output": {},
      "reasoning": "...",
      "filters": [],
      "evaluations": []
    }
  ]
}
```

## ⚠️ Known Limitations

1. **In-Memory Storage** - Traces are lost on server restart. Implement a persistent storage adapter for production use.

2. **No Authentication** - The dashboard is open. Add authentication middleware for production.

3. **Single Node** - The current implementation runs on a single node. For distributed systems, use a shared storage backend.

4. **Evaluation Scaling** - For steps with thousands of evaluations, consider pagination or sampling strategies.

## 🔮 Future Improvements

- [ ] Persistent storage adapters (Redis, PostgreSQL, MongoDB)
- [ ] Trace search and filtering
- [ ] Trace comparison (diff two traces)
- [ ] Timeline visualization
- [ ] Export traces as JSON/CSV
- [ ] WebSocket for real-time trace updates
- [ ] Trace replay functionality
- [ ] Integration with popular observability platforms


---

Built for debugging the "why" behind algorithmic decisions.

