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
    <div className="relative w-full h-full flex flex-col bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden select-none p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm backdrop-blur">
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
                          className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500 text-white shadow-sm animate-bounce"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Node Box */}
                    <div
                      className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'border-sky-400 bg-sky-950/80 shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-105'
                          : node.status === 'visited'
                          ? 'border-slate-600 bg-slate-800/60'
                          : 'border-slate-700 bg-slate-900/80'
                      }`}
                    >
                      <span className="text-sm font-bold text-slate-100">{node.val}</span>
                      <span className="text-[9px] text-slate-500 font-mono">val</span>
                    </div>
                  </div>

                  {/* Arrow to next */}
                  {idx < linkedListState.length - 1 && (
                    <div className="flex items-center mx-1 text-slate-400">
                      <span className="text-base font-bold">→</span>
                    </div>
                  )}
                  {idx === linkedListState.length - 1 && (
                    <div className="flex items-center ml-2 text-slate-500 font-mono text-xs">
                      → <span className="ml-1 text-red-400 font-semibold">null</span>
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
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded shadow-sm text-white ${
                          p === 'left' || p === 'i'
                            ? 'bg-sky-500'
                            : p === 'right' || p === 'j'
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Array Cell */}
                  <div
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isActive
                        ? 'border-sky-400 bg-sky-950/80 text-sky-200 font-bold shadow-[0_0_12px_rgba(56,189,248,0.5)] scale-105'
                        : isCompared
                        ? 'border-amber-400 bg-amber-950/80 text-amber-200 font-bold'
                        : 'border-slate-700 bg-slate-900/80 text-slate-200'
                    }`}
                  >
                    <span className="text-base font-mono font-semibold">{elem.val}</span>
                  </div>

                  {/* Index beneath */}
                  <span className="text-[10px] text-slate-500 font-mono mt-1">[{elem.index}]</span>
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
                      className={`w-10 h-10 rounded border flex flex-col items-center justify-center relative transition-all ${
                        isActive
                          ? 'border-sky-400 bg-sky-950/90 text-sky-200 font-bold shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                          : isVisited
                          ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-mono">{cell.val}</span>
                      {cell.pointers && cell.pointers.length > 0 && (
                        <div className="absolute -top-2 bg-indigo-600 text-[8px] text-white px-1 rounded font-bold">
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
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-medium text-sky-300">Action:</span>
          <span className="truncate">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
