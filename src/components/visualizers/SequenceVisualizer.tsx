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
  return (
    <div className="relative w-full h-full flex flex-col bg-[#0e0f15] rounded-2xl border border-[#d4af37]/20 overflow-hidden select-none p-5 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#d4af37] bg-[#1a1b26] px-3 py-1 rounded-lg border border-[#d4af37]/25 shadow-sm">
          {linkedListState ? '🔗 Linked List' : matrixState ? '🧱 2D Matrix / Grid' : '📊 Array & Pointers'}
        </span>
      </div>

      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4">
        {/* Linked List View */}
        {linkedListState && (
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
                          className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#d4af37] text-[#0a0a0e] shadow-md animate-bounce"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Node Box */}
                    <div
                      className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'border-[#d4af37] bg-[#222436] shadow-[0_0_16px_rgba(212,175,55,0.3)] scale-105'
                          : node.status === 'visited'
                          ? 'border-[#4a4759] bg-[#141520]'
                          : 'border-[#d4af37]/25 bg-[#090a0f]'
                      }`}
                    >
                      <span className="text-sm font-bold text-[#f3f0e6]">{node.val}</span>
                      <span className="text-[9px] text-[#8e897a] font-mono">val</span>
                    </div>
                  </div>

                  {/* Arrow to next */}
                  {idx < linkedListState.length - 1 && (
                    <div className="flex items-center mx-1.5 text-[#d4af37]/70">
                      <span className="text-base font-bold">→</span>
                    </div>
                  )}
                  {idx === linkedListState.length - 1 && (
                    <div className="flex items-center ml-2 text-[#716e7d] font-mono text-xs">
                      → <span className="ml-1 text-[#ff375f] font-semibold">null</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Array View */}
        {arrayState && (
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
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md shadow-md ${
                          p === 'left' || p === 'i'
                            ? 'bg-[#d4af37] text-[#0a0a0e]'
                            : p === 'right' || p === 'j'
                            ? 'bg-[#ff375f] text-white'
                            : 'bg-[#00b8a3] text-[#0a0a0e]'
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Array Cell */}
                  <div
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-[#d4af37] bg-[#222436] text-[#e6c97a] font-bold shadow-[0_0_14px_rgba(212,175,55,0.35)] scale-105'
                        : isCompared
                        ? 'border-[#ffc01e] bg-[#231f13] text-[#ffc01e] font-bold'
                        : 'border-[#d4af37]/20 bg-[#090a0f] text-[#e2e8f0]'
                    }`}
                  >
                    <span className="text-base font-mono font-semibold">{elem.val}</span>
                  </div>

                  {/* Index beneath */}
                  <span className="text-[10px] text-[#716e7d] font-mono mt-1">[{elem.index}]</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 2D Matrix View */}
        {matrixState && (
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
                          ? 'border-[#d4af37] bg-[#222436] text-[#e6c97a] font-bold shadow-[0_0_10px_rgba(212,175,55,0.35)]'
                          : isVisited
                          ? 'border-[#00b8a3]/60 bg-[#0b201d] text-[#00b8a3]'
                          : 'border-[#d4af37]/15 bg-[#090a0f] text-[#e2e8f0]'
                      }`}
                    >
                      <span className="text-xs font-mono">{cell.val}</span>
                      {cell.pointers && cell.pointers.length > 0 && (
                        <div className="absolute -top-2 bg-[#d4af37] text-[8px] text-[#0a0a0e] px-1 rounded font-bold">
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
        <div className="px-4 py-2.5 bg-[#08090d] border-t border-[#d4af37]/15 text-xs text-[#c4bfb2] flex items-center gap-2 rounded-b-xl">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          <span className="font-semibold text-[#d4af37]">Action:</span>
          <span className="truncate">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
