import React, { useState, useEffect } from 'react';
import type { ProblemContext } from '../types';
import { Play, Plus, Terminal, RefreshCw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface CustomInputConsoleProps {
  problem: ProblemContext | null;
  activeInput: string;
  onApplyInput: (newInput: string) => void;
  onRun: () => void;
  isLoading?: boolean;
}

export const CustomInputConsole: React.FC<CustomInputConsoleProps> = ({
  problem,
  activeInput,
  onApplyInput,
  onRun,
  isLoading = false,
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number | 'custom'>(0);
  const [inputValue, setInputValue] = useState<string>(activeInput);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    setInputValue(activeInput);
  }, [activeInput]);

  const examples = problem?.examples || [];

  const handleSelectCase = (idx: number) => {
    setSelectedCaseIdx(idx);
    const caseInput = examples[idx]?.input || '';
    setInputValue(caseInput);
    onApplyInput(caseInput);
  };

  const handleSelectCustom = () => {
    setSelectedCaseIdx('custom');
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setSelectedCaseIdx('custom');
    onApplyInput(val);
  };

  const handleResetToDefault = () => {
    if (examples.length > 0) {
      handleSelectCase(0);
    }
  };

  return (
    <div className="bg-[#15151c] border-t-2 border-[#ffa116]/30 flex flex-col select-none shrink-0 shadow-2xl z-20">
      {/* Console Header Bar */}
      <div className="px-4 py-2 bg-[#1c1c24] border-b border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#ffa116]">
            <Terminal className="w-4 h-4" />
            <span>Testcase Console</span>
          </div>

          <div className="flex items-center gap-1.5 ml-2 overflow-x-auto no-scrollbar">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleSelectCase(idx);
                  setIsExpanded(true);
                }}
                className={`px-2.5 py-0.5 text-xs font-mono rounded-md transition-all flex items-center gap-1 shrink-0 ${
                  selectedCaseIdx === idx
                    ? 'bg-[#ffa116] text-[#0d0d10] font-bold shadow-md'
                    : 'bg-[#262632] text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.06]'
                }`}
              >
                <span>Case {idx + 1}</span>
              </button>
            ))}

            <button
              onClick={() => {
                handleSelectCustom();
                setIsExpanded(true);
              }}
              className={`px-2.5 py-0.5 text-xs font-mono rounded-md transition-all flex items-center gap-1 shrink-0 ${
                selectedCaseIdx === 'custom'
                  ? 'bg-[#ffa116] text-[#0d0d10] font-bold shadow-md'
                  : 'bg-[#262632] text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.06]'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefault}
            title="Reset to Case 1"
            className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.04] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Console' : 'Expand Console'}
            className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.04] transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            onClick={onRun}
            disabled={isLoading}
            className="px-3 py-1 bg-gradient-to-b from-[#ffa116] to-[#e08905] hover:from-[#ffb23d] hover:to-[#ffa116] active:scale-95 text-[#0d0d10] font-bold text-xs rounded-md transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <Sparkles className="w-3 h-3 animate-spin fill-[#0d0d10]" />
            ) : (
              <Play className="w-3 h-3 fill-[#0d0d10]" />
            )}
            <span>Run Testcase</span>
          </button>
        </div>
      </div>

      {/* Expandable Input Content */}
      {isExpanded && (
        <div className="p-3 bg-[#15151c] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71717a]">
            <span>Active Input string (modify below to trace custom data):</span>
            {selectedCaseIdx !== 'custom' && (
              <span className="text-[#ffa116]">Using Example Case {(selectedCaseIdx as number) + 1}</span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
              className="w-full bg-[#1e1e28] border border-white/[0.12] rounded-lg px-3.5 py-2 text-xs text-[#ffa116] font-mono font-semibold focus:outline-none focus:border-[#ffa116] focus:bg-[#22222e] transition-all shadow-inner"
            />
          </div>
        </div>
      )}
    </div>
  );
};
