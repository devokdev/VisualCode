import React, { useState } from 'react';
import type { ProblemContext } from '../types';
import { Search, Sparkles, BookOpen, Layers, Key, Check } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/openrouter';

interface ProblemHeaderProps {
  problem: ProblemContext | null;
  onFetchProblem: (query: string) => void;
  isLoading: boolean;
  activeInput: string;
  onInputChange: (val: string) => void;
}

const POPULAR_PROBLEMS = [
  '98. Validate Binary Search Tree',
  '226. Invert Binary Tree',
  '700. Search in a Binary Search Tree',
  '701. Insert into a Binary Search Tree',
  '200. Number of Islands',
  '206. Reverse Linked List',
  '1. Two Sum',
  '11. Container With Most Water',
];

export const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  problem,
  onFetchProblem,
  isLoading,
  activeInput,
  onInputChange,
}) => {
  const [query, setQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState(getApiKey());
  const [isSavedKey, setIsSavedKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onFetchProblem(query.trim());
    }
  };

  const handleSaveKey = () => {
    setApiKey(customKey);
    setIsSavedKey(true);
    setTimeout(() => setIsSavedKey(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur">
      {/* Top Bar: Search & API Settings */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <form onSubmit={handleSubmit} className="flex-1 min-w-[280px] relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search LeetCode problem by name/number (e.g. 'Validate BST', '226', 'Reverse Linked List')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg pl-9 pr-24 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-md text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
          >
            {isLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
              showSettings
                ? 'bg-slate-800 border-sky-500 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Configure OpenRouter API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Key</span>
          </button>
        </div>
      </div>

      {/* Quick Select Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-500 font-medium text-[11px] shrink-0">Popular:</span>
        {POPULAR_PROBLEMS.map((prob) => (
          <button
            key={prob}
            onClick={() => {
              setQuery(prob);
              onFetchProblem(prob);
            }}
            className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-sky-300 hover:border-sky-700 text-[11px] whitespace-nowrap transition-all"
          >
            {prob}
          </button>
        ))}
      </div>

      {/* API Key Drawer */}
      {showSettings && (
        <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 flex items-center gap-2">
          <Key className="w-4 h-4 text-sky-400 shrink-0" />
          <input
            type="password"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="Enter OpenRouter API Key (sk-or-v1-...)"
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={handleSaveKey}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-all flex items-center gap-1"
          >
            {isSavedKey ? <Check className="w-3.5 h-3.5" /> : 'Save'}
          </button>
        </div>
      )}

      {/* Problem Details & Test Case Context */}
      {problem && (
        <div className="mt-1 pt-3 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                {problem.title}
              </h2>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  problem.difficulty === 'Easy'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : problem.difficulty === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {problem.difficulty}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {problem.dataStructureType.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {problem.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
            {problem.description}
          </div>

          {/* Test Input Editor */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Active Test Input:
            </span>
            <input
              type="text"
              value={activeInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="e.g. root = [5,1,4,null,null,3,6]"
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-sky-200 font-mono focus:outline-none focus:border-sky-500"
            />
            {problem.examples?.[0]?.output && (
              <span className="text-xs text-slate-400 font-mono whitespace-nowrap pl-2 border-l border-slate-800">
                Expected: <span className="text-emerald-400 font-bold">{problem.examples[0].output}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
