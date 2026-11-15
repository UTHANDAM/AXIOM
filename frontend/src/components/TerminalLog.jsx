import React, { useRef, useEffect } from 'react';
import { Terminal, Activity, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TerminalLog({ events, isRunning }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="card-blur rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[420px]">
      {/* Terminal Title Bar */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Agent Reasoning & Telemetry Stream
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isRunning && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>LIVE SSE STREAM</span>
            </div>
          )}
          <span className="text-xs text-slate-500 font-mono">{events.length} events logged</span>
        </div>
      </div>

      {/* Terminal Stream Body */}
      <div className="p-4 bg-slate-950 font-mono text-xs overflow-y-auto flex-1 space-y-3">
        {events.length === 0 ? (
          <div className="text-slate-600 text-center py-20 flex flex-col items-center justify-center space-y-2">
            <Terminal className="h-8 w-8 text-slate-700" />
            <p>Awaiting task initiation. Click "Run Head-to-Head Arena" to start streaming.</p>
          </div>
        ) : (
          events.map((evt, idx) => {
            const type = evt.type;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      type === 'INIT'
                        ? 'bg-blue-500/20 text-blue-400'
                        : type === 'AST_PRUNE'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : type === 'CONTEXT_ZOOM'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : type === 'AGENT_STEP'
                        ? 'bg-purple-500/20 text-purple-400'
                        : type === 'PATCH_APPLIED'
                        ? 'bg-teal-500/20 text-teal-300'
                        : type === 'TEST_SUCCESS'
                        ? 'bg-green-500/20 text-green-300'
                        : type === 'COMPLETED'
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {type}
                  </span>
                  {evt.telemetry && (
                    <span className="text-slate-400 font-mono text-[10px]">
                      Tokens: +{evt.telemetry.total_turn_tokens} (Cum: {evt.telemetry.cumulative_tokens}) • Left: {evt.telemetry.remaining_budget}
                    </span>
                  )}
                </div>

                {evt.message && (
                  <p className="text-slate-200 text-xs leading-relaxed">{evt.message}</p>
                )}

                {evt.thought && (
                  <div className="text-slate-400 text-[11px] italic pl-2 border-l-2 border-purple-500/40">
                    "{evt.thought}"
                  </div>
                )}

                {evt.pruned_trace && (
                  <pre className="text-red-400/90 text-[10px] bg-red-950/20 p-2 rounded-lg border border-red-900/30 overflow-x-auto">
                    {evt.pruned_trace}
                  </pre>
                )}

                {evt.diff_stats && (
                  <div className="text-[11px] text-teal-400 flex items-center space-x-2 font-mono">
                    <span>Patch: +{evt.diff_stats.lines_added} / -{evt.diff_stats.lines_removed} lines</span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

