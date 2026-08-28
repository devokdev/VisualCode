import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayElementData, MatrixState, TraceStep } from '../../types';
import { computeStateTransitionDiff } from '../../services/transitionDiff';
import { Activity, ArrowDown, Sparkles, CheckCircle2, Box, Database, ArrowRight } from 'lucide-react';

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

  // Extract any map/dictionary objects dynamically declared in the user's code
  const mapObjects: { name: string; entries: [string, any][] }[] = [];
  if (currentStep?.variables) {
    Object.entries(currentStep.variables).forEach(([k, v]) => {
      if (
        v &&
        typeof v === 'object' &&
        !Array.isArray(v) &&
        !('val' in v) &&
        Object.keys(v).length > 0
      ) {
        mapObjects.push({ name: k, entries: Object.entries(v) });
      }
    });
  }

  // Determine plain-English action category from explanation
  const explanation = currentStep?.explanation || stepExplanation || 'Executing step...';
  let actionType = 'TRANSFORMATION';
  let actionColor = 'bg-[#ffa116]/15 text-[#ffa116] border-[#ffa116]/30';

  if (explanation.includes('Swapp') || explanation.includes('swap')) {
    actionType = '🔄 SWAPPING VALUES';
    actionColor = 'bg-[#ffa116]/20 text-[#ffa116] border-[#ffa116]/40';
  } else if (explanation.includes('Loop') || explanation.includes('Checking') || explanation.includes('condition')) {
    actionType = '🔍 CHECKING CONDITION';
    actionColor = 'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/40';
  } else if (explanation.includes('temp') || explanation.includes('Stashed') || explanation.includes('holding')) {
    actionType = '📦 SAVING TO TEMP';
    actionColor = 'bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/40';
  } else if (explanation.includes('Pointer') || explanation.includes('Moved') || explanation.includes('Advanced')) {
    actionType = '➡️ MOVING POINTERS';
    actionColor = 'bg-[#14b8a6]/20 text-[#2dd4bf] border-[#14b8a6]/40';
  } else if (explanation.includes('Match Found') || explanation.includes('Success')) {
    actionType = '🎯 TARGET FOUND';
    actionColor = 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40';
  } else if (explanation.includes('Completed') || explanation.includes('Finished')) {
    actionType = '🏁 FINISHED';
    actionColor = 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40';
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0e0e12] overflow-hidden select-none">
      {/* 1. Hero Narrative Explanation Card (Plain English for Non-Coders) */}
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 bg-gradient-to-r from-[#181820] via-[#15151c] to-[#181820] border-b border-white/[0.08] flex flex-col gap-2 shrink-0 shadow-md"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${actionColor}`}>
              {actionType}
            </span>
            <span className="text-xs font-mono text-[#71717a]">
              Step <strong className="text-[#f4f4f5]">{currentStep?.step || 1}</strong>: Line {currentStep?.line || 1}
            </span>
          </div>

          {/* Mini Variable Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {diff.variableDiffs.map((v) => {
              if (Array.isArray(v.currentVal) || typeof v.currentVal === 'object') return null;
              return (
                <motion.div
                  key={v.name}
                  layout
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono flex items-center gap-1.5 border shadow-sm ${
                    v.hasChanged
                      ? 'bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116]'
                      : 'bg-[#22222c] border-white/[0.07] text-[#a1a1aa]'
                  }`}
                >
                  <span className="font-semibold text-[#ffa116]">{v.name}</span>
                  <span>=</span>
                  {v.hasChanged && v.prevVal !== undefined ? (
                    <span className="flex items-center gap-1">
                      <span className="line-through text-[#71717a] text-[10px]">{String(v.prevVal)}</span>
                      <span className="text-[#ffa116] font-bold">➔ {String(v.currentVal)}</span>
                    </span>
                  ) : (
                    <span className="font-bold text-[#f4f4f5]">{String(v.currentVal)}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Big Plain-English Narrative */}
        <p className="text-xs text-[#e4e4e7] leading-relaxed font-sans font-medium">
          {explanation}
        </p>
      </motion.div>

      {/* 2. Main Dynamic Visual Canvas */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-6 space-y-8">
        {!hasNamedArrays && !hasSingleArray && !hasMatrix && (
          <div className="text-center text-xs text-[#71717a] p-8 flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#ffa116] animate-pulse" />
            <span>Ready to trace. Click <strong className="text-[#ffa116]">Run</strong> in the top bar.</span>
          </div>
        )}

        {/* Arrays Section with Spring Physics */}
        {hasNamedArrays && (
          <div className="w-full max-w-3xl space-y-6">
            {diff.namedArrays.map((arrVar, arrIdx) => (
              <motion.div
                key={arrVar.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl bg-[#14141a] border border-white/[0.08] shadow-2xl relative"
              >
                {/* Array Header Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#ffa116] bg-[#ffa116]/10 px-3 py-1 rounded-lg border border-[#ffa116]/30 shadow-inner">
                      {arrVar.name}[]
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      {arrVar.items.length} elements
                    </span>
                  </div>

                  {arrIdx === 0 && diff.namedArrays.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#ffa116] font-semibold bg-[#ffa116]/10 px-2.5 py-0.5 rounded-full border border-[#ffa116]/20">
                      <span>Source Array</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Animated Interactive Cells */}
                <div className="flex flex-wrap items-end justify-center gap-3">
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
                            scale: isPointed ? 1.06 : 1,
                            opacity: 1,
                          }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                          className="flex flex-col items-center"
                        >
                          {/* Animated Pointer Badge Chips */}
                          <div className="h-7 flex items-center justify-center gap-1 mb-1">
                            {item.pointers.map((ptr) => (
                              <motion.span
                                key={ptr}
                                layoutId={`pointer-${ptr}`}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-md bg-gradient-to-b from-[#ffa116] to-[#e08905] text-[#0d0d10] shadow-[0_2px_8px_rgba(255,161,22,0.35)] flex items-center gap-0.5"
                              >
                                <span>{ptr}</span>
                                <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                              </motion.span>
                            ))}
                          </div>

                          {/* Array Cell Box */}
                          <motion.div
                            layout
                            animate={{
                              borderColor: isPointed
                                ? '#ffa116'
                                : isMutated
                                ? '#10b981'
                                : 'rgba(255,255,255,0.08)',
                              backgroundColor: isPointed
                                ? '#2a261c'
                                : isMutated
                                ? '#13281c'
                                : '#1a1a22',
                              boxShadow: isPointed
                                ? '0 0 20px rgba(255, 161, 22, 0.25)'
                                : isMutated
                                ? '0 0 15px rgba(16, 185, 129, 0.2)'
                                : 'none',
                            }}
                            className="w-14 h-14 rounded-xl border-2 flex items-center justify-center relative transition-all"
                          >
                            <span
                              className={`text-lg font-mono font-bold ${
                                isPointed
                                  ? 'text-[#ffa116]'
                                  : isMutated
                                  ? 'text-[#34d399]'
                                  : 'text-[#f4f4f5]'
                              }`}
                            >
                              {item.val !== undefined && item.val !== null ? String(item.val) : '0'}
                            </span>

                            {isMutated && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center shadow-md"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#0d0d10]" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Index Badge */}
                          <span className="text-[10px] font-mono text-[#71717a] mt-1.5">
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

        {/* 3. Dynamic Hash Map / Memory Tables (rendered ONLY if user declared a map object in code) */}
        {mapObjects.map((m) => (
          <motion.div
            key={m.name}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl p-5 rounded-2xl bg-[#14141a] border border-white/[0.08] shadow-2xl space-y-3"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#a855f7]" />
              <span className="text-xs font-mono font-bold text-[#f4f4f5]">
                {m.name} (Hash Map / Object)
              </span>
              <span className="text-[10px] text-[#71717a] font-mono">
                {m.entries.length} entries
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {m.entries.map(([k, v]) => (
                <div
                  key={k}
                  className="px-3 py-1.5 rounded-lg bg-[#1f1a29] border border-[#a855f7]/30 text-xs font-mono flex items-center gap-2 shadow-sm"
                >
                  <span className="text-[#c084fc] font-bold">{k}</span>
                  <ArrowRight className="w-3 h-3 text-[#71717a]" />
                  <span className="text-[#f4f4f5]">{JSON.stringify(v)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
