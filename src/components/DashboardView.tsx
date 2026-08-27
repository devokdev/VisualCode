import React, { useState } from 'react';
import { Search, Key, User, BookOpen, Code2, Eye, ShieldCheck, Flame, Trophy, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  onSelectProblem: (query: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings') => void;
  onOpenApiKeyModal: () => void;
  recentProblems: { title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; timeAgo: string }[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectProblem,
  onNavigateTab,
  onOpenApiKeyModal,
  recentProblems,
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
          <Search className="w-4 h-4 text-[#8e897a] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search LeetCode problems by name or number (e.g. 98, Invert Tree)..."
            className="w-full bg-[#11121a] border border-[#d4af37]/25 rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#716e7d] focus:outline-none focus:border-[#d4af37] transition-all shadow-inner"
          />
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#11121a] border border-[#d4af37]/25 text-[#d4af37] text-xs font-semibold hover:bg-[#191a26] transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Key</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-[#161722] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-8">
        <div>
          <h2 className="font-serif-title text-3xl font-medium tracking-tight text-[#f3f0e6]">
            {getGreeting()}, <span className="text-[#e6c97a]">Developer.</span>
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-8 h-[1px] bg-[#d4af37]/40" />
            <p className="font-serif italic text-xs text-[#a39e90] tracking-wide">
              Visualize. Debug. Conquer.
            </p>
          </div>
        </div>

        {/* Vintage Feather / Books Iconography badge */}
        <div className="hidden md:flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-[#181924] to-[#0f1016] border border-[#d4af37]/20 shadow-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] block">AI Engine</span>
            <span className="text-xs text-[#cbd5e1] font-mono">Gemini 2.5 Flash</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#232435] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Explore VisualCode Action Grid */}
      <div className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#13141c] to-[#0e0f15] p-6 shadow-xl">
        <h3 className="font-serif-title text-base font-semibold text-[#e6c97a] mb-5">
          Explore VisualCode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => onNavigateTab('problems')}
            className="p-5 rounded-xl bg-[#0d0e14]/80 border border-[#d4af37]/15 flex flex-col items-center text-center cursor-pointer hover:border-[#d4af37]/50 hover:bg-[#141520] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1b1c28] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-serif-title text-sm font-semibold text-[#f1ede2] mb-1">Fetch Problems</h4>
            <p className="text-[11px] text-[#8e8a9c] leading-relaxed">
              Search and load any LeetCode problem instantly with authentic test cases.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigateTab('editor')}
            className="p-5 rounded-xl bg-[#0d0e14]/80 border border-[#d4af37]/15 flex flex-col items-center text-center cursor-pointer hover:border-[#d4af37]/50 hover:bg-[#141520] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1b1c28] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] mb-3 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="font-serif-title text-sm font-semibold text-[#f1ede2] mb-1">Write Code</h4>
            <p className="text-[11px] text-[#8e8a9c] leading-relaxed">
              Code in Python, Java, or C++ with Monaco editor and instant templates.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigateTab('visualizer')}
            className="p-5 rounded-xl bg-[#0d0e14]/80 border border-[#d4af37]/15 flex flex-col items-center text-center cursor-pointer hover:border-[#d4af37]/50 hover:bg-[#141520] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1b1c28] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] mb-3 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="font-serif-title text-sm font-semibold text-[#f1ede2] mb-1">Visualize Execution</h4>
            <p className="text-[11px] text-[#8e8a9c] leading-relaxed">
              See code execution step-by-step with rich D3 Trees, Graphs, and Pointers.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigateTab('editor')}
            className="p-5 rounded-xl bg-[#0d0e14]/80 border border-[#d4af37]/15 flex flex-col items-center text-center cursor-pointer hover:border-[#d4af37]/50 hover:bg-[#141520] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1b1c28] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif-title text-sm font-semibold text-[#f1ede2] mb-1">Diagnose Errors</h4>
            <p className="text-[11px] text-[#8e8a9c] leading-relaxed">
              3-tier error classification for Syntax, Semantic, and Logical mistakes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Problems & Progress Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Problems (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#13141c] to-[#0e0f15] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-title text-base font-semibold text-[#e6c97a]">
                Recent Problems
              </h3>
              <button
                onClick={() => onNavigateTab('problems')}
                className="text-[11px] text-[#9c9789] hover:text-[#d4af37] font-medium transition-colors"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-[#d4af37]/10">
              {recentProblems.map((prob, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectProblem(prob.title);
                    onNavigateTab('editor');
                  }}
                  className="py-3 px-2 flex items-center justify-between hover:bg-[#171824] rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#e2e8f0] font-medium group-hover:text-[#d4af37] transition-colors">
                      {prob.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        prob.difficulty === 'Easy'
                          ? 'badge-easy'
                          : prob.difficulty === 'Medium'
                          ? 'badge-medium'
                          : 'badge-hard'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[#7f7c8d]">
                    <span className="text-[11px] font-mono">{prob.timeAgo}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8c889a] group-hover:translate-x-1 group-hover:text-[#d4af37] transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Your Progress Statistics (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#13141c] to-[#0e0f15] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif-title text-base font-semibold text-[#e6c97a] mb-4">
              Your Progress
            </h3>
            <div className="w-full h-[1px] bg-[#d4af37]/15 mb-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-[#a8a497]">
                  <BookOpen className="w-4 h-4 text-[#d4af37]" />
                  <span>Problems Solved</span>
                </div>
                <span className="font-serif-title text-lg font-bold text-[#f3f0e6]">128</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-[#a8a497]">
                  <Flame className="w-4 h-4 text-[#ffc01e]" />
                  <span>Current Streak</span>
                </div>
                <span className="font-serif-title text-lg font-bold text-[#ffc01e]">7 days</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-[#a8a497]">
                  <Trophy className="w-4 h-4 text-[#00b8a3]" />
                  <span>Success Rate</span>
                </div>
                <span className="font-serif-title text-lg font-bold text-[#00b8a3]">82%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-[#a8a497]">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  <span>Total Time</span>
                </div>
                <span className="font-serif-title text-lg font-bold text-[#f3f0e6]">24h 18m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
