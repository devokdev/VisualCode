import React from 'react';
import type { CallStackFrame, TraceStep } from '../../types';
import { computeStateTransitionDiff } from '../../services/transitionDiff';
import { Box, Layers, Terminal, ArrowRight } from 'lucide-react';

interface DebugPanelProps {
  activeTab: 'variables' | 'callstack' | 'output';
  onSelectTab: (tab: 'variables' | 'callstack' | 'output') => void;
  currentStep?: TraceStep | null;
  prevStep?: TraceStep | null;
  variables?: Record<string, any>;
  callStack?: CallStackFrame[];
  stdout?: string;
  returnValue?: any;
  selectedNodeVal?: string | number | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  activeTab,
  onSelectTab,
  currentStep,
  prevStep,
  callStack,
  stdout,
  returnValue,
  selectedNodeVal,
}) => {
  const diff = computeStateTransitionDiff(currentStep, prevStep);

  return (
    <div className="h-full flex flex-col bg-[#141417]/95 select-none">
      {/* Tab Navigation Header */}
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
          <span>Variables Diff</span>
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
        {/* Variables Diff Tab */}
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

            {diff.variableDiffs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#71717a]">
                No active variables at this step
              </div>
            ) : (
              <div className="space-y-2">
                {diff.variableDiffs.map((v) => (
                  <div
                    key={v.name}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                      v.hasChanged
                        ? 'bg-[#2a241b] border-[#ffa116]/40 shadow-sm'
                        : 'bg-[#1a1a1f] border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#ffa116]">{v.name}</span>
                      {v.hasChanged && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#ffa116]/20 text-[#ffa116]">
                          {v.isNew ? 'New' : 'Mutated'}
                        </span>
                      )}
                    </div>

                    <div className="text-[#f4f4f5] break-all">
                      {v.hasChanged && v.prevVal !== undefined ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[#71717a] line-through text-[11px]">
                            {typeof v.prevVal === 'object' ? JSON.stringify(v.prevVal) : String(v.prevVal)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#ffa116]" />
                          <span className="text-[#ffa116] font-bold">
                            {typeof v.currentVal === 'object' ? JSON.stringify(v.currentVal) : String(v.currentVal)}
                          </span>
                        </div>
                      ) : (
                        <span>{typeof v.currentVal === 'object' ? JSON.stringify(v.currentVal) : String(v.currentVal)}</span>
                      )}
                    </div>
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
