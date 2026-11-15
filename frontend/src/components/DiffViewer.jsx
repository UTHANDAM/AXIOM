import React, { useState } from 'react';
import { GitCommit, Plus, Minus, Check, Code2, Eye } from 'lucide-react';

export default function DiffViewer({ initialCode, finalCode, diffStats }) {
  const [tab, setTab] = useState('diff'); // 'diff' or 'final'

  if (!finalCode) {
    return (
      <div className="card-blur rounded-2xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
        Run a benchmark or task to inspect the synthesized unified diff and final verified code.
      </div>
    );
  }

  const changes = diffStats?.changes || [];
  const linesAdded = diffStats?.lines_added || 0;
  const linesRemoved = diffStats?.lines_removed || 0;

  return (
    <div className="card-blur rounded-2xl border border-slate-800 overflow-hidden">
      {/* Diff Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <GitCommit className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Synthesized Unified Patch
          </span>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center space-x-1">
              <Plus className="h-3 w-3" />
              <span>{linesAdded}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center space-x-1">
              <Minus className="h-3 w-3" />
              <span>{linesRemoved}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setTab('diff')}
            className={`px-3 py-1 rounded-lg transition ${
              tab === 'diff' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unified Diff
          </button>
          <button
            onClick={() => setTab('final')}
            className={`px-3 py-1 rounded-lg transition ${
              tab === 'final' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Final Verified Code
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-96">
        {tab === 'diff' ? (
          <div className="space-y-0.5">
            {changes.length > 0 ? (
              changes.map((c, i) => (
                <div
                  key={i}
                  className={`flex px-3 py-0.5 rounded ${
                    c.type === 'added'
                      ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400'
                      : c.type === 'removed'
                      ? 'bg-red-500/15 text-red-300 border-l-2 border-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-6 select-none opacity-50 font-bold">
                    {c.type === 'added' ? '+' : c.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre">{c.line}</span>
                </div>
              ))
            ) : (
              <pre className="text-slate-400">{diffStats?.unified_diff || 'No changes.'}</pre>
            )}
          </div>
        ) : (
          <pre className="text-slate-200 leading-relaxed whitespace-pre">{finalCode}</pre>
        )}
      </div>

      <div className="px-5 py-2.5 bg-slate-900/30 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          🛡️ <strong>Token Principle:</strong> Only the minimal diff is transmitted and verified, preventing full-file regeneration token waste.
        </span>
        <span className="text-emerald-400 font-mono flex items-center space-x-1">
          <Check className="h-3.5 w-3.5" />
          <span>AST Verified Atomically</span>
        </span>
      </div>
    </div>
  );
}

