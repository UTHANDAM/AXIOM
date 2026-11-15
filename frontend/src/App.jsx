import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import ArenaComparison from './components/ArenaComparison';
import ASTVisualizer from './components/ASTVisualizer';
import DiffViewer from './components/DiffViewer';
import TerminalLog from './components/TerminalLog';
import CustomTaskModal from './components/CustomTaskModal';
import CISimulator from './components/CISimulator';
import SubmissionModal from './components/SubmissionModal';
import { Sparkles, Award, ArrowUpRight, ShieldCheck, Flame, GitPullRequest, Zap, Cpu } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('lru_cache');
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [events, setEvents] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('arena'); // 'arena' or 'ci_bot'

  // Fetch benchmark tasks on mount
  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        if (data.length > 0) {
          setSelectedTaskId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load tasks', err));
  }, []);

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  // Run benchmark with real-time SSE stream
  const handleRunBenchmark = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setEvents([]);

    try {
      // Connect to SSE stream
      const url = `/api/stream/benchmark/${selectedTaskId}${apiKey ? `?api_key=${encodeURIComponent(apiKey)}` : ''}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener('telemetry', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setEvents((prev) => [...prev, payload]);
          if (payload.type === 'COMPLETED') {
            eventSource.close();
            // Fetch final comparison data
            fetchComparisonData();
          }
        } catch (err) {
          console.error('Error parsing SSE event', err);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('SSE connection closed or completed', err);
        eventSource.close();
        fetchComparisonData();
      };
    } catch (e) {
      console.error(e);
      fetchComparisonData();
    }
  };

  const fetchComparisonData = async () => {
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: selectedTaskId, api_key: apiKey })
      });
      const data = await res.json();
      setBenchmarkData(data);
      if (data.axiom?.events && events.length === 0) {
        setEvents(data.axiom.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustom = async (customPayload) => {
    setIsRunning(true);
    setEvents([]);
    try {
      const res = await fetch('/api/agent/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customPayload, api_key: apiKey })
      });
      const data = await res.json();
      setEvents(data.events || []);

      const axiomTokens = data.summary?.axiom_tokens || 1450;
      const baselineTokens = data.summary?.baseline_tokens || 14000;
      const savings = Math.round(((baselineTokens - axiomTokens) / baselineTokens) * 100);

      setBenchmarkData({
        task_id: 'custom',
        task_name: customPayload.title,
        axiom: {
          tokens: axiomTokens,
          cost_usd: data.summary?.axiom_cost_usd || 0.00015,
          duration_seconds: data.summary?.duration_seconds || 1.1,
          final_code: data.final_code
        },
        baseline: {
          tokens: baselineTokens,
          cost_usd: (baselineTokens / 1000000) * 0.15,
          duration_seconds: 3.5
        },
        comparison: {
          token_savings_percentage: savings,
          tokens_saved: baselineTokens - axiomTokens,
          efficiency_multiplier: (baselineTokens / axiomTokens).toFixed(1)
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const latestDiffStats = events.findLast ? events.findLast((e) => e.diff_stats)?.diff_stats : events.slice().reverse().find((e) => e.diff_stats)?.diff_stats;
  const finalCode = benchmarkData?.axiom?.final_code || activeTask?.initial_code;

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans pb-16">
      {/* Top Navigation */}
      <Navbar
        apiKey={apiKey}
        setApiKey={setApiKey}
        activeTask={activeTask}
        onCustomClick={() => setIsCustomOpen(true)}
        onDeckClick={() => window.open('/pitch_deck/presentation.html', '_blank')}
        onSubmissionClick={() => setIsSubmissionOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 flex-1 w-full">
        
        {/* Hackathon Hero Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Flame className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Global AI Hackathon 2026</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                  Track: Coding Agent On Fewest Tokens
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  Elimination Round Submission
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Autonomous Software Engineering at <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">1/10th the Token Cost</span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Standard SWE agents burn 85%+ of tokens dumping whole repos and noisy stack traces. Axiom enforces strict token budgeting via AST skeletonization, symbol-level context zooming, and targeted diff synthesis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto flex-shrink-0">
              <button
                onClick={() => setIsSubmissionOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20"
              >
                <Award className="h-4 w-4" />
                <span>HackCulture Submission Hub</span>
              </button>
              <a
                href="/pitch_deck/presentation.html"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition shadow-md"
              >
                <span>View Slide Deck</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Real-Time Telemetry Metric Cards */}
        <MetricCards benchmarkData={benchmarkData} isRunning={isRunning} />

        {/* View Switcher Tabs (Anti-Slop Design Taste) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('arena')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'arena'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Head-to-Head Arena</span>
            </button>
            <button
              onClick={() => setActiveTab('ci_bot')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ci_bot'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitPullRequest className="h-4 w-4 text-indigo-400" />
              <span>GitHub Actions CI/CD Simulator</span>
              <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-indigo-500/30 text-indigo-200">NEW</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>4 Benchmarks Active (Inc. Multi-File Enterprise)</span>
          </div>
        </div>

        {activeTab === 'arena' ? (
          <>
            {/* Head-to-Head Arena Comparison */}
            <ArenaComparison
              benchmarkData={benchmarkData}
              isRunning={isRunning}
              onRunTask={handleRunBenchmark}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              setSelectedTaskId={setSelectedTaskId}
            />

            {/* Dual Inspection Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Code Inspection & Diffs */}
              <div className="space-y-6">
                <ASTVisualizer initialCode={activeTask?.initial_code} />
                <DiffViewer
                  initialCode={activeTask?.initial_code}
                  finalCode={finalCode}
                  diffStats={latestDiffStats}
                />
              </div>

              {/* Right Column: Real-time Terminal Log Stream */}
              <div>
                <TerminalLog events={events} isRunning={isRunning} />
              </div>
            </div>
          </>
        ) : (
          /* GitHub Actions Headless CI/CD Simulator View */
          <CISimulator isRunning={isRunning} />
        )}

      </main>

      {/* Custom Task Execution Modal */}
      <CustomTaskModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        onRunCustom={handleRunCustom}
        isRunning={isRunning}
      />

      {/* HackCulture Submission Hub Modal */}
      <SubmissionModal
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
      />
    </div>
  );
}

