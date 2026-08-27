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
    <header className="h-12 bg-[#1a1a1a] border-b border-[#333333] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      {/* Brand & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div
          onClick={() => onNavigateTab('editor')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-[#242424] border border-[#3a3a3a] flex items-center justify-center text-[#ffa116]">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#eff1f6]">VisualCode</span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-[#8c8c8c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={problem ? `${problem.title} (Search another problem...)` : "Search any LeetCode problem..."}
            className="w-full bg-[#242424] border border-[#333333] rounded-lg pl-8 pr-3 py-1 text-xs text-[#eff1f6] placeholder-[#8c8c8c] focus:outline-none focus:border-[#ffa116] transition-colors"
          />
        </form>

        <button
          onClick={() => onNavigateTab('problems')}
          className="p-1.5 text-[#8c8c8c] hover:text-[#eff1f6] rounded-lg hover:bg-[#242424] transition-colors"
          title="Problem Library"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Language Selector + API Key + Debug Drawer Toggle + Run Button */}
      <div className="flex items-center gap-2.5">
        {/* Language Tabs */}
        <div className="flex items-center bg-[#242424] p-0.5 rounded-lg border border-[#333333]">
          {(['python', 'java', 'cpp'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                language === lang
                  ? 'bg-[#333333] text-[#ffa116]'
                  : 'text-[#8c8c8c] hover:text-[#eff1f6]'
              }`}
            >
              {lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
            </button>
          ))}
        </div>

        {/* API Key Modal Button */}
        <button
          onClick={onOpenApiKeyModal}
          className="p-1.5 rounded-lg text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#242424] transition-colors"
          title="API Key Settings"
        >
          <Key className="w-4 h-4" />
        </button>

        {/* Debug Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDrawerOpen
              ? 'bg-[#2d2d2d] border-[#ffa116] text-[#ffa116]'
              : 'border-[#333333] text-[#8c8c8c] hover:text-[#eff1f6] hover:bg-[#242424]'
          }`}
          title="Toggle Side Debug Drawer"
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Primary Run Button */}
        <button
          onClick={onRun}
          disabled={isLoading}
          className="px-3.5 py-1 bg-[#ffa116] hover:bg-[#ffb23d] text-[#141414] font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Tracing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#141414]" />
              <span>Run</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
