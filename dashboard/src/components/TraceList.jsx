export function TraceList({ traces, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="bg-dark-900 rounded-xl border border-dark-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-800 rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-dark-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dark-800">
        <h2 className="text-sm font-semibold text-dark-200 uppercase tracking-wider">
          Traces
        </h2>
      </div>

      {/* List */}
      <div className="divide-y divide-dark-800 max-h-[calc(100vh-240px)] overflow-y-auto">
        {traces.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-dark-500 text-sm">No traces yet</p>
            <p className="text-dark-600 text-xs mt-1">Run the demo to generate traces</p>
          </div>
        ) : (
          traces.map((trace, index) => (
            <TraceListItem
              key={trace.id}
              trace={trace}
              isSelected={trace.id === selectedId}
              onClick={() => onSelect(trace.id)}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TraceListItem({ trace, isSelected, onClick, index }) {
  const statusColors = {
    completed: 'bg-accent-green',
    running: 'bg-accent-yellow animate-pulse',
    error: 'bg-accent-red'
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (ms) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-5 py-4 text-left transition-all hover:bg-dark-800/50 animate-slide-up ${
        isSelected 
          ? 'bg-dark-800 border-l-2 border-accent-blue' 
          : 'border-l-2 border-transparent'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Trace Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${statusColors[trace.status]}`} />
            <span className="text-sm font-medium text-dark-100 truncate">
              {trace.name}
            </span>
          </div>
          
          {/* Metadata */}
          {trace.metadata?.prospectTitle && (
            <p className="text-xs text-dark-500 truncate mb-2">
              {trace.metadata.prospectTitle}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-dark-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {trace.steps?.length || 0} steps
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(trace.duration)}
            </span>
          </div>
        </div>
        
        {/* Time */}
        <div className="text-xs text-dark-600 whitespace-nowrap">
          {formatTime(trace.startTime)}
        </div>
      </div>
    </button>
  );
}

