import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface TraceControlsProps {
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

export const TraceControls: React.FC<TraceControlsProps> = ({
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
          onPlayToggle(); // pause at end
        }
      }, 1200 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStep, totalSteps, speed, onStepForward, onPlayToggle]);

  return (
    <div className="flex flex-col gap-2 bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onStepBack}
            disabled={currentStep === 0}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps - 1}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded border border-sky-800/50">
            Step {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}
          </span>

          {/* Speed Selector */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  speed === s
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress timeline scrubber */}
      <div className="relative flex items-center pt-1">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onScrub(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
      </div>
    </div>
  );
};
