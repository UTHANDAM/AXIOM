import React, { useState } from 'react';
import { GitPullRequest, CheckCircle2, XCircle, Play, ShieldCheck, Zap, Terminal, RefreshCw, ArrowRight, GitCommit, FileCode, Check } from 'lucide-react';

export default function CISimulator({ isRunning }) {
  const [ciState, setCiState] = useState('idle'); // 'idle', 'failing', 'healing', 'fixed'
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { name: '1. git checkout & setup python 3.12', status: 'done', duration: '1.1s' },
    { name: '2. pytest tests/ -v (Initial CI Run)', status: ciState === 'idle' ? 'idle' : ciState === 'failing' || ciState === 'healing' ? 'failed' : 'failed', duration: '2.4s' },
    { name: '3. Axiom Action: AST Multi-File Skeletonizer', status: ciState === 'healing' || ciState === 'fixed' ? 'done' : 'waiting', duration: '0.2s', detail: 'Pruned 1,420 lines -> 180 lines (-87.3% tokens)' },
    { name: '4. Axiom Action: Narrow-Context Zoom', status: ciState === 'healing' || ciState === 'fixed' ? 'done' : 'waiting', duration: '0.1s', detail: 'Isolated `DiscountEngine.compute_final_price` (18 lines)' },
    { name: '5. Axiom Action: Synthesize Unified Diff', status: ciState === 'healing' || ciState === 'fixed' ? 'done' : 'waiting', duration: '0.8s', detail: 'Generated +3/-2 line search-replace block' },
    { name: '6. Pytest Re-execution in Isolated Container', status: ciState === 'fixed' ? 'done' : 'waiting', duration: '1.8s', detail: '100% assertions passing (0 errors)' },
    { name: '7. Auto-commit & Post PR Verification Summary', status: ciState === 'fixed' ? 'done' : 'waiting', duration: '0.4s', detail: 'Commit c9a4f21 applied atomically' }
  ];

  const handleSimulate = () => {
    setCiState('failing');
    setActiveStep(1);

    setTimeout(() => {
      setCiState('healing');
      setActiveStep(4);
    }, 1200);

    setTimeout(() => {
      setCiState('fixed');
      setActiveStep(7);
    }, 2800);
  };

  const handleReset = () => {
    setCiState('idle');
    setActiveStep(0);
  };

  return (
    <div className="card-blur rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Enterprise Feature
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <GitPullRequest className="h-5 w-5 text-indigo-400" />
            <span>Autonomous GitHub Actions CI/CD Healing Simulator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate how Axiom acts as a headless GitHub Action bot (`.github/workflows/axiom.yml`), automatically resolving failing test builds under a $0.02 token ceiling.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {ciState === 'fixed' && (
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              Reset Simulation
            </button>
          )}

          <button
            onClick={handleSimulate}
            disabled={ciState === 'healing'}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition ${
              ciState === 'healing'
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : ciState === 'fixed'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-white shadow-indigo-500/20'
            }`}
          >
            {ciState === 'healing' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-teal-300" />
                <span>Auto-Healing CI Pipeline...</span>
              </>
            ) : ciState === 'fixed' ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Re-run Simulation</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Simulate Failing PR Build</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulated GitHub PR Container */}
      <div className="bg-[#0b101c] rounded-2xl border border-slate-800/90 overflow-hidden font-mono text-xs shadow-inner">
        {/* GitHub Header */}
        <div className="px-4 py-3 bg-[#0f172a]/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center space-x-1 ${
              ciState === 'fixed'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : ciState === 'failing' || ciState === 'healing'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {ciState === 'fixed' ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Checks Passed</span>
                </>
              ) : ciState === 'failing' || ciState === 'healing' ? (
                <>
                  <XCircle className="h-3 w-3" />
                  <span>Checks Failing</span>
                </>
              ) : (
                <span>PR #42 Draft</span>
              )}
            </span>
            <span className="text-white font-semibold">fix(billing): resolve coupon stacking boundary bug</span>
            <span className="text-slate-500">on main</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center space-x-2">
            <span>Workflow: <code className="text-indigo-300">axiom-self-heal.yml</code></span>
          </div>
        </div>

        {/* Step Breakdown */}
        <div className="p-4 space-y-2.5">
          {steps.map((st, i) => (
            <div
              key={i}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-xl border transition ${
                st.status === 'failed'
                  ? 'bg-red-950/20 border-red-900/40 text-red-300'
                  : st.status === 'done'
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                  : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {st.status === 'failed' ? (
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                ) : st.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-700 flex-shrink-0"></div>
                )}
                <div>
                  <span className="font-semibold text-slate-200">{st.name}</span>
                  {st.detail && (
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {st.detail}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 sm:mt-0">{st.duration}</span>
            </div>
          ))}
        </div>

        {/* Simulated PR Comment */}
        {ciState === 'fixed' && (
          <div className="m-4 p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-md bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px] font-mono">
                  A
                </div>
                <span className="font-bold text-white text-xs">axiom-bot[bot] commented 2 seconds ago</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                  Automated Self-Healing Verified
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">$0.00008 USD</span>
            </div>

            <div className="text-xs text-slate-300 space-y-2 font-sans">
              <p>
                Axiom detected a test failure on commit <code className="text-cyan-400 font-mono">b8f3e12</code> and synthesized a surgical patch.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] py-1">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[9px]">TOKENS USED</div>
                  <div className="text-emerald-400 font-bold">549 tokens</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[9px]">TOKENS SAVED</div>
                  <div className="text-teal-300 font-bold">11,451 (-95.4%)</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[9px]">LATENCY</div>
                  <div className="text-slate-200 font-bold">2.57s</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[9px]">VERIFICATION</div>
                  <div className="text-emerald-400 font-bold">100% Passed</div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                <div className="text-slate-500 text-[10px] mb-1">PATCH APPLIED (3 lines added, 2 lines removed):</div>
                <div className="text-red-400">-        pct_deduction = gross_subtotal * (self.vip_discount_pct / 100.0)</div>
                <div className="text-emerald-400">+        subtotal_after_flat = max(0.0, gross_subtotal - flat_deduction)</div>
                <div className="text-emerald-400">+        pct_deduction = subtotal_after_flat * (self.vip_discount_pct / 100.0)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
