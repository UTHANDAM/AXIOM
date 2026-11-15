import React, { useState, useEffect } from 'react';
import { Code, Eye, FileCode, Sparkles, Filter } from 'lucide-react';

export default function ASTVisualizer({ initialCode }) {
  const [viewMode, setViewMode] = useState('skeleton'); // 'skeleton', 'raw', 'symbols'
  const [skeletonData, setSkeletonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialCode) return;
    setLoading(true);
    fetch('/api/ast/skeletonize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: initialCode, keep_docstrings: true })
    })
      .then((res) => res.json())
      .then((data) => {
        setSkeletonData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [initialCode]);

  return (
    <div className="card-blur rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header Tabs */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            AST Context Compression Explorer
          </span>
          {skeletonData?.metadata && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              {skeletonData.metadata.savings_ratio}% Context Tokens Pruned
            </span>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setViewMode('skeleton')}
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'skeleton'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AST Skeleton (Agent View)
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'raw'
                ? 'bg-slate-800 text-slate-200 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Unpruned Code
          </button>
          <button
            onClick={() => setViewMode('symbols')}
            className={`px-3 py-1 rounded-lg transition ${
              viewMode === 'symbols'
                ? 'bg-teal-500/20 text-teal-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Symbol Table ({skeletonData?.symbols?.length || 0})
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 bg-slate-950/80 font-mono text-xs overflow-x-auto max-h-96">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Computing AST structure...</div>
        ) : viewMode === 'skeleton' ? (
          <pre className="text-emerald-300/90 leading-relaxed whitespace-pre">
            {skeletonData?.skeleton || 'No skeleton available.'}
          </pre>
        ) : viewMode === 'raw' ? (
          <pre className="text-slate-300 leading-relaxed whitespace-pre">
            {initialCode || 'No code provided.'}
          </pre>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 text-[11px] font-semibold text-slate-400 pb-2 border-b border-slate-800">
              <span>SYMBOL NAME</span>
              <span>KIND</span>
              <span>LINE RANGE</span>
              <span>DOCSTRING</span>
            </div>
            {skeletonData?.symbols?.map((sym, idx) => (
              <div
                key={idx}
                className="grid grid-cols-4 py-1.5 px-2 rounded-lg bg-slate-900/40 text-slate-300 hover:bg-slate-800/50 text-[11px]"
              >
                <span className="text-emerald-400 font-bold">{sym.name}</span>
                <span className="text-slate-400">{sym.kind}</span>
                <span className="text-cyan-400 font-mono">Lines {sym.start_line}-{sym.end_line}</span>
                <span className="text-slate-500 truncate">{sym.docstring || 'None'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explanation Footer */}
      <div className="px-5 py-2.5 bg-slate-900/30 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          💡 <strong>Mechanism:</strong> Python standard AST extracts signatures & type hints, replacing implementations with <code className="text-emerald-400">...</code> until targeted.
        </span>
        <span className="font-mono text-emerald-400">
          Original: {skeletonData?.metadata?.original_lines || 0} lines → Pruned: {skeletonData?.metadata?.skeleton_lines || 0} lines
        </span>
      </div>
    </div>
  );
}

