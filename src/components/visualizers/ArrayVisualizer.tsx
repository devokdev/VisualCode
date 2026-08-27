import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayElementData, MatrixState, TraceStep } from '../../types';
import { computeStateTransitionDiff } from '../../services/transitionDiff';
import { Activity, ArrowDown } from 'lucide-react';

interface ArrayVisualizerProps {
  currentStep?: TraceStep | null;
  prevStep?: TraceStep | null;
  arrayState?: ArrayElementData[] | null;
  matrixState?: MatrixState | null;
  variables?: Record<string, any>;
  stepExplanation?: string;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  currentStep,
  prevStep,
  arrayState,
  matrixState,
  stepExplanation,
}) => {
  const diff = computeStateTransitionDiff(currentStep, prevStep);

  const hasNamedArrays = diff.namedArrays.length > 0;
  const hasSingleArray = Boolean(arrayState && arrayState.length > 0);
  const hasMatrix = Boolean(matrixState && matrixState.grid && matrixState.grid.length > 0);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111114] overflow-hidden select-none">
      {/* Live Reactive Variable Diff Bar */}
      <div className="px-5 py-2.5 bg-[#16161b] border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#ffa116]" />
          <span className="text-xs font-bold text-[#f4f4f5] tracking-wide">Framer Motion Transition Engine</span>
        </div>

        {/* Live Variable Badges (Highlights mutations with Old -> New diffs) */}
        <div className="flex items-center gap-2 flex-wrap">
          {diff.variableDiffs.map((v) => {
            if (Array.isArray(v.currentVal)) return null;
            return (
              <motion.div
                key={v.name}
                layout
                animate={{
                  scale: v.hasChanged ? [1, 1.1, 1] : 1,
                  borderColor: v.hasChanged ? '#ffa116' : 'rgba(255,255,255,0.08)',
                }}
                transition={{ duration: 0.3 }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-sm border ${
                  v.hasChanged
                    ? 'bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116]'
                    : 'bg-[#22222a] border-white/[0.08] text-[#d4d4d8]'
                }`}
              >
                <span className="font-semibold">{v.name}</span>
                <span className="text-[#71717a]">=</span>
                {v.hasChanged && v.prevVal !== undefined ? (
                  <span className="flex items-center gap-1">
                    <span className="line-through text-[#71717a] text-[10px]">{String(v.prevVal)}</span>
                    <span className="text-[#ffa116] font-bold">→ {String(v.currentVal)}</span>
                  </span>
                ) : (
                  <span className="font-bold text-[#f4f4f5]">{String(v.currentVal)}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Dynamic Animation Canvas */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 space-y-8">
        {!hasNamedArrays && !hasSingleArray && !hasMatrix && (
          <div className="text-center text-xs text-[#71717a] p-8">
            Initializing array execution state...
          </div>
        )}

        {/* Multi-Array Animations with Reactive Cell Transformations */}
        {hasNamedArrays && (
          <div className="w-full max-w-2xl space-y-6">
            {diff.namedArrays.map((arrVar, arrIdx) => (
              <motion.div
                key={arrVar.name}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="p-5 rounded-2xl bg-[#16161b] border border-white/[0.07] shadow-xl relative"
              >
                {/* Array Header Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ffa116] bg-[#ffa116]/10 px-2.5 py-0.5 rounded-md border border-[#ffa116]/20">
                      {arrVar.name}[]
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      length: {arrVar.items.length}
                    </span>
                  </div>

                  {arrIdx === 0 && diff.namedArrays.length > 1 && (
                    <div className="flex items-center gap-1 text-[11px] text-[#71717a] font-medium">
                      <span>Source Array</span>
                      <ArrowDown className="w-3.5 h-3.5 text-[#ffa116]" />
                    </div>
                  )}
                </div>

                {/* Animated Cells with Physics Transition */}
                <div className="flex flex-wrap items-end gap-3">
                  <AnimatePresence mode="popLayout">
                    {arrVar.items.map((item) => {
                      const isPointed = item.pointers.length > 0;
                      const isMutated = item.isChanged;

                      return (
                        <motion.div
                          key={`${arrVar.name}-${item.index}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{
                            scale: isPointed ? 1.08 : 1,
                            opacity: isPointed || isMutated ? 1.0 : 0.65, // Dim unchanged cells for clarity
                          }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className="flex flex-col items-center"
                        >
                          {/* Animated Pointer Badge */}
                          <div className="h-6 flex items-center justify-center gap-1 mb-1">
                            {item.pointers.map((ptr) => (
                              <motion.span
                                key={ptr}
                                layoutId={`pointer-${ptr}`}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md flex items-center gap-0.5"
                              >
                                <span>{ptr}</span>
                              </motion.span>
                            ))}
                          </div>

                          {/* Animated Array Cell Box */}
                          <motion.div
                            layout
                            animate={{
                              borderColor: isMutated
                                ? '#10b981'
                                : isPointed
                                ? '#ffa116'
                                : 'rgba(255,255,255,0.08)',
                              backgroundColor: isMutated
                                ? '#0d261e'
                                : isPointed
                                ? '#2e2b24'
                                : '#1a1a20',
                            }}
                            transition={{ duration: 0.25 }}
                            className="w-13 h-13 rounded-xl border-2 flex flex-col items-center justify-center shadow-md relative"
                          >
                            <span
                              className={`text-base font-mono font-bold ${
                                isMutated
                                  ? 'text-[#10b981]'
                                  : isPointed
                                  ? 'text-[#ffa116]'
                                  : 'text-[#f4f4f5]'
                              }`}
                            >
                              {item.val !== undefined && item.val !== null ? String(item.val) : '0'}
                            </span>

                            {/* Mutated Delta Badge */}
                            {isMutated && item.prevVal !== undefined && (
                              <span className="text-[8px] font-mono text-[#10b981] absolute -bottom-1 bg-[#0d261e] px-1 rounded border border-[#10b981]/40">
                                was {String(item.prevVal)}
                              </span>
                            )}
                          </motion.div>

                          <span className="text-[11px] text-[#71717a] font-mono mt-1.5 font-medium">
                            [{item.index}]
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Single Array Fallback */}
        {!hasNamedArrays && hasSingleArray && arrayState && (
          <div className="flex flex-wrap items-end gap-3 justify-center py-6">
            <AnimatePresence mode="popLayout">
              {arrayState.map((elem) => {
                const isActive = elem.status === 'active' || (elem.pointers && elem.pointers.length > 0);
                return (
                  <motion.div
                    key={elem.index}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: isActive ? 1.0 : 0.65 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-6 flex items-center justify-center gap-1 mb-1">
                      {elem.pointers?.map((p) => (
                        <motion.span
                          key={p}
                          layoutId={`fallback-ptr-${p}`}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md"
                        >
                          {p}
                        </motion.span>
                      ))}
                    </div>

                    <motion.div
                      animate={{
                        scale: isActive ? 1.08 : 1,
                        borderColor: isActive ? '#ffa116' : 'rgba(255,255,255,0.08)',
                      }}
                      className="w-13 h-13 rounded-xl border-2 flex items-center justify-center bg-[#1a1a20] text-[#f4f4f5] shadow-md"
                    >
                      <span className="text-base font-mono font-bold">{elem.val}</span>
                    </motion.div>

                    <span className="text-[11px] text-[#71717a] font-mono mt-1.5">[{elem.index}]</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* 2D Matrix / Grid with Motion Layout */}
        {hasMatrix && matrixState && (
          <div className="flex flex-col gap-2 py-4">
            {matrixState.grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-2">
                {row.map((cell, cIdx) => (
                  <motion.div
                    key={`${rIdx}-${cIdx}`}
                    layout
                    animate={{
                      scale: cell.status === 'active' ? 1.1 : 1,
                      borderColor: cell.status === 'active' ? '#ffa116' : 'rgba(255,255,255,0.08)',
                      backgroundColor: cell.status === 'active' ? '#2e2b24' : '#1a1a20',
                    }}
                    className="w-11 h-11 rounded-lg border flex items-center justify-center font-mono text-xs text-[#f4f4f5]"
                  >
                    {cell.val}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step Explanation Bar */}
      {stepExplanation && (
        <div className="px-6 py-2.5 bg-[#14141a] border-t border-white/[0.06] text-xs text-[#d4d4d8] flex items-center gap-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ffa116] animate-ping shrink-0" />
          <span className="font-bold text-[#ffa116] uppercase text-[10px] tracking-wider shrink-0">Action</span>
          <span className="truncate text-xs text-[#f4f4f5]">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
