import { useState } from 'react';

export function StepCard({ step, index, isExpanded, onToggle, isLast }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const typeConfig = {
    generation: { icon: '✨', color: 'bg-accent-purple', label: 'Generation' },
    search: { icon: '🔍', color: 'bg-accent-blue', label: 'Search' },
    filter: { icon: '🎯', color: 'bg-accent-yellow', label: 'Filter' },
    evaluation: { icon: '🤖', color: 'bg-accent-cyan', label: 'Evaluation' },
    ranking: { icon: '🏆', color: 'bg-accent-green', label: 'Ranking' },
    custom: { icon: '⚙️', color: 'bg-dark-600', label: 'Custom' }
  };

  const config = typeConfig[step.type] || typeConfig.custom;

  const formatDuration = (ms) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const hasEvaluations = step.evaluations && step.evaluations.length > 0;
  const hasFilters = step.filters && step.filters.length > 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'input', label: 'Input' },
    { id: 'output', label: 'Output' },
  ];
  
  if (hasEvaluations) {
    tabs.push({ id: 'evaluations', label: `Evaluations (${step.evaluations.length})` });
  }

  return (
    <div 
      className="relative animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Timeline Node */}
      <div className={`absolute left-4 w-5 h-5 rounded-full ${config.color} border-4 border-dark-950 z-10 flex items-center justify-center`}>
        <span className="text-[10px]">{config.icon}</span>
      </div>

      {/* Card */}
      <div className="ml-14 bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.color} text-white`}>
                  {config.label}
                </span>
                <h3 className="text-base font-medium text-dark-100">
                  {formatStepName(step.name)}
                </h3>
              </div>
              {step.reasoning && (
                <p className="text-sm text-dark-400 mt-1 text-left line-clamp-1">
                  {step.reasoning}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-dark-500 font-mono">
              {formatDuration(step.duration)}
            </span>
            <svg 
              className={`w-5 h-5 text-dark-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-dark-800">
            {/* Tabs */}
            <div className="flex border-b border-dark-800 px-5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-accent-blue border-accent-blue'
                      : 'text-dark-400 border-transparent hover:text-dark-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-5">
              {activeTab === 'overview' && (
                <OverviewTab step={step} hasFilters={hasFilters} />
              )}
              {activeTab === 'input' && (
                <JsonView data={step.input} label="Input Data" />
              )}
              {activeTab === 'output' && (
                <JsonView data={step.output} label="Output Data" />
              )}
              {activeTab === 'evaluations' && hasEvaluations && (
                <EvaluationsTab evaluations={step.evaluations} stepType={step.type} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ step, hasFilters }) {
  return (
    <div className="space-y-6">
      {/* Reasoning */}
      {step.reasoning && (
        <div>
          <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
            Reasoning
          </h4>
          <p className="text-sm text-dark-200 bg-dark-800 rounded-lg p-4 border-l-2 border-accent-blue">
            {step.reasoning}
          </p>
        </div>
      )}

      {/* Filters Applied */}
      {hasFilters && (
        <div>
          <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
            Filters Applied
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {step.filters.map((filter, i) => (
              <div 
                key={i}
                className="bg-dark-800 rounded-lg p-4 border border-dark-700"
              >
                <p className="text-sm font-medium text-dark-200 mb-1">
                  {formatStepName(filter.name)}
                </p>
                <p className="text-xs text-dark-400">
                  {filter.rule || (filter.min !== undefined && filter.max !== undefined
                    ? `${filter.min} - ${filter.max}`
                    : filter.value !== undefined
                      ? `Min: ${filter.value}`
                      : 'N/A')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {step.metadata && Object.keys(step.metadata).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
            Metadata
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(step.metadata).map(([key, value]) => (
              <span 
                key={key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-dark-800 rounded-md border border-dark-700"
              >
                <span className="text-dark-500">{key}:</span>
                <span className="text-dark-300">{String(value)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Input/Output Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        {step.input && (
          <div>
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Input Summary
            </h4>
            <div className="text-sm text-dark-300 bg-dark-800 rounded-lg p-3">
              {summarizeData(step.input)}
            </div>
          </div>
        )}
        {step.output && (
          <div>
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
              Output Summary
            </h4>
            <div className="text-sm text-dark-300 bg-dark-800 rounded-lg p-3">
              {summarizeData(step.output)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EvaluationsTab({ evaluations, stepType }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed

  // Determine if this is a filter step or LLM evaluation step
  const isFilterStep = stepType === 'filter';
  
  // Filter evaluations based on search and status
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = !searchTerm || 
      evaluation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.asin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const passed = isFilterStep ? evaluation.qualified : evaluation.isCompetitor;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'passed' && passed) ||
      (filterStatus === 'failed' && !passed);
    
    return matchesSearch && matchesStatus;
  });

  const passedCount = evaluations.filter(e => isFilterStep ? e.qualified : e.isCompetitor).length;
  const failedCount = evaluations.length - passedCount;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-green" />
          <span className="text-sm text-dark-300">{passedCount} passed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-red" />
          <span className="text-sm text-dark-300">{failedCount} failed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title or ASIN..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-dark-800 border border-dark-700 rounded-lg text-dark-100 placeholder-dark-500 focus:border-accent-blue focus:outline-none"
        />
        <div className="flex rounded-lg overflow-hidden border border-dark-700">
          {['all', 'passed', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-accent-blue text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluations List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredEvaluations.map((evaluation, i) => (
          <EvaluationCard 
            key={evaluation.asin || i} 
            evaluation={evaluation} 
            isFilterStep={isFilterStep}
          />
        ))}
        {filteredEvaluations.length === 0 && (
          <p className="text-sm text-dark-500 text-center py-8">
            No evaluations match your filters
          </p>
        )}
      </div>
    </div>
  );
}

function EvaluationCard({ evaluation, isFilterStep }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const passed = isFilterStep ? evaluation.qualified : evaluation.isCompetitor;
  const filterResults = evaluation.filterResults;

  return (
    <div 
      className={`bg-dark-800 rounded-lg border ${
        passed ? 'border-accent-green/30' : 'border-accent-red/30'
      } overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-dark-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
            passed ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'
          }`}>
            {passed ? '✓' : '✗'}
          </span>
          <div className="text-left">
            <p className="text-sm font-medium text-dark-100 line-clamp-1">
              {evaluation.title}
            </p>
            <p className="text-xs text-dark-500 font-mono">{evaluation.asin}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Metrics preview */}
          {evaluation.metrics && (
            <div className="hidden sm:flex items-center gap-3 text-xs text-dark-400">
              <span>${evaluation.metrics.price}</span>
              <span>{evaluation.metrics.rating}★</span>
              <span>{evaluation.metrics.reviews?.toLocaleString()} reviews</span>
            </div>
          )}
          {/* Confidence for LLM evaluations */}
          {evaluation.confidence !== undefined && (
            <span className="text-xs text-dark-400">
              {(evaluation.confidence * 100).toFixed(0)}% conf.
            </span>
          )}
          <svg 
            className={`w-4 h-4 text-dark-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-dark-700 pt-3">
          {/* Filter Results */}
          {filterResults && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Filter Results
              </p>
              {Object.entries(filterResults).map(([filterName, result]) => (
                <div 
                  key={filterName}
                  className={`flex items-start gap-2 text-sm p-2 rounded ${
                    result.passed ? 'bg-accent-green/10' : 'bg-accent-red/10'
                  }`}
                >
                  <span className={result.passed ? 'text-accent-green' : 'text-accent-red'}>
                    {result.passed ? '✓' : '✗'}
                  </span>
                  <div>
                    <span className="font-medium text-dark-200">{formatStepName(filterName)}: </span>
                    <span className="text-dark-400">{result.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* LLM Reasoning */}
          {evaluation.llmReasoning && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                LLM Reasoning
              </p>
              <p className="text-sm text-dark-300 bg-dark-900 rounded p-3">
                {evaluation.llmReasoning}
              </p>
            </div>
          )}

          {/* Score breakdown for ranking */}
          {evaluation.score_breakdown && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Score Breakdown
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(evaluation.score_breakdown).map(([key, value]) => (
                  <div key={key} className="bg-dark-900 rounded p-2 text-center">
                    <p className="text-lg font-semibold text-dark-100">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </p>
                    <p className="text-xs text-dark-500">{formatStepName(key)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JsonView({ data, label }) {
  if (!data) {
    return (
      <p className="text-sm text-dark-500">No {label.toLowerCase()} data</p>
    );
  }

  return (
    <div>
      <pre className="text-sm font-mono text-dark-300 bg-dark-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// Helper functions
function formatStepName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function summarizeData(data) {
  if (!data) return 'No data';
  
  const keys = Object.keys(data);
  if (keys.length === 0) return 'Empty object';
  
  const summary = keys.slice(0, 4).map(key => {
    const value = data[key];
    let displayValue;
    
    if (Array.isArray(value)) {
      displayValue = `[${value.length} items]`;
    } else if (typeof value === 'object' && value !== null) {
      displayValue = `{${Object.keys(value).length} keys}`;
    } else if (typeof value === 'string' && value.length > 30) {
      displayValue = value.substring(0, 30) + '...';
    } else {
      displayValue = String(value);
    }
    
    return `${key}: ${displayValue}`;
  });
  
  if (keys.length > 4) {
    summary.push(`... +${keys.length - 4} more`);
  }
  
  return summary.join('\n');
}

