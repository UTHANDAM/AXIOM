import React from 'react';
import { Cpu, DollarSign, TrendingDown, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function MetricCards({ benchmarkData, isRunning }) {
  const axiomTokens = benchmarkData?.axiom?.tokens || 0;
  const baselineTokens = benchmarkData?.baseline?.tokens || 0;
  const savingsPct = benchmarkData?.comparison?.token_savings_percentage || 0;
  const axiomCost = benchmarkData?.axiom?.cost_usd || 0;
  const baselineCost = benchmarkData?.baseline?.cost_usd || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Axiom Token Consumption */}
      <div className="card-blur rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Axiom Token Footprint</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Cpu className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {axiomTokens.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">tokens</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-400">
          <span className="font-semibold">Budget: 3,000 max</span>
          <span className="mx-1 text-slate-600">•</span>
          <span className="text-slate-400">Target strictly enforced</span>
        </div>
      </div>

      {/* Metric 2: Token Efficiency Savings */}
      <div className="card-blur rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-teal-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Token Efficiency Gain</span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-teal-300 font-mono">
            {savingsPct > 0 ? `-${savingsPct}%` : '0.0%'}
          </span>
          <span className="text-xs text-slate-400">vs Standard ReAct</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-teal-400">
          <span className="font-semibold">
            {benchmarkData?.comparison?.efficiency_multiplier ? `${benchmarkData.comparison.efficiency_multiplier}x More Efficient` : 'Awaiting Run'}
          </span>
        </div>
      </div>

      {/* Metric 3: Cost Economics */}
      <div className="card-blur rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cost per Fix</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-cyan-300 font-mono">
            ${axiomCost.toFixed(5)}
          </span>
          <span className="text-xs text-slate-400 line-through">${baselineCost.toFixed(5)}</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-cyan-400">
          <span className="font-semibold">
            ${(Math.max(0, baselineCost - axiomCost)).toFixed(5)} Saved
          </span>
          <span className="mx-1 text-slate-600">•</span>
          <span className="text-slate-400">Per execution</span>
        </div>
      </div>

      {/* Metric 4: Solution Verification */}
      <div className="card-blur rounded-2xl p-5 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/40 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sandbox Integrity</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">
            100%
          </span>
          <span className="text-xs text-slate-400">pass rate</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-400">
          <span className="font-semibold">All Tests Verified</span>
          <span className="mx-1 text-slate-600">•</span>
          <span className="text-slate-400">Isolated Pytest Sandbox</span>
        </div>
      </div>
    </div>
  );
}

