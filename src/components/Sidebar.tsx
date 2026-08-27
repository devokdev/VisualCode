import React from 'react';
import { Home, BookOpen, Code2, Eye, History, Settings } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'problems' | 'editor' | 'visualizer' | 'history' | 'settings') => void;
  onOpenApiKeyModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'problems', label: 'Problems', icon: BookOpen },
    { id: 'editor', label: 'Code Editor', icon: Code2 },
    { id: 'visualizer', label: 'Visualizers', icon: Eye },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-[#0d0e14]/95 border-r border-[#d4af37]/20 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-40 shadow-2xl">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#d4af37]/15 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-lg border border-[#d4af37]/40 bg-gradient-to-b from-[#1c1d27] to-[#101118] flex items-center justify-center text-[#d4af37] mb-2 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <span className="font-mono text-sm font-bold">&lt;/&gt;</span>
          </div>
          <h1 className="font-heading text-xl tracking-wider font-bold text-[#e6c97a] drop-shadow-sm">
            VisualCode
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent my-1.5" />
          <span className="text-[10px] tracking-widest uppercase text-[#a09a88] font-medium">
            Visualize. Debug. Conquer.
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1e1f2b] text-[#e6c97a] border border-[#d4af37]/35 shadow-[0_0_12px_rgba(212,175,55,0.1)] font-semibold'
                    : 'text-[#9c9aa8] hover:text-[#e2e8f0] hover:bg-[#141520]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : 'text-[#7d7a8c]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quote Widget at the bottom */}
      <div className="p-4 m-3 rounded-xl border border-[#d4af37]/20 bg-gradient-to-b from-[#13141d] to-[#0c0d13] text-center relative overflow-hidden shadow-lg">
        <div className="text-xl font-serif text-[#d4af37]/30 leading-none">“</div>
        <p className="font-serif italic text-[11px] text-[#c2bdb0] leading-relaxed px-1">
          Programs must be written for people to read, and only incidentally for machines to execute.
        </p>
        <div className="w-10 h-[1px] bg-[#d4af37]/30 mx-auto my-2" />
        <span className="text-[10px] text-[#8e897a] font-sans tracking-wide block">
          — Harold Abelson
        </span>
      </div>
    </aside>
  );
};
