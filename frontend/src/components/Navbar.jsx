import React, { useState } from 'react';
import { Zap, Cpu, Key, ShieldCheck, HelpCircle, Code, Layers } from 'lucide-react';

export default function Navbar({ apiKey, setApiKey, activeTask, onCustomClick, onDeckClick, onSubmissionClick }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setShowKeyModal(false);
  };

  return (
    <header className="border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-slate-950 font-mono">
            <Zap className="h-5 w-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-white font-mono">AXIOM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider font-mono">
                Autonomous Self-Healing CI/CD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Fewest Tokens Track • Global AI Hackathon Elimination Round</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onSubmissionClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition shadow-lg shadow-emerald-500/10 animate-pulse"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>HackCulture Hub</span>
          </button>

          <button
            onClick={onCustomClick}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Code className="h-4 w-4 text-teal-400" />
            <span>Custom Code</span>
          </button>

          <button
            onClick={onDeckClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition"
          >
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Pitch Deck</span>
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              apiKey
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">{apiKey ? 'API Key Active' : 'API Key'}</span>
          </button>
        </div>
      </div>

      {/* Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <Key className="h-5 w-5 text-emerald-400" />
                <span>Gemini API Key Configuration</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Google Gemini API key to run live real-time LLM inference. If left blank, Axiom automatically executes in high-fidelity deterministic benchmark synthesizer mode so your judging demo never crashes or runs out of quota.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

