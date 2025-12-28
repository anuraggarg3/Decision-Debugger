import { useState } from 'react';
import { StepCard } from './StepCard';

export function TraceViewer({ trace }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set(trace.steps?.map(s => s.id) || []));

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSteps(new Set(trace.steps?.map(s => s.id) || []));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  const formatDuration = (ms) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const statusConfig = {
    completed: { label: 'Completed', color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
    running: { label: 'Running', color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/30' },
    error: { label: 'Error', color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' }
  };

  const status = statusConfig[trace.status] || statusConfig.completed;

  return (
    <div className="animate-fade-in">
      {/* Trace Header */}
      <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            {/* Title & Status */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-dark-50">{trace.name}</h2>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                {status.label}
              </span>
            </div>
            
            {/* ID */}
            <p className="text-xs font-mono text-dark-500 mb-3">{trace.id}</p>
            
            {/* Metadata */}
            {trace.metadata && Object.keys(trace.metadata).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(trace.metadata).map(([key, value]) => (
                  <span 
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-dark-800 rounded-md"
                  >
                    <span className="text-dark-500">{key}:</span>
                    <span className="text-dark-300 truncate max-w-[200px]">{String(value)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 lg:gap-8">
            <Stat label="Started" value={formatDate(trace.startTime)} />
            <Stat label="Duration" value={formatDuration(trace.duration)} />
            <Stat label="Steps" value={trace.steps?.length || 0} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider">
          Decision Trail
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors"
          >
            Expand All
          </button>
          <span className="text-dark-700">|</span>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs text-dark-400 hover:text-dark-200 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-800" />
        
        {/* Steps */}
        <div className="space-y-4">
          {trace.steps?.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isExpanded={expandedSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
              isLast={index === trace.steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Result Summary */}
      {trace.result && (
        <div className="mt-6 bg-dark-900 rounded-xl border border-dark-800 p-6">
          <h3 className="text-sm font-semibold text-dark-200 uppercase tracking-wider mb-4">
            Final Result
          </h3>
          <pre className="text-sm font-mono text-dark-300 bg-dark-950 rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(trace.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-xs text-dark-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-dark-200">{value}</p>
    </div>
  );
}

