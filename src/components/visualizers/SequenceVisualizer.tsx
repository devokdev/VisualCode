import React from 'react';
import type { LinkedListNodeData, ArrayElementData, MatrixState } from '../../types';

interface SequenceVisualizerProps {
  linkedListState?: LinkedListNodeData[] | null;
  arrayState?: ArrayElementData[] | null;
  matrixState?: MatrixState | null;
  stepExplanation?: string;
}

export const SequenceVisualizer: React.FC<SequenceVisualizerProps> = ({
  linkedListState,
  arrayState,
  matrixState,
  stepExplanation,
}) => {
  const hasLinkedList = Boolean(linkedListState && linkedListState.length > 0);
  const hasArray = Boolean(arrayState && arrayState.length > 0);
  const hasMatrix = Boolean(matrixState && matrixState.grid && matrixState.grid.length > 0);
  const hasData = hasLinkedList || hasArray || hasMatrix;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#141418] overflow-hidden select-none">
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6">
        {!hasData && (
          <div className="text-center text-xs text-[#71717a] p-8">
            Sequence data structure is empty or being initialized
          </div>
        )}

        {/* Linked List View */}
        {hasLinkedList && linkedListState && (
          <div className="flex flex-wrap items-center gap-2 justify-center py-6">
            {linkedListState.map((node, idx) => {
              const isActive = node.status === 'active';
              return (
                <div key={node.id || idx} className="flex items-center">
                  <div className="flex flex-col items-center">
                    {/* Pointers above node */}
                    <div className="h-6 flex items-center gap-1 mb-1">
                      {node.pointers?.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#ffa116] text-[#0d0d10] shadow-md"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Node Box */}
                    <div
                      className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'border-[#ffa116] bg-[#24242c] text-[#ffa116] shadow-[0_0_12px_rgba(255,161,22,0.3)] scale-105 font-bold'
                          : node.status === 'visited'
                          ? 'border-white/20 bg-[#1e1e24] text-[#d4d4d8]'
                          : 'border-white/[0.08] bg-[#1a1a1f] text-[#f4f4f5]'
                      }`}
                    >
                      <span className="text-sm font-bold">{node.val}</span>
                      <span className="text-[9px] text-[#71717a] font-mono">val</span>
                    </div>
                  </div>

                  {/* Arrow to next */}
                  {idx < linkedListState.length - 1 && (
                    <div className="mx-2 text-[#71717a] font-bold text-base select-none">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Array View */}
        {hasArray && arrayState && (
          <div className="flex flex-wrap items-end gap-2 justify-center py-6">
            {arrayState.map((elem) => {
              const isActive = elem.status === 'active';
              const isCompared = elem.status === 'compared';
              return (
                <div key={elem.index} className="flex flex-col items-center">
                  {/* Pointers above box */}
                  <div className="h-7 flex flex-wrap items-center justify-center gap-1 mb-1">
                    {elem.pointers?.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#ffa116] text-[#0d0d10] shadow-md"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Array Cell */}
                  <div
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-[#ffa116] bg-[#24242c] text-[#ffa116] font-bold shadow-[0_0_12px_rgba(255,161,22,0.3)] scale-105'
                        : isCompared
                        ? 'border-[#ffb23d] bg-[#1e1e24] text-[#ffb23d] font-bold'
                        : 'border-white/[0.08] bg-[#1a1a1f] text-[#f4f4f5]'
                    }`}
                  >
                    <span className="text-base font-mono font-semibold">{elem.val}</span>
                  </div>

                  {/* Index beneath */}
                  <span className="text-[10px] text-[#71717a] font-mono mt-1">[{elem.index}]</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 2D Matrix View */}
        {hasMatrix && matrixState && (
          <div className="flex flex-col gap-1.5 py-4">
            {matrixState.grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1.5">
                {row.map((cell, cIdx) => {
                  const isActive = cell.status === 'active';
                  const isVisited = cell.status === 'visited';
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center relative transition-all ${
                        isActive
                          ? 'border-[#ffa116] bg-[#24242c] text-[#ffa116] font-bold shadow-[0_0_10px_rgba(255,161,22,0.3)]'
                          : isVisited
                          ? 'border-[#10b981]/60 bg-[#0d261e] text-[#10b981]'
                          : 'border-white/[0.08] bg-[#1a1a1f] text-[#f4f4f5]'
                      }`}
                    >
                      <span className="text-xs font-mono">{cell.val}</span>
                      {cell.pointers && cell.pointers.length > 0 && (
                        <div className="absolute -top-2 bg-[#ffa116] text-[8px] text-[#0d0d10] px-1 rounded font-bold">
                          {cell.pointers[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {stepExplanation && (
        <div className="px-4 py-2 bg-[#101014] border-t border-white/[0.06] text-xs text-[#d4d4d8] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
          <span className="font-semibold text-[#ffa116]">Action:</span>
          <span className="truncate">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
