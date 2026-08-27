import React from 'react';
import type { CallStackFrame } from '../../types';

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
    <div className="h-full flex flex-col bg-[#1e1e1e] select-none">
      {/* Tab Navigation Header */}
      <div className="flex items-center border-b border-[#333333] bg-[#242424] px-3">
        <button
          onClick={() => onSelectTab('variables')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'variables'
              ? 'border-[#ffa116] text-[#eff1f6]'
              : 'border-transparent text-[#8c8c8c] hover:text-[#eff1f6]'
          }`}
        >
          <span>📦</span>
          <span>Variables</span>
        </button>

        <button
          onClick={() => onSelectTab('callstack')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'callstack'
              ? 'border-[#ffa116] text-[#eff1f6]'
              : 'border-transparent text-[#8c8c8c] hover:text-[#eff1f6]'
          }`}
        >
          <span>🧵</span>
          <span>Call Stack</span>
        </button>

        <button
          onClick={() => onSelectTab('output')}
          className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'output'
              ? 'border-[#ffa116] text-[#eff1f6]'
              : 'border-transparent text-[#8c8c8c] hover:text-[#eff1f6]'
          }`}
        >
          <span>📝</span>
          <span>Output</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <div className="space-y-3">
            {selectedNodeVal !== null && selectedNodeVal !== undefined && (
              <div className="p-2.5 rounded-lg bg-[#242424] border border-[#ffa116]/40 text-xs flex items-center justify-between">
                <span className="text-[#ffa116] font-semibold font-mono">Selected Node:</span>
                <span className="font-mono font-bold text-[#eff1f6]">{String(selectedNodeVal)}</span>
              </div>
            )}

            {!variables || Object.keys(variables).length === 0 ? (
              <p className="text-xs text-[#8c8c8c] italic">No active variables at this step</p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(variables).map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#242424] text-xs border border-[#333333]"
                  >
                    <span className="font-mono text-[#ffa116] font-medium">{name}</span>
                    <span className="font-mono text-[#eff1f6] truncate max-w-[160px]">
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
              <p className="text-xs text-[#8c8c8c] italic">Main Frame</p>
            ) : (
              <div className="flex flex-col-reverse gap-1.5">
                {callStack.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                      idx === callStack.length - 1
                        ? 'border-[#ffa116] bg-[#2d2d2d] text-[#eff1f6]'
                        : 'border-[#333333] bg-[#242424] text-[#8c8c8c]'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#eff1f6]">{frame.functionName}</span>
                      {frame.args && (
                        <div className="text-[10px] font-mono text-[#8c8c8c] mt-0.5">
                          {JSON.stringify(frame.args)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8c8c8c] font-mono">depth {frame.depth}</span>
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
              <div className="p-3 rounded-lg bg-[#242424] border border-[#333333] text-xs font-mono">
                <span className="text-[#8c8c8c] block text-[10px] mb-1">Return Value:</span>
                <span className="text-[#2cbb5d] font-bold">
                  {typeof returnValue === 'object' ? JSON.stringify(returnValue) : String(returnValue)}
                </span>
              </div>
            )}

            {stdout ? (
              <div className="p-3 rounded-lg bg-[#242424] border border-[#333333] text-xs font-mono text-[#eff1f6] whitespace-pre-wrap">
                {stdout}
              </div>
            ) : (
              !returnValue && <p className="text-xs text-[#8c8c8c] italic">No console output</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
