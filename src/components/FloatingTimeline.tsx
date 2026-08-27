import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface FloatingTimelineProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onScrub: (stepIndex: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const FloatingTimeline: React.FC<FloatingTimelineProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayToggle,
  onStepForward,
  onStepBack,
  onReset,
  onScrub,
  speed,
  onSpeedChange,
}) => {
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStep < totalSteps - 1) {
          onStepForward();
        } else {
          onPlayToggle();
        }
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, speed, onStepForward, onPlayToggle]);

  return (
    <div className="h-10 bg-[#1a1a1a] border-t border-[#333333] px-4 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Play / Back / Forward */}
      <div className="flex items-center gap-1">
        <button
          onClick={onReset}
          disabled={currentStep === 0}
          className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] disabled:opacity-30 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onStepBack}
          disabled={currentStep === 0}
          className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] disabled:opacity-30 transition-colors"
          title="Step Back"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onPlayToggle}
          className="p-1.5 rounded bg-[#ffa116] hover:bg-[#ffb23d] text-[#141414] font-bold transition-all shadow-sm flex items-center justify-center mx-1"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 fill-[#141414]" />
          ) : (
            <Play className="w-3 h-3 fill-[#141414]" />
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentStep >= totalSteps - 1}
          className="p-1 rounded text-[#8c8c8c] hover:text-[#eff1f6] disabled:opacity-30 transition-colors"
          title="Step Forward"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrubber Timeline */}
      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onScrub(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full h-1 bg-[#262626] rounded appearance-none cursor-pointer accent-[#ffa116]"
        />

        <span className="text-xs font-mono text-[#8c8c8c] whitespace-nowrap">
          Step <strong className="text-[#eff1f6]">{totalSteps > 0 ? currentStep + 1 : 0}</strong> / {totalSteps}
        </span>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-0.5 bg-[#242424] p-0.5 rounded border border-[#333333]">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
              speed === s
                ? 'bg-[#333333] text-[#ffa116] font-bold'
                : 'text-[#8c8c8c] hover:text-[#eff1f6]'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
};
