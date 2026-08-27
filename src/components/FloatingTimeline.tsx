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
    <div className="h-12 bg-[#221D1A] border-t border-[#3D322A] px-6 flex items-center justify-between gap-6 shrink-0 select-none">
      {/* Play / Back / Forward */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          disabled={currentStep === 0}
          className="p-1 rounded text-[#9E948C] hover:text-[#EAE5DF] disabled:opacity-30 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onStepBack}
          disabled={currentStep === 0}
          className="p-1 rounded text-[#9E948C] hover:text-[#EAE5DF] disabled:opacity-30 transition-colors"
          title="Step Back"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayToggle}
          className="p-1.5 rounded-lg bg-[#B38A4A] hover:bg-[#C59B58] text-[#171412] font-bold transition-all shadow-sm flex items-center justify-center mx-1"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-[#171412]" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-[#171412]" />
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentStep >= totalSteps - 1}
          className="p-1 rounded text-[#9E948C] hover:text-[#EAE5DF] disabled:opacity-30 transition-colors"
          title="Step Forward"
        >
          <SkipForward className="w-4 h-4" />
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
          className="w-full h-1 bg-[#171412] rounded appearance-none cursor-pointer accent-[#B38A4A]"
        />

        <span className="text-xs font-mono font-medium text-[#9E948C] whitespace-nowrap">
          Step <strong className="text-[#EAE5DF]">{totalSteps > 0 ? currentStep + 1 : 0}</strong> / {totalSteps}
        </span>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 bg-[#171412] p-0.5 rounded-md border border-[#3D322A]">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              speed === s
                ? 'bg-[#2A2421] text-[#B38A4A] font-bold'
                : 'text-[#6B625B] hover:text-[#9E948C]'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
};
