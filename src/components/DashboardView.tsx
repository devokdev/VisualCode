import React, { useState } from 'react';
import { Search, Key, BookOpen, Code2, Eye, ShieldCheck, ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface DashboardViewProps {
  onSelectProblem: (query: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings') => void;
  onOpenApiKeyModal: () => void;
  recentSearchedProblems: string[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectProblem,
  onNavigateTab,
  onOpenApiKeyModal,
  recentSearchedProblems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSelectProblem(searchQuery.trim());
      onNavigateTab('editor');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-8 max-w-[1400px] mx-auto w-full">
      {/* Top Search & User Bar */}
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
          <Search className="w-4 h-4 text-[#8a8a8e] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ANY LeetCode problem (e.g. 'Binary Tree Right Side View', '98', 'Invert Tree')..."
            className="w-full bg-[#1e1e1e] border border-[#333333] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#eff1f6] placeholder-[#666666] focus:outline-none focus:border-[#ffa116] transition-all shadow-inner"
          />
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1e1e1e] border border-[#333333] text-[#ffa116] text-xs font-semibold hover:bg-[#262626] transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Key</span>
          </button>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#eff1f6]">
            {getGreeting()}, <span className="text-[#ffa116]">Developer.</span>
          </h2>
          <p className="text-xs text-[#8a8a8e] mt-1">
            Understand algorithm execution, pointer behavior, and classify bugs in Python, Java, and C++.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-[#1e1e1e] border border-[#333333]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#ffa116] block">AI Tracer</span>
            <span className="text-xs text-[#8a8a8e] font-mono">Gemini 2.5 Flash</span>
          </div>
          <Sparkles className="w-5 h-5 text-[#ffa116]" />
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="rounded-2xl border border-[#2e2e2e] bg-[#1e1e1e] p-6 shadow-xl">
        <h3 className="text-sm font-bold text-[#eff1f6] mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTab('problems')}
            className="p-5 rounded-xl bg-[#181818] border border-[#2a2a2a] flex flex-col items-center text-center cursor-pointer hover:border-[#ffa116] hover:bg-[#222222] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center text-[#ffa116] mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#eff1f6] mb-1">Fetch Problems</h4>
            <p className="text-[11px] text-[#8a8a8e] leading-relaxed">
              Load any LeetCode problem instantly with authentic test cases.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('editor')}
            className="p-5 rounded-xl bg-[#181818] border border-[#2a2a2a] flex flex-col items-center text-center cursor-pointer hover:border-[#ffa116] hover:bg-[#222222] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center text-[#ffa116] mb-3 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#eff1f6] mb-1">Write Code</h4>
            <p className="text-[11px] text-[#8a8a8e] leading-relaxed">
              Code in Python, Java, or C++ with Monaco editor and test templates.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('visualizer')}
            className="p-5 rounded-xl bg-[#181818] border border-[#2a2a2a] flex flex-col items-center text-center cursor-pointer hover:border-[#ffa116] hover:bg-[#222222] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center text-[#ffa116] mb-3 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#eff1f6] mb-1">Visualize Execution</h4>
            <p className="text-[11px] text-[#8a8a8e] leading-relaxed">
              Step through AST execution on D3 Trees, Cytoscape Graphs, and Arrays.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('editor')}
            className="p-5 rounded-xl bg-[#181818] border border-[#2a2a2a] flex flex-col items-center text-center cursor-pointer hover:border-[#ffa116] hover:bg-[#222222] transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center text-[#ffa116] mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#eff1f6] mb-1">Diagnose Errors</h4>
            <p className="text-[11px] text-[#8a8a8e] leading-relaxed">
              3-tier error classification for Syntax, Semantic, and Logical errors.
            </p>
          </div>
        </div>
      </div>

      {/* Real Session / Recent Problem History */}
      <div className="rounded-2xl border border-[#2e2e2e] bg-[#1e1e1e] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#eff1f6]">
            Recently Explored Problems
          </h3>
          <button
            onClick={() => onNavigateTab('problems')}
            className="text-xs text-[#ffa116] hover:underline font-semibold"
          >
            Browse All
          </button>
        </div>

        {recentSearchedProblems.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8a8a8e]">
            No problems opened in this session yet. Type any problem title above to get started!
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {recentSearchedProblems.map((title, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectProblem(title);
                  onNavigateTab('editor');
                }}
                className="py-3 px-3 flex items-center justify-between hover:bg-[#252525] rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-[#ffa116]" />
                  <span className="text-xs font-medium text-[#eff1f6] group-hover:text-[#ffa116] transition-colors">
                    {title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8a8a8e]">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
