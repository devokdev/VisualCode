import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface ProblemsListViewProps {
  onSelectProblem: (query: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings') => void;
  onFetchDynamicProblem: (query: string) => Promise<void>;
  isLoading: boolean;
}

const CURATED_PROBLEMS = [
  { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium' as const, category: 'Tree / BST' },
  { id: 199, title: 'Binary Tree Right Side View', difficulty: 'Medium' as const, category: 'Tree / BFS / DFS' },
  { id: 226, title: 'Invert Binary Tree', difficulty: 'Easy' as const, category: 'Tree' },
  { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' as const, category: 'Tree / DFS' },
  { id: 700, title: 'Search in a Binary Search Tree', difficulty: 'Easy' as const, category: 'Tree / BST' },
  { id: 701, title: 'Insert into a Binary Search Tree', difficulty: 'Medium' as const, category: 'Tree / BST' },
  { id: 235, title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium' as const, category: 'Tree / BST' },
  { id: 200, title: 'Number of Islands', difficulty: 'Medium' as const, category: 'Graph / BFS / DFS' },
  { id: 133, title: 'Clone Graph', difficulty: 'Medium' as const, category: 'Graph' },
  { id: 206, title: 'Reverse Linked List', difficulty: 'Easy' as const, category: 'Linked List' },
  { id: 141, title: 'Linked List Cycle', difficulty: 'Easy' as const, category: 'Linked List' },
  { id: 146, title: 'LRU Cache', difficulty: 'Hard' as const, category: 'Linked List / Design' },
  { id: 1, title: 'Two Sum', difficulty: 'Easy' as const, category: 'Array / Hash Table' },
  { id: 15, title: '3Sum', difficulty: 'Medium' as const, category: 'Array / Two Pointers' },
  { id: 11, title: 'Container With Most Water', difficulty: 'Medium' as const, category: 'Array / Two Pointers' },
  { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard' as const, category: 'Array / Two Pointers / Stack' },
];

export const ProblemsListView: React.FC<ProblemsListViewProps> = ({
  onSelectProblem,
  onNavigateTab,
  onFetchDynamicProblem,
  isLoading,
}) => {
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [search, setSearch] = useState('');

  const filtered = CURATED_PROBLEMS.filter((p) => {
    const matchesFilter = filter === 'All' || p.difficulty === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleDynamicFetch = async (query: string) => {
    await onFetchDynamicProblem(query);
    onNavigateTab('editor');
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#2e2e2e] pb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#eff1f6] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#ffa116]" />
            <span>Problem Library</span>
          </h2>
          <p className="text-xs text-[#8a8a8e] mt-1">Search any problem across the entire LeetCode catalog</p>
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setFilter(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === diff
                  ? 'bg-[#ffa116] text-[#141414] shadow-md font-bold'
                  : 'bg-[#262626] border border-[#383838] text-[#8a8a8e] hover:text-[#eff1f6]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Search Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#8a8a8e] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                handleDynamicFetch(search.trim());
              }
            }}
            placeholder="Type ANY LeetCode problem title/number (e.g. 'Binary Tree Right Side View', '300', 'Decode Ways')..."
            className="w-full bg-[#1e1e1e] border border-[#333333] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#eff1f6] placeholder-[#666666] focus:outline-none focus:border-[#ffa116] transition-all"
          />
        </div>

        {search.trim() && (
          <button
            onClick={() => handleDynamicFetch(search.trim())}
            disabled={isLoading}
            className="px-4 py-2.5 bg-[#ffa116] hover:bg-[#ffb23d] text-[#141414] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Fetch & Open "{search}"</span>
          </button>
        )}
      </div>

      {/* Direct Search Banner Prompt if not in list */}
      {search.trim() && filtered.length === 0 && (
        <div className="p-6 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#262626] border border-[#383838] flex items-center justify-center text-[#ffa116]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#eff1f6]">Fetch from LeetCode Database</h3>
              <p className="text-xs text-[#8a8a8e]">
                "{search}" is not in the quick local list. Click Fetch to scrape its full description, constraints, and test cases directly!
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDynamicFetch(search.trim())}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#ffa116] hover:bg-[#ffb23d] text-[#141414] font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Fetch "{search}"</span>
          </button>
        </div>
      )}

      {/* Table Catalog */}
      <div className="rounded-2xl border border-[#2e2e2e] bg-[#1e1e1e] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#2e2e2e] bg-[#181818] text-[#8a8a8e] uppercase font-mono text-[11px] tracking-wider">
              <th className="py-3.5 px-6">#</th>
              <th className="py-3.5 px-6">Title</th>
              <th className="py-3.5 px-6">Difficulty</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {filtered.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  onSelectProblem(`${item.id}. ${item.title}`);
                  onNavigateTab('editor');
                }}
                className="hover:bg-[#252525] cursor-pointer transition-colors group"
              >
                <td className="py-4 px-6 font-mono text-[#8a8a8e]">{item.id}</td>
                <td className="py-4 px-6 font-semibold text-[#eff1f6] group-hover:text-[#ffa116] transition-colors">
                  {item.title}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.difficulty === 'Easy'
                        ? 'badge-easy'
                        : item.difficulty === 'Medium'
                        ? 'badge-medium'
                        : 'badge-hard'
                    }`}
                  >
                    {item.difficulty}
                  </span>
                </td>
                <td className="py-4 px-6 text-[#8a8a8e]">
                  {item.category}
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center gap-1 text-[#ffa116] font-semibold text-xs group-hover:translate-x-1 transition-transform">
                    <span>Solve & Visualize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
