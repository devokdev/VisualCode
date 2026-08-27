import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayElementData, MatrixState } from '../../types';
import { Activity, ArrowDown } from 'lucide-react';

interface ArrayVisualizerProps {
  arrayState?: ArrayElementData[] | null;
  matrixState?: MatrixState | null;
  variables?: Record<string, any>;
  stepExplanation?: string;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  arrayState,
  matrixState,
  variables = {},
  stepExplanation,
}) => {
  // Extract all array variables from active frame (e.g. nums, nums2, dp, result)
  const arrayVariables: { name: string; items: any[] }[] = [];

  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] !== 'object') {
        arrayVariables.push({ name: key, items: val });
      }
    });
  }

  // Active pointer indices from scalar numbers
  const pointerMap: Record<string, number> = {};
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      if (typeof v === 'number' && !Array.isArray(v) && v >= 0) {
        pointerMap[k] = v;
      }
    });
  }

  const effectiveArrayState: ArrayElementData[] = (arrayState && arrayState.length > 0) ? arrayState : [];
  const hasNamedArrays = arrayVariables.length > 0;
  const hasSingleArray = effectiveArrayState.length > 0;
  const hasMatrix = Boolean(matrixState && matrixState.grid && matrixState.grid.length > 0);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111114] overflow-hidden select-none">
      {/* Variable Pills Header */}
      <div className="px-5 py-2.5 bg-[#16161b] border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#ffa116]" />
          <span className="text-xs font-bold text-[#f4f4f5] tracking-wide">Framer Motion Array Engine</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {variables &&
            Object.entries(variables).map(([k, v]) => {
              if (Array.isArray(v)) return null;
              return (
                <motion.div
                  key={k}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2.5 py-1 rounded-lg bg-[#22222a] border border-white/[0.08] text-xs font-mono flex items-center gap-1.5 shadow-sm"
                >
                  <span className="text-[#ffa116] font-semibold">{k}</span>
                  <span className="text-[#71717a]">=</span>
                  <span className="text-[#f4f4f5] font-bold">{String(v)}</span>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Main Dynamic Animation Canvas */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 space-y-8">
        {!hasNamedArrays && !hasSingleArray && !hasMatrix && (
          <div className="text-center text-xs text-[#71717a] p-8">
            Array / DP state initializing...
          </div>
        )}

        {/* Multi-Array Animations with Framer Motion layout transitions */}
        {hasNamedArrays && (
          <div className="w-full max-w-2xl space-y-6">
            {arrayVariables.map((arrVar, arrIdx) => (
              <div
                key={arrVar.name}
                className="p-5 rounded-2xl bg-[#16161b] border border-white/[0.07] shadow-xl relative"
              >
                <div className="flex items-center justify-between mb-4">
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

                <div className="flex flex-wrap items-end gap-3">
                  <AnimatePresence>
                    {arrVar.items.map((val, idx) => {
                      const activePointers = Object.entries(pointerMap)
                        .filter(([_, ptrVal]) => ptrVal === idx)
                        .map(([ptrName]) => ptrName);

                      const isPointed = activePointers.length > 0;

                      return (
                        <motion.div
                          key={`${arrVar.name}-${idx}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className="flex flex-col items-center"
                        >
                          {/* Animated Pointer Badge */}
                          <div className="h-6 flex items-center justify-center gap-1 mb-1">
                            {activePointers.map((ptr) => (
                              <motion.span
                                key={ptr}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -8, opacity: 0 }}
                                className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md"
                              >
                                {ptr}
                              </motion.span>
                            ))}
                          </div>

                          {/* Animated Array Cell */}
                          <motion.div
                            animate={{
                              scale: isPointed ? 1.08 : 1,
                              borderColor: isPointed ? '#ffa116' : 'rgba(255,255,255,0.08)',
                            }}
                            transition={{ duration: 0.2 }}
                            className={`w-13 h-13 rounded-xl border-2 flex items-center justify-center transition-colors shadow-md ${
                              isPointed
                                ? 'bg-gradient-to-b from-[#2e2b24] to-[#22201b] text-[#ffa116] font-bold shadow-[0_0_16px_rgba(255,161,22,0.25)]'
                                : 'bg-[#1a1a20] text-[#f4f4f5]'
                            }`}
                          >
                            <span className="text-base font-mono font-bold">
                              {val !== undefined && val !== null ? String(val) : '0'}
                            </span>
                          </motion.div>

                          <span className="text-[11px] text-[#71717a] font-mono mt-1.5 font-medium">
                            [{idx}]
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Single Array Fallback */}
        {!hasNamedArrays && hasSingleArray && (
          <div className="flex flex-wrap items-end gap-3 justify-center py-6">
            <AnimatePresence>
              {effectiveArrayState.map((elem) => {
                const isActive = elem.status === 'active' || (elem.pointers && elem.pointers.length > 0);
                return (
                  <motion.div
                    key={elem.index}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-6 flex items-center justify-center gap-1 mb-1">
                      {elem.pointers?.map((p) => (
                        <motion.span
                          key={p}
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md"
                        >
                          {p}
                        </motion.span>
                      ))}
                    </div>

                    <motion.div
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      className={`w-13 h-13 rounded-xl border-2 flex items-center justify-center transition-all ${
                        isActive
                          ? 'border-[#ffa116] bg-[#2e2b24] text-[#ffa116] font-bold shadow-[0_0_14px_rgba(255,161,22,0.3)]'
                          : 'border-white/[0.08] bg-[#1a1a20] text-[#f4f4f5]'
                      }`}
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

        {/* 2D Matrix / Grid with Motion Stagger */}
        {hasMatrix && matrixState && (
          <div className="flex flex-col gap-2 py-4">
            {matrixState.grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-2">
                {row.map((cell, cIdx) => (
                  <motion.div
                    key={`${rIdx}-${cIdx}`}
                    layout
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`w-11 h-11 rounded-lg border flex items-center justify-center font-mono text-xs ${
                      cell.status === 'active'
                        ? 'border-[#ffa116] bg-[#2e2b24] text-[#ffa116] font-bold'
                        : 'border-white/[0.08] bg-[#1a1a20] text-[#f4f4f5]'
                    }`}
                  >
                    {cell.val}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

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
