import React from 'react';
import type { LinkedListNodeData, ArrayElementData, MatrixState } from '../../types';
import { ArrowDown, Activity } from 'lucide-react';

interface SequenceVisualizerProps {
  linkedListState?: LinkedListNodeData[] | null;
  arrayState?: ArrayElementData[] | null;
  matrixState?: MatrixState | null;
  stepExplanation?: string;
  variables?: Record<string, any>;
}

export const SequenceVisualizer: React.FC<SequenceVisualizerProps> = ({
  linkedListState,
  arrayState,
  matrixState,
  stepExplanation,
  variables = {},
}) => {
  // Extract all arrays present in variables (e.g. nums, nums2) to visualize multi-array transformations
  const arrayVariables: { name: string; items: any[] }[] = [];

  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        arrayVariables.push({ name: key, items: val });
      }
    });
  }

  // Active pointer indices from scalar variables (i, j, k, left, right, mid, target)
  const pointerMap: Record<string, number> = {};
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      if (typeof v === 'number' && !Array.isArray(v)) {
        pointerMap[k] = v;
      }
    });
  }

  // Fallback single arrayState if variables don't contain named arrays
  let singleEffectiveArray: ArrayElementData[] = (arrayState && arrayState.length > 0) ? arrayState : [];

  const hasLinkedList = Boolean(linkedListState && linkedListState.length > 0);
  const hasNamedArrays = arrayVariables.length > 0;
  const hasSingleArray = singleEffectiveArray.length > 0;
  const hasMatrix = Boolean(matrixState && matrixState.grid && matrixState.grid.length > 0);
  const hasData = hasLinkedList || hasNamedArrays || hasSingleArray || hasMatrix;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111114] overflow-hidden select-none">
      {/* Top Status & Variable Cards */}
      <div className="px-6 py-3 bg-[#18181e]/80 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ffa116]" />
          <span className="text-xs font-bold text-[#f4f4f5] tracking-wide">Live State Transformation</span>
        </div>

        {/* Live Variable Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {variables &&
            Object.entries(variables).map(([k, v]) => {
              if (Array.isArray(v)) return null;
              return (
                <div
                  key={k}
                  className="px-2.5 py-1 rounded-lg bg-[#22222a] border border-white/[0.08] text-xs font-mono flex items-center gap-1.5 shadow-sm"
                >
                  <span className="text-[#ffa116] font-semibold">{k}</span>
                  <span className="text-[#71717a]">=</span>
                  <span className="text-[#f4f4f5] font-bold">{String(v)}</span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Dynamic Visual Canvas */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 space-y-8">
        {!hasData && (
          <div className="text-center text-xs text-[#71717a] p-8">
            Initializing visual state...
          </div>
        )}

        {/* Multi-Array Transformation (e.g. nums -> nums2 in Rotate Array) */}
        {hasNamedArrays && (
          <div className="w-full max-w-2xl space-y-6">
            {arrayVariables.map((arrVar, arrIdx) => (
              <div
                key={arrVar.name}
                className="p-4 rounded-2xl bg-[#16161b] border border-white/[0.07] shadow-lg relative"
              >
                {/* Array Name Label */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ffa116] bg-[#ffa116]/10 px-2.5 py-0.5 rounded-md border border-[#ffa116]/20">
                      {arrVar.name}[]
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      length: {arrVar.items.length}
                    </span>
                  </div>

                  {arrIdx === 0 && arrayVariables.length > 1 && (
                    <div className="flex items-center gap-1 text-[11px] text-[#71717a] font-medium">
                      <span>Source</span>
                      <ArrowDown className="w-3.5 h-3.5 text-[#ffa116]" />
                    </div>
                  )}
                </div>

                {/* Array Elements Row */}
                <div className="flex flex-wrap items-end gap-2.5">
                  {arrVar.items.map((val, idx) => {
                    // Check if any pointer points to this index
                    const activePointers = Object.entries(pointerMap)
                      .filter(([_, ptrVal]) => ptrVal === idx)
                      .map(([ptrName]) => ptrName);

                    const isPointed = activePointers.length > 0;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        {/* Pointer Badge above element */}
                        <div className="h-6 flex items-center justify-center gap-1 mb-1">
                          {activePointers.map((ptr) => (
                            <span
                              key={ptr}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md animate-bounce"
                            >
                              {ptr}
                            </span>
                          ))}
                        </div>

                        {/* Array Cell */}
                        <div
                          className={`w-13 h-13 rounded-xl border-2 flex items-center justify-center transition-all shadow-md ${
                            isPointed
                              ? 'border-[#ffa116] bg-gradient-to-b from-[#2e2b24] to-[#22201b] text-[#ffa116] font-bold scale-105 shadow-[0_0_15px_rgba(255,161,22,0.25)]'
                              : 'border-white/[0.08] bg-[#1a1a20] text-[#f4f4f5]'
                          }`}
                        >
                          <span className="text-base font-mono font-bold">
                            {val !== undefined && val !== null ? String(val) : '0'}
                          </span>
                        </div>

                        {/* Index beneath */}
                        <span className="text-[11px] text-[#71717a] font-mono mt-1.5 font-medium">
                          [{idx}]
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Single Array Fallback View */}
        {!hasNamedArrays && hasSingleArray && (
          <div className="flex flex-wrap items-end gap-3 justify-center py-6">
            {singleEffectiveArray.map((elem) => {
              const isActive = elem.status === 'active' || (elem.pointers && elem.pointers.length > 0);
              return (
                <div key={elem.index} className="flex flex-col items-center">
                  <div className="h-6 flex items-center justify-center gap-1 mb-1">
                    {elem.pointers?.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`w-13 h-13 rounded-xl border-2 flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-[#ffa116] bg-[#2e2b24] text-[#ffa116] font-bold shadow-[0_0_14px_rgba(255,161,22,0.3)] scale-105'
                        : 'border-white/[0.08] bg-[#1a1a20] text-[#f4f4f5]'
                    }`}
                  >
                    <span className="text-base font-mono font-bold">{elem.val}</span>
                  </div>

                  <span className="text-[11px] text-[#71717a] font-mono mt-1.5">[{elem.index}]</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Linked List View with animated pointers and arrow links */}
        {hasLinkedList && linkedListState && (
          <div className="flex flex-wrap items-center gap-2 justify-center py-6">
            {linkedListState.map((node, idx) => {
              const isActive = node.status === 'active';
              return (
                <div key={node.id || idx} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="h-6 flex items-center gap-1 mb-1">
                      {node.pointers?.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    <div
                      className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'border-[#ffa116] bg-[#2e2b24] text-[#ffa116] shadow-[0_0_14px_rgba(255,161,22,0.3)] scale-105 font-bold'
                          : 'border-white/[0.08] bg-[#1a1a20] text-[#f4f4f5]'
                      }`}
                    >
                      <span className="text-sm font-bold">{node.val}</span>
                    </div>
                  </div>

                  {idx < linkedListState.length - 1 && (
                    <div className="mx-2 text-[#ffa116]/60 font-bold text-lg select-none">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 2D Matrix / Grid View */}
        {hasMatrix && matrixState && (
          <div className="flex flex-col gap-2 py-4">
            {matrixState.grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-2">
                {row.map((cell, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="w-11 h-11 rounded-lg border border-white/[0.08] bg-[#1a1a20] flex items-center justify-center font-mono text-xs text-[#f4f4f5]"
                  >
                    {cell.val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Step Narrative & Explanation Bar */}
      {stepExplanation && (
        <div className="px-6 py-2.5 bg-[#14141a] border-t border-white/[0.06] text-xs text-[#d4d4d8] flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#ffa116] animate-ping shrink-0" />
          <span className="font-bold text-[#ffa116] uppercase text-[10px] tracking-wider shrink-0">Action</span>
          <span className="truncate text-xs leading-relaxed text-[#f4f4f5]">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
