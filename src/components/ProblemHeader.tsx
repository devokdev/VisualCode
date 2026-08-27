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
    <div className="flex flex-col gap-3.5 bg-gradient-to-b from-[#13141c] to-[#0e0f15] border border-[#d4af37]/20 rounded-2xl p-5 shadow-2xl backdrop-blur">
      {/* Top Bar: Search & API Settings */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <form onSubmit={handleSubmit} className="flex-1 min-w-[280px] relative flex items-center">
          <Search className="w-4 h-4 text-[#8e897a] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search LeetCode problem by name or number (e.g. 'Validate BST', '226', 'Reverse Linked List')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0a0a0e] border border-[#d4af37]/25 rounded-xl pl-10 pr-24 py-2 text-xs text-[#e2e8f0] placeholder-[#716e7d] focus:outline-none focus:border-[#d4af37] transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 px-3 py-1 bg-[#d4af37] hover:bg-[#e2c069] disabled:bg-[#1a1b24] disabled:text-[#5a5766] text-[#0a0a0e] rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            {isLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              showSettings
                ? 'bg-[#1e1f2b] border-[#d4af37] text-[#e6c97a]'
                : 'bg-[#0a0a0e] border-[#d4af37]/25 text-[#9e9aa8] hover:text-[#f3f0e6]'
            }`}
            title="Configure OpenRouter API Key"
          >
            <Key className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>API Key</span>
          </button>
        </div>
      </div>

      {/* Quick Select Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[#8e897a] font-medium text-[11px] shrink-0">Popular:</span>
        {POPULAR_PROBLEMS.map((prob) => (
          <button
            key={prob}
            onClick={() => {
              setQuery(prob);
              onFetchProblem(prob);
            }}
            className="px-2.5 py-0.5 rounded-full bg-[#0a0a0e] border border-[#d4af37]/20 text-[#a39e90] hover:text-[#f3f0e6] hover:border-[#d4af37]/60 text-[11px] whitespace-nowrap transition-all"
          >
            {prob}
          </button>
        ))}
      </div>

      {/* API Key Drawer */}
      {showSettings && (
        <div className="p-3 bg-[#0a0a0e] rounded-xl border border-[#d4af37]/30 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#d4af37] shrink-0" />
          <input
            type="password"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="Enter OpenRouter API Key (sk-or-v1-...)"
            className="flex-1 bg-[#141520] border border-[#d4af37]/25 rounded-lg px-2.5 py-1 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#d4af37]"
          />
          <button
            onClick={handleSaveKey}
            className="px-3.5 py-1 bg-[#d4af37] hover:bg-[#e2c069] text-[#0a0a0e] rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          >
            {isSavedKey ? <Check className="w-3.5 h-3.5" /> : 'Save'}
          </button>
        </div>
      )}

      {/* Problem Details & Test Case Context */}
      {problem && (
        <div className="mt-1 pt-3.5 border-t border-[#d4af37]/15 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif-title text-base font-semibold text-[#f3f0e6] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                {problem.title}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  problem.difficulty === 'Easy'
                    ? 'badge-easy'
                    : problem.difficulty === 'Medium'
                    ? 'badge-medium'
                    : 'badge-hard'
                }`}
              >
                {problem.difficulty}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#181926] text-[#c4bfd0] border border-[#d4af37]/20 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#d4af37]" />
                {problem.dataStructureType.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {problem.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#141520] border border-[#d4af37]/15 text-[#9a95a6] rounded text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="text-xs text-[#c4bfb2] bg-[#0a0a0e]/90 p-3.5 rounded-xl border border-[#d4af37]/15 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-sans">
            {problem.description}
          </div>

          {/* Test Input Editor */}
          <div className="flex items-center gap-2 bg-[#0a0a0e]/90 p-2.5 rounded-xl border border-[#d4af37]/20">
            <span className="text-xs font-semibold text-[#a09a88] whitespace-nowrap">
              Active Test Input:
            </span>
            <input
              type="text"
              value={activeInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="e.g. root = [5,1,4,null,null,3,6]"
              className="flex-1 bg-[#141520] border border-[#d4af37]/20 rounded-lg px-2.5 py-1 text-xs text-[#e6c97a] font-mono focus:outline-none focus:border-[#d4af37]"
            />
            {problem.examples?.[0]?.output && (
              <span className="text-xs text-[#8e8a9c] font-mono whitespace-nowrap pl-2 border-l border-[#d4af37]/15">
                Expected: <span className="text-[#00b8a3] font-bold">{problem.examples[0].output}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
