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
    <div className="h-full flex flex-col bg-[#221D1A] select-none">
      {/* Tab Navigation Header */}
      <div className="flex items-center border-b border-[#3D322A] bg-[#1C1815] px-3">
        <button
          onClick={() => onSelectTab('variables')}
          className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'variables'
              ? 'border-[#B38A4A] text-[#EAE5DF] font-semibold'
              : 'border-transparent text-[#9E948C] hover:text-[#EAE5DF]'
          }`}
        >
          <span>📦</span>
          <span>Variables</span>
        </button>

        <button
          onClick={() => onSelectTab('callstack')}
          className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'callstack'
              ? 'border-[#B38A4A] text-[#EAE5DF] font-semibold'
              : 'border-transparent text-[#9E948C] hover:text-[#EAE5DF]'
          }`}
        >
          <span>🧵</span>
          <span>Call Stack</span>
        </button>

        <button
          onClick={() => onSelectTab('output')}
          className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'output'
              ? 'border-[#B38A4A] text-[#EAE5DF] font-semibold'
              : 'border-transparent text-[#9E948C] hover:text-[#EAE5DF]'
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
              <div className="p-2.5 rounded-lg bg-[#2A2421] border border-[#B38A4A]/40 text-xs flex items-center justify-between">
                <span className="text-[#B38A4A] font-semibold font-mono">Selected Node Val:</span>
                <span className="font-mono font-bold text-[#EAE5DF]">{String(selectedNodeVal)}</span>
              </div>
            )}

            {!variables || Object.keys(variables).length === 0 ? (
              <p className="text-xs text-[#6B625B] italic">No active variables at this step</p>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(variables).map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#171412] text-xs border border-[#3D322A]/40"
                  >
                    <span className="font-mono text-[#B38A4A]">{name}</span>
                    <span className="font-mono text-[#EAE5DF] truncate max-w-[160px]">
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
              <p className="text-xs text-[#6B625B] italic">Main Frame</p>
            ) : (
              <div className="flex flex-col-reverse gap-1.5">
                {callStack.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                      idx === callStack.length - 1
                        ? 'border-[#B38A4A] bg-[#2A2421] text-[#EAE5DF]'
                        : 'border-[#3D322A]/40 bg-[#171412] text-[#9E948C]'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#EAE5DF]">{frame.functionName}</span>
                      {frame.args && (
                        <div className="text-[10px] font-mono text-[#9E948C] mt-0.5">
                          {JSON.stringify(frame.args)}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6B625B] font-mono">depth {frame.depth}</span>
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
              <div className="p-3 rounded-lg bg-[#171412] border border-[#3D322A]/40 text-xs font-mono">
                <span className="text-[#9E948C] block text-[10px] mb-1">Return Value:</span>
                <span className="text-[#66734F] font-bold">
                  {typeof returnValue === 'object' ? JSON.stringify(returnValue) : String(returnValue)}
                </span>
              </div>
            )}

            {stdout ? (
              <div className="p-3 rounded-lg bg-[#171412] border border-[#3D322A]/40 text-xs font-mono text-[#D8D2CA] whitespace-pre-wrap">
                {stdout}
              </div>
            ) : (
              !returnValue && <p className="text-xs text-[#6B625B] italic">No console output</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
