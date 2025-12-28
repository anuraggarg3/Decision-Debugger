import { useState, useEffect } from 'react';

export function DemoPanel({ onClose, onComplete }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/demo/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        if (data.products.length > 0) {
          setSelectedProduct(data.products[0]);
        }
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async () => {
    if (!selectedProduct) return;
    
    setRunning(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/demo/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.asin })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Pipeline failed');
      }
    } catch (err) {
      setError('Failed to run pipeline');
    } finally {
      setRunning(false);
    }
  };

  const handleViewTrace = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-dark-900 rounded-2xl border border-dark-800 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
          <div>
            <h2 className="text-lg font-semibold text-dark-100">Run Demo Pipeline</h2>
            <p className="text-sm text-dark-500">Competitor Selection Demo</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : result ? (
            <ResultView result={result} onViewTrace={handleViewTrace} />
          ) : (
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onSelect={setSelectedProduct}
              onRun={runPipeline}
              running={running}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSelector({ products, selectedProduct, onSelect, onRun, running, error }) {
  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
        <h3 className="text-sm font-medium text-dark-200 mb-2">How it works</h3>
        <p className="text-sm text-dark-400 leading-relaxed">
          This demo simulates a competitor product selection pipeline with 5 steps:
        </p>
        <ol className="mt-3 space-y-1.5 text-sm text-dark-400">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-purple/20 text-accent-purple text-xs flex items-center justify-center">1</span>
            <span>Generate search keywords (simulated LLM)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-blue/20 text-accent-blue text-xs flex items-center justify-center">2</span>
            <span>Search for candidate products</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-yellow/20 text-accent-yellow text-xs flex items-center justify-center">3</span>
            <span>Apply filters (price, rating, reviews)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-cyan/20 text-accent-cyan text-xs flex items-center justify-center">4</span>
            <span>LLM evaluation (remove false positives)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-green/20 text-accent-green text-xs flex items-center justify-center">5</span>
            <span>Rank and select best competitor</span>
          </li>
        </ol>
      </div>

      {/* Product Selection */}
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-3">
          Select a prospect product
        </label>
        <div className="space-y-2">
          {products.map(product => (
            <button
              key={product.asin}
              onClick={() => onSelect(product)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selectedProduct?.asin === product.asin
                  ? 'bg-accent-blue/10 border-accent-blue'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-100 truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">{product.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-dark-200">${product.price}</p>
                  <p className="text-xs text-dark-500">{product.rating}★ · {product.reviews.toLocaleString()} reviews</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
          <p className="text-sm text-accent-red">{error}</p>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={onRun}
        disabled={!selectedProduct || running}
        className="w-full py-3 px-4 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Running Pipeline...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Pipeline
          </>
        )}
      </button>
    </div>
  );
}

function ResultView({ result, onViewTrace }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark-100">Pipeline Complete!</h3>
        <p className="text-sm text-dark-400 mt-1">
          Trace ID: <code className="text-dark-300 bg-dark-800 px-1.5 py-0.5 rounded text-xs">{result.traceId}</code>
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Keywords" value={result.summary.keywordsGenerated} />
        <SummaryCard label="Candidates" value={result.summary.candidatesFound} />
        <SummaryCard label="Passed Filters" value={result.summary.passedFilters} />
        <SummaryCard label="Verified" value={result.summary.verifiedCompetitors} />
      </div>

      {/* Selected Competitor */}
      {result.selectedCompetitor && (
        <div className="bg-dark-800 rounded-lg p-4 border border-accent-green/30">
          <p className="text-xs font-semibold text-accent-green uppercase tracking-wider mb-2">
            Selected Competitor
          </p>
          <h4 className="text-base font-medium text-dark-100 mb-2">
            {result.selectedCompetitor.title}
          </h4>
          <div className="flex items-center gap-4 text-sm text-dark-400">
            <span>${result.selectedCompetitor.price}</span>
            <span>{result.selectedCompetitor.rating}★</span>
            <span>{result.selectedCompetitor.reviews?.toLocaleString()} reviews</span>
            <span className="text-accent-blue">Score: {result.selectedCompetitor.score}</span>
          </div>
        </div>
      )}

      {/* View Trace Button */}
      <button
        onClick={onViewTrace}
        className="w-full py-3 px-4 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        View Decision Trail
      </button>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-dark-800 rounded-lg p-3 text-center">
      <p className="text-2xl font-semibold text-dark-100">{value}</p>
      <p className="text-xs text-dark-500">{label}</p>
    </div>
  );
}

