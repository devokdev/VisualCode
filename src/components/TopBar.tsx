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
    <header className="h-13 bg-[#131316]/80 backdrop-blur-xl border-b border-white/[0.06] px-5 flex items-center justify-between gap-4 select-none shrink-0 z-30 shadow-sm">
      {/* Brand & Search */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        <div
          onClick={() => onNavigateTab('editor')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#26262c] to-[#1a1a1f] border border-white/[0.08] flex items-center justify-center text-[#ffa116] shadow-inner group-hover:border-[#ffa116]/40 transition-colors">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#f4f4f5] group-hover:text-white transition-colors">
            VisualCode
          </span>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={problem ? `${problem.title} (Search another...)` : "Search any LeetCode problem..."}
            className="w-full bg-[#18181c]/90 border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#ffa116]/60 focus:bg-[#1f1f24] transition-all shadow-inner"
          />
        </form>

        <button
          onClick={() => onNavigateTab('problems')}
          className="p-1.5 text-[#71717a] hover:text-[#f4f4f5] rounded-lg hover:bg-white/[0.04] transition-colors"
          title="Problem Library"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>

      {/* Language Selector + API Key + Debug Drawer Toggle + Run Button */}
      <div className="flex items-center gap-2">
        {/* Language Tabs */}
        <div className="flex items-center bg-[#18181c] p-0.5 rounded-lg border border-white/[0.06]">
          {(['python', 'java', 'cpp'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === lang
                  ? 'bg-gradient-to-b from-[#2c2c34] to-[#222228] text-[#ffa116] shadow-sm border border-white/[0.06]'
                  : 'text-[#71717a] hover:text-[#d4d4d8]'
              }`}
            >
              {lang === 'python' ? 'Python' : lang === 'java' ? 'Java' : 'C++'}
            </button>
          ))}
        </div>

        {/* API Key Modal Button */}
        <button
          onClick={onOpenApiKeyModal}
          className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
          title="API Key Settings"
        >
          <Key className="w-4 h-4" />
        </button>

        {/* Debug Drawer Toggle */}
        <button
          onClick={onToggleDrawer}
          className={`p-1.5 rounded-lg border transition-all ${
            isDrawerOpen
              ? 'bg-[#ffa116]/10 border-[#ffa116]/30 text-[#ffa116]'
              : 'border-white/[0.06] text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.04]'
          }`}
          title="Toggle Debug Drawer"
        >
          <PanelRight className="w-4 h-4" />
        </button>

        {/* Glossy Primary Run Button */}
        <button
          onClick={onRun}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-gradient-to-b from-[#ffa116] to-[#e08905] hover:from-[#ffb23d] hover:to-[#ffa116] text-[#0d0d10] font-bold text-xs rounded-lg transition-all shadow-[0_2px_10px_rgba(255,161,22,0.2)] active:scale-95 disabled:opacity-40 flex items-center gap-1.5 border border-white/10"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Tracing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#0d0d10]" />
              <span>Run</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
