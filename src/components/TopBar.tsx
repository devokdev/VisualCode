import React, { useState, useEffect, useRef } from 'react';
import type { Language, ProblemContext } from '../types';
import { Search, Play, Sparkles, Key, Code2, PanelRight, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { searchCatalogInstantly, type CatalogProblem } from '../data/leetcodeCatalog';
import { searchLeetCodeLive, type LeetCodeSearchResult } from '../services/leetcodeScraper';

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [suggestions, setSuggestions] = useState<Array<CatalogProblem | LeetCodeSearchResult>>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions instantly on input change + debounce live LeetCode search
  useEffect(() => {
    if (!query.trim()) {
      // If query is empty and input is focused, show popular curated list
      setSuggestions(searchCatalogInstantly('', 6));
      setSelectedIndex(-1);
      return;
    }

    // 1. Instant 0ms local catalog search
    const localMatches = searchCatalogInstantly(query, 6);
    setSuggestions(localMatches);
    setSelectedIndex(-1);

    // 2. Debounced live LeetCode GraphQL fetch for any custom query
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearchingLive(true);
        try {
          const live = await searchLeetCodeLive(query.trim());
          if (live && live.length > 0) {
            // Deduplicate by slug
            const seen = new Set(localMatches.map((m) => m.slug));
            const merged: Array<CatalogProblem | LeetCodeSearchResult> = [...localMatches];
            for (const item of live) {
              if (!seen.has(item.slug)) {
                seen.add(item.slug);
                merged.push(item);
              }
            }
            setSuggestions(merged.slice(0, 8));
          }
        } catch (e) {
          // ignore error
        } finally {
          setIsSearchingLive(false);
        }
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProblem = (item: CatalogProblem | LeetCodeSearchResult) => {
    onSearch(item.slug || String(item.id) || item.title);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelectProblem(suggestions[selectedIndex]);
      return;
    }
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <header className="h-13 bg-[#131316]/80 backdrop-blur-xl border-b border-white/[0.06] px-5 flex items-center justify-between gap-4 select-none shrink-0 z-30 shadow-sm relative">
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

        {/* Global Search Bar with Live Autocomplete Dropdown */}
        <div ref={containerRef} className="flex-1 relative">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={problem ? `${problem.title} (Search or enter #)` : "Search LeetCode problem (e.g. 189, Two Sum)..."}
              className="w-full bg-[#18181c]/90 border border-white/[0.07] rounded-lg pl-8 pr-8 py-1.5 text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-none focus:border-[#ffa116]/60 focus:bg-[#1f1f24] transition-all shadow-inner"
            />

            {isSearchingLive && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Sparkles className="w-3 h-3 text-[#ffa116] animate-spin" />
              </div>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#18181e] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 divide-y divide-white/[0.04]">
              <div className="px-3 py-1.5 bg-[#141418] text-[10px] font-mono text-[#71717a] flex items-center justify-between">
                <span>{query ? 'SEARCH SUGGESTIONS' : 'POPULAR PROBLEMS'}</span>
                <span>↑↓ navigate • ↵ select</span>
              </div>

              <div className="max-h-72 overflow-y-auto py-1">
                {suggestions.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const difficultyColor =
                    item.difficulty === 'Easy'
                      ? 'text-[#2cbb5d] bg-[#2cbb5d]/10 border-[#2cbb5d]/20'
                      : item.difficulty === 'Medium'
                      ? 'text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/20'
                      : 'text-[#ef4743] bg-[#ef4743]/10 border-[#ef4743]/20';

                  return (
                    <div
                      key={item.slug || item.id}
                      onClick={() => handleSelectProblem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#282832] text-white' : 'hover:bg-[#1f1f26] text-[#d4d4d8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-mono text-[#71717a] font-semibold shrink-0">
                          #{item.id}
                        </span>
                        <span className="text-xs font-semibold truncate">
                          {item.title}
                        </span>
                        {'category' in item && item.category && (
                          <span className="text-[10px] text-[#71717a] font-mono truncate hidden sm:inline">
                            • {item.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${difficultyColor}`}
                        >
                          {item.difficulty}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-[#ffa116]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
