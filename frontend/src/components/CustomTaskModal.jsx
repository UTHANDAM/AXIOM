import React, { useState } from 'react';
import { Code, Play, X, Zap } from 'lucide-react';

export default function CustomTaskModal({ isOpen, onClose, onRunCustom, isRunning }) {
  const [title, setTitle] = useState('Binary Search Boundary Edge Case');
  const [desc, setDesc] = useState('Fix binary search implementation where integer division causes an infinite loop when target is greater than mid.');
  const [budget, setBudget] = useState(2500);
  const [code, setCode] = useState(`def binary_search(arr, target):
    \"\"\"Finds index of target in sorted array arr.\"\"\"
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # BUG: left was not incremented properly
            left = mid
        else:
            right = mid - 1
    return -1
`);
  const [testCode, setTestCode] = useState(`def test_binary_search_found():
    arr = [1, 3, 5, 7, 9, 11]
    assert binary_search(arr, 7) == 3
    assert binary_search(arr, 1) == 0
    assert binary_search(arr, 11) == 5

def test_binary_search_not_found():
    arr = [2, 4, 6, 8]
    assert binary_search(arr, 5) == -1
`);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRunCustom({
      title,
      description: desc,
      initial_code: code,
      test_code: testCode,
      budget: Number(budget)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Execute Custom Challenge in Axiom</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Challenge Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Token Budget Ceiling</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Problem Category</label>
              <span className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 block">
                User Custom Suite
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Requirement / Bug Description</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Buggy Python Source Code</label>
            <textarea
              rows={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-emerald-300 text-xs"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Pytest Unit Test Suite</label>
            <textarea
              rows={5}
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-cyan-300 text-xs"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRunning}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Launch Axiom on Custom Code</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

