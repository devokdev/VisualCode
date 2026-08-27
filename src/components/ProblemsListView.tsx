import React, { useState } from 'react';
import { Search, BookOpen, ArrowRight, Layers } from 'lucide-react';

interface ProblemsListViewProps {
  onSelectProblem: (query: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings') => void;
}

const PROBLEMS_CATALOG = [
  { id: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium' as const, category: 'Tree / BST', solved: true },
  { id: 226, title: 'Invert Binary Tree', difficulty: 'Easy' as const, category: 'Tree', solved: true },
  { id: 700, title: 'Search in a Binary Search Tree', difficulty: 'Easy' as const, category: 'Tree / BST', solved: true },
  { id: 701, title: 'Insert into a Binary Search Tree', difficulty: 'Medium' as const, category: 'Tree / BST', solved: false },
  { id: 235, title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium' as const, category: 'Tree / BST', solved: false },
  { id: 200, title: 'Number of Islands', difficulty: 'Medium' as const, category: 'Graph / BFS / DFS', solved: true },
  { id: 133, title: 'Clone Graph', difficulty: 'Medium' as const, category: 'Graph', solved: false },
  { id: 206, title: 'Reverse Linked List', difficulty: 'Easy' as const, category: 'Linked List', solved: true },
  { id: 141, title: 'Linked List Cycle', difficulty: 'Easy' as const, category: 'Linked List', solved: true },
  { id: 146, title: 'LRU Cache', difficulty: 'Hard' as const, category: 'Linked List / Hash Table', solved: false },
  { id: 1, title: 'Two Sum', difficulty: 'Easy' as const, category: 'Array / Hash Table', solved: true },
  { id: 15, title: '3Sum', difficulty: 'Medium' as const, category: 'Array / Two Pointers', solved: true },
  { id: 11, title: 'Container With Most Water', difficulty: 'Medium' as const, category: 'Array / Two Pointers', solved: true },
  { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard' as const, category: 'Array / Two Pointers / Stack', solved: false },
];

export const ProblemsListView: React.FC<ProblemsListViewProps> = ({
  onSelectProblem,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [search, setSearch] = useState('');

  const filtered = PROBLEMS_CATALOG.filter((p) => {
    const matchesFilter = filter === 'All' || p.difficulty === filter;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <h2 className="font-serif-title text-2xl font-semibold text-[#f3f0e6] flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#d4af37]" />
            <span>Problem Library</span>
          </h2>
          <p className="text-xs text-[#8e8a9c] mt-1">Explore algorithms, binary trees, graphs, and sequence problems</p>
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setFilter(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === diff
                  ? 'bg-[#d4af37] text-[#0a0a0e] shadow-md shadow-[#d4af37]/20 font-bold'
                  : 'bg-[#11121a] border border-[#d4af37]/20 text-[#8e8a9c] hover:text-[#e2e8f0]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8e897a] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter problems by title or number..."
          className="w-full bg-[#11121a] border border-[#d4af37]/25 rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#716e7d] focus:outline-none focus:border-[#d4af37] transition-all"
        />
      </div>

      {/* Table Catalog */}
      <div className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-b from-[#13141c] to-[#0e0f15] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#d4af37]/20 bg-[#0d0e14]/90 text-[#8e8a9c] uppercase font-mono text-[10px] tracking-wider">
              <th className="py-3 px-6">#</th>
              <th className="py-3 px-6">Title</th>
              <th className="py-3 px-6">Difficulty</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10">
            {filtered.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  onSelectProblem(`${item.id}. ${item.title}`);
                  onNavigateTab('editor');
                }}
                className="hover:bg-[#181926] cursor-pointer transition-colors group"
              >
                <td className="py-4 px-6 font-mono text-[#8e8a9c]">{item.id}</td>
                <td className="py-4 px-6 font-medium text-[#f1ede2] group-hover:text-[#d4af37] transition-colors">
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
                <td className="py-4 px-6 text-[#9a95a6] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#d4af37]/70" />
                  <span>{item.category}</span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center gap-1 text-[#d4af37] font-semibold text-xs group-hover:translate-x-1 transition-transform">
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
