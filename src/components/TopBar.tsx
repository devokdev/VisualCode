import React, { useState } from 'react';
import type { Language, ProblemContext } from '../types';
import { Search, Play, Sparkles, Key, Code2, PanelRight, BookOpen } from 'lucide-react';

interface TopBarProps {
  problem: ProblemContext | null;
  onSearch: (query: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRun: () => void;
  isLoading: boolean;
  onOpenApiKeyModal: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onNavigateTab: (tab: 'editor' | 'problems') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  problem,
  onSearch,
  language,
  onLanguageChange,
  onRun,
  isLoading,
  onOpenApiKeyModal,
  isDrawerOpen,
  onToggleDrawer,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <header className="h-14 bg-[#221D1A] border-b border-[#3D322A] px-6 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Brand & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div
          onClick={() => onNavigateTab('editor')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#171412] border border-[#3D322A] flex items-center justify-center text-[#B38A4A]">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#EAE5DF]">VisualCode</span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-[#6B625B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={problem ? `${problem.title} (Type to search another...)` : "Search any LeetCode problem..."}
            className="w-full bg-[#171412] border border-[#3D322A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#EAE5DF] placeholder-[#6B625B] focus:outline-none focus:border-[#B38A4A] transition-colors"
          />
        </form>

        <button
          onClick={() => onNavigateTab('problems')}
          className="p-1.5 text-[#9E948C] hover:text-[#EAE5DF] rounded-lg hover:bg-[#171412] transition-colors"
          title="Problem Library"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Language Selector + API Key + Debug Drawer Toggle + Run Button */}
      <div className="flex items-center gap-3">
        {/* Language Tabs */}
        <div className="flex items-center bg-[#171412] p-0.5 rounded-lg border border-[#3D322A]">
          {(['python', 'java', 'cpp'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                language === lang
                  ? 'bg-[#2A2421] text-[#B38A4A]'
                  : 'text-[#6B625B] hover:text-[#9E948C]'
              }`}
            >
              {lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
            </button>
          ))}
        </div>

        {/* API Key Modal Button */}
        <button
          onClick={onOpenApiKeyModal}
          className="p-2 rounded-lg text-[#9E948C] hover:text-[#EAE5DF] hover:bg-[#171412] transition-colors"
          title="API Key Settings"
        >
          <Key className="w-4 h-4" />
        </button>

        {/* Debug Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          className={`p-2 rounded-lg border transition-colors ${
            isDrawerOpen
              ? 'bg-[#2A2421] border-[#B38A4A] text-[#B38A4A]'
              : 'border-[#3D322A] text-[#9E948C] hover:text-[#EAE5DF]'
          }`}
          title="Toggle Debug Drawer (Variables, Call Stack, Output)"
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Primary Run & Visualize Button */}
        <button
          onClick={onRun}
          disabled={isLoading}
          className="px-4 py-1.5 bg-[#B38A4A] hover:bg-[#C59B58] text-[#171412] font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Tracing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#171412]" />
              <span>Run</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
