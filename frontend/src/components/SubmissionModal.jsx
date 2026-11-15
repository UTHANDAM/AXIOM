import React, { useState } from 'react';
import { Award, Copy, Check, X, ExternalLink, FileText, Video, Github, Layers } from 'lucide-react';

export default function SubmissionModal({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const projectTitle = "AXIOM — Autonomous Self-Healing CI/CD on the Fewest Tokens";
  
  const problemStatementText = "AI Agents & Intelligent Systems: Build a coding agent that gets the job done on the fewest tokens possible, eliminating context bloat and enterprise cost barriers through progressive AST disclosure.";

  const videoScriptSummary = `Title: Axiom — Autonomous Software Engineering on the Fewest Tokens
Duration: 2:45 min
Structure:
[0:00 - 0:30] The Runaway Token Crisis: Existing SWE agents dump 500 lines into context, costing $0.30-$1.50 per bug fix.
[0:30 - 1:15] The 4-Pillar Axiom Engine: AST Skeletonizer (-85%), Narrow Scope Zoom, Trace Pruning, and Unified Search-Replace Diffs (-95% output tokens).
[1:15 - 2:00] Live Head-to-Head Arena: Axiom solves LRU Cache in 1,850 tokens vs 16,800 baseline (89.0% savings, 1.2s latency, 100% Pytest pass rate).
[2:00 - 2:30] Headless GitHub Actions CI/CD Bot: Auto-remediation on breaking pull requests with zero developer overhead.
[2:30 - 2:45] Enterprise Feasibility & Judging Conclusion.`;

  const repoInstructions = `# Push Axiom to your GitHub:
git remote add origin https://github.com/<your-username>/axiom-agent.git
git branch -M main
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">HackCulture Hackathon Submission Hub</h3>
              <p className="text-xs text-slate-400">Pre-formatted submission fields ready to copy into the portal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Fields List */}
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 text-xs">
          
          {/* Field 1: Theme & Problem Statement */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                1. Theme & Problem Statement
              </label>
              <button
                onClick={() => copyToClipboard(problemStatementText, 'problem')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
              >
                {copiedKey === 'problem' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'problem' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              {problemStatementText}
            </div>
          </div>

          {/* Field 2: Project Title */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                2. Project Title
              </label>
              <button
                onClick={() => copyToClipboard(projectTitle, 'title')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
              >
                {copiedKey === 'title' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'title' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-white font-mono text-sm bg-slate-950 p-2.5 rounded-xl border border-slate-850 font-bold">
              {projectTitle}
            </div>
          </div>

          {/* Field 3: Pitch Deck PPT */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                3. PPT / Presentation Deck
              </label>
              <a
                href="/pitch_deck/presentation.html"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 flex items-center space-x-1 font-semibold"
              >
                <span>Open Presentation</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Open the interactive 8-slide presentation at <code className="text-indigo-300">pitch_deck/presentation.html</code>. You can press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">Ctrl+P</kbd> to save as PDF to drag-and-drop directly into the "PPT File" portal field.
            </p>
          </div>

          {/* Field 4: Video Script */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                4. Video Demo Script & Screen Cues
              </label>
              <button
                onClick={() => copyToClipboard(videoScriptSummary, 'script')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
              >
                {copiedKey === 'script' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'script' ? 'Copied Script' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-850 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {videoScriptSummary}
            </pre>
          </div>

          {/* Field 5: GitHub Push Instructions */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                5. GitHub Repository Push
              </label>
              <button
                onClick={() => copyToClipboard(repoInstructions, 'git')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
              >
                {copiedKey === 'git' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'git' ? 'Copied Git Commands' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              {repoInstructions}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
}
