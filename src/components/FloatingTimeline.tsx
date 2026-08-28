import React, { useEffect } from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface FloatingTimelineProps {
  currentStep: number;
  totalSteps: number;
  onStepForward: () => void;
  onStepBack: () => void;
  onFirst: () => void;
  onLast: () => void;
  onScrub: (stepIndex: number) => void;
}

export const FloatingTimeline: React.FC<FloatingTimelineProps> = ({
  currentStep,
  totalSteps,
  onStepForward,
  onStepBack,
  onFirst,
  onLast,
  onScrub,
}) => {
  // Keyboard navigation for Prev / Next / First / Last
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is typing in an input or monaco editor
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.monaco-editor')) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < totalSteps - 1) onStepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 0) onStepBack();
      } else if (e.key === 'Home') {
        e.preventDefault();
        onFirst();
      } else if (e.key === 'End') {
        e.preventDefault();
        onLast();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, onStepForward, onStepBack, onFirst, onLast]);

  const hasSteps = totalSteps > 0;
  const isAtStart = currentStep <= 0;
  const isAtEnd = currentStep >= totalSteps - 1;

  return (
    <div className="h-12 bg-[#141418] border-t border-white/[0.08] px-5 flex items-center justify-between gap-6 shrink-0 select-none shadow-2xl z-30">
      {/* 4 Python Tutor Buttons: << First | < Prev | Next > | Last >> */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onFirst}
          disabled={!hasSteps || isAtStart}
          className="px-2.5 py-1.5 rounded-lg bg-[#202028] hover:bg-[#2a2a36] text-[#d4d4d8] hover:text-white border border-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 text-xs font-mono font-semibold shadow-sm active:scale-95"
          title="Jump to First Step (Home)"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">First</span>
        </button>

        <button
          onClick={onStepBack}
          disabled={!hasSteps || isAtStart}
          className="px-3 py-1.5 rounded-lg bg-[#202028] hover:bg-[#2a2a36] text-[#d4d4d8] hover:text-white border border-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 text-xs font-mono font-semibold shadow-sm active:scale-95"
          title="Previous Step (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <button
          onClick={onStepForward}
          disabled={!hasSteps || isAtEnd}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-[#ffa116] to-[#e08905] hover:from-[#ffb23d] hover:to-[#ffa116] text-[#0d0d10] font-bold text-xs font-mono border border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 shadow-[0_2px_10px_rgba(255,161,22,0.25)] active:scale-95 mx-0.5"
          title="Next Step (Right Arrow)"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>

        <button
          onClick={onLast}
          disabled={!hasSteps || isAtEnd}
          className="px-2.5 py-1.5 rounded-lg bg-[#202028] hover:bg-[#2a2a36] text-[#d4d4d8] hover:text-white border border-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 text-xs font-mono font-semibold shadow-sm active:scale-95"
          title="Jump to Last Step (End)"
        >
          <span className="hidden sm:inline">Last</span>
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrubber Range Slider & Step Counter */}
      <div className="flex-1 flex items-center gap-4 max-w-xl">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onScrub(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full h-1.5 bg-[#262632] rounded-lg appearance-none cursor-pointer accent-[#ffa116]"
        />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1e1e26] border border-white/[0.06] text-xs font-mono whitespace-nowrap shadow-inner shrink-0">
          <span className="text-[#71717a]">Step</span>
          <strong className="text-[#ffa116] font-bold">{hasSteps ? currentStep + 1 : 0}</strong>
          <span className="text-[#71717a]">of</span>
          <strong className="text-[#f4f4f5]">{totalSteps}</strong>
        </div>
      </div>
    </div>
  );
};
