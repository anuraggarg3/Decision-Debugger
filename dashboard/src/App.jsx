import { useState, useEffect } from 'react';
import { TraceList } from './components/TraceList';
import { TraceViewer } from './components/TraceViewer';
import { DemoPanel } from './components/DemoPanel';
import { Header } from './components/Header';

function App() {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);

  // Fetch traces on mount and periodically
  useEffect(() => {
    fetchTraces();
    const interval = setInterval(fetchTraces, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTraces = async () => {
    try {
      const response = await fetch('/api/traces');
      const data = await response.json();
      if (data.success) {
        setTraces(data.traces);
        // If we have a selected trace, refresh its data
        if (selectedTrace) {
          const updated = data.traces.find(t => t.id === selectedTrace.id);
          if (updated) setSelectedTrace(updated);
        }
      }
    } catch (error) {
      console.error('Failed to fetch traces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrace = async (traceId) => {
    try {
      const response = await fetch(`/api/traces/${traceId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedTrace(data.trace);
      }
    } catch (error) {
      console.error('Failed to fetch trace:', error);
    }
  };

  const handleClearTraces = async () => {
    try {
      await fetch('/api/traces', { method: 'DELETE' });
      setTraces([]);
      setSelectedTrace(null);
    } catch (error) {
      console.error('Failed to clear traces:', error);
    }
  };

  const handleDemoComplete = () => {
    fetchTraces();
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-blue/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <Header 
          traceCount={traces.length}
          onRunDemo={() => setShowDemo(true)}
          onClearTraces={handleClearTraces}
        />
        
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Trace List Sidebar */}
            <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
              <TraceList 
                traces={traces}
                selectedId={selectedTrace?.id}
                onSelect={handleSelectTrace}
                loading={loading}
              />
            </aside>
            
            {/* Main Content */}
            <section className="col-span-12 lg:col-span-8 xl:col-span-9">
              {selectedTrace ? (
                <TraceViewer trace={selectedTrace} />
              ) : (
                <EmptyState onRunDemo={() => setShowDemo(true)} />
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Demo Panel Modal */}
      {showDemo && (
        <DemoPanel 
          onClose={() => setShowDemo(false)}
          onComplete={handleDemoComplete}
        />
      )}
    </div>
  );
}

function EmptyState({ onRunDemo }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-dark-100 mb-3">
          No traces selected
        </h2>
        <p className="text-dark-400 mb-8 leading-relaxed">
          Select a trace from the sidebar to view its decision trail, or run the demo pipeline to generate sample data.
        </p>
        
        <button
          onClick={onRunDemo}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Run Demo Pipeline
        </button>
      </div>
    </div>
  );
}

export default App;

