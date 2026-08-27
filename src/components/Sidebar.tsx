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
    <aside className="w-60 bg-[#181818] border-r border-[#2a2a2a] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-40">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#262626] border border-[#383838] flex items-center justify-center text-[#ffa116] shadow-sm">
            <span className="font-mono text-xs font-bold">&lt;/&gt;</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#eff1f6]">
              VisualCode
            </h1>
            <span className="text-[10px] text-[#8a8a8e] font-medium block">
              LeetCode AST Visualizer
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#262626] text-[#ffa116] border border-[#383838] font-semibold'
                    : 'text-[#8a8a8e] hover:text-[#eff1f6] hover:bg-[#202020]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffa116]' : 'text-[#666666]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#2a2a2a] text-[11px] text-[#8a8a8e] flex items-center justify-between">
        <span>v2.0 • Pro</span>
        <span className="w-2 h-2 rounded-full bg-[#00b8a3]" />
      </div>
    </aside>
  );
};
