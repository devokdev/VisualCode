import React from 'react';
import type { CallStackFrame } from '../../types';
import { Box, Layers, Terminal } from 'lucide-react';

interface DebugPanelProps {
  activeTab: 'variables' | 'callstack' | 'output';
  onSelectTab: (tab: 'variables' | 'callstack' | 'output') => void;
  variables?: Record<string, any>;
  callStack?: CallStackFrame[];
  stdout?: string;
  returnValue?: any;
  selectedNodeVal?: string | number | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  activeTab,
  onSelectTab,
  variables,
  callStack,
  stdout,
  returnValue,
  selectedNodeVal,
}) => {
  return (
    <div className="h-full flex flex-col bg-[#141417]/95 select-none">
      {/* Tab Navigation Header with Lucide Icons - No Emojis */}
      <div className="flex items-center border-b border-white/[0.06] bg-[#1a1a1f] px-3">
        <button
          onClick={() => onSelectTab('variables')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'variables'
              ? 'border-[#ffa116] text-[#f4f4f5]'
              : 'border-transparent text-[#71717a] hover:text-[#d4d4d8]'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Variables</span>
        </button>

        <button
          onClick={() => onSelectTab('callstack')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'callstack'
              ? 'border-[#ffa116] text-[#f4f4f5]'
              : 'border-transparent text-[#71717a] hover:text-[#d4d4d8]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Call Stack</span>
        </button>

        <button
          onClick={() => onSelectTab('output')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'output'
              ? 'border-[#ffa116] text-[#f4f4f5]'
              : 'border-transparent text-[#71717a] hover:text-[#d4d4d8]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Output</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <div className="space-y-3">
            {selectedNodeVal !== null && selectedNodeVal !== undefined && (
              <div className="p-2.5 rounded-xl bg-[#1e1e24] border border-[#ffa116]/30 text-xs flex items-center justify-between shadow-sm">
                <span className="text-[#ffa116] font-semibold font-mono text-[11px] uppercase tracking-wider">
                  Selected Node
                </span>
                <span className="font-mono font-bold text-[#f4f4f5]">{String(selectedNodeVal)}</span>
              </div>
            )}

            {!variables || Object.keys(variables).length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71717a]">
                No variables active at this step
              </div>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(variables).map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1a1a1f] text-xs border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                  >
                    <span className="font-mono text-[#ffa116] font-medium">{name}</span>
                    <span className="font-mono text-[#f4f4f5] truncate max-w-[160px]">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Call Stack Tab */}
        {activeTab === 'callstack' && (
          <div className="space-y-2">
            {!callStack || callStack.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71717a]">
                Main Frame
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-1.5">
                {callStack.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      idx === callStack.length - 1
                        ? 'border-[#ffa116]/40 bg-[#22222a] text-[#f4f4f5] shadow-sm'
                        : 'border-white/[0.04] bg-[#1a1a1f] text-[#71717a]'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#f4f4f5]">{frame.functionName}</span>
                      {frame.args && (
                        <div className="text-[10px] font-mono text-[#a1a1aa] mt-0.5">
                          {JSON.stringify(frame.args)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#71717a] font-mono">depth {frame.depth}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && (
          <div className="space-y-3">
            {returnValue !== undefined && (
              <div className="p-3 rounded-xl bg-[#1a1a1f] border border-white/[0.06] text-xs font-mono">
                <span className="text-[#71717a] block text-[10px] uppercase font-semibold mb-1">
                  Return Value
                </span>
                <span className="text-[#10b981] font-bold">
                  {typeof returnValue === 'object' ? JSON.stringify(returnValue) : String(returnValue)}
                </span>
              </div>
            )}

            {stdout ? (
              <div className="p-3 rounded-xl bg-[#1a1a1f] border border-white/[0.06] text-xs font-mono text-[#f4f4f5] whitespace-pre-wrap">
                {stdout}
              </div>
            ) : (
              !returnValue && (
                <div className="p-6 text-center text-xs text-[#71717a]">
                  No console output
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
