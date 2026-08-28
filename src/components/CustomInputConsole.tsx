import React, { useState, useEffect } from 'react';
import type { ProblemContext } from '../types';
import { Play, Check, Plus, Terminal, RefreshCw } from 'lucide-react';

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
    <div className="bg-[#141418] border-t border-white/[0.06] px-4 py-2.5 flex flex-col gap-2 select-none shrink-0 shadow-lg">
      {/* Top row: Case Selector Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-[#71717a] text-xs font-mono font-semibold mr-1 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-[#ffa116]" />
            <span>Testcase:</span>
          </div>

          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectCase(idx)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1 shrink-0 ${
                selectedCaseIdx === idx
                  ? 'bg-[#22222a] text-[#ffa116] border border-[#ffa116]/30 font-bold shadow-sm'
                  : 'bg-[#18181e] text-[#8c8c8c] hover:text-[#eff1f6] border border-white/[0.04]'
              }`}
            >
              <span>Case {idx + 1}</span>
            </button>
          ))}

          <button
            onClick={handleSelectCustom}
            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1 shrink-0 ${
              selectedCaseIdx === 'custom'
                ? 'bg-[#22222a] text-[#ffa116] border border-[#ffa116]/30 font-bold shadow-sm'
                : 'bg-[#18181e] text-[#8c8c8c] hover:text-[#eff1f6] border border-white/[0.04]'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Custom</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetToDefault}
            title="Reset to Case 1 default"
            className="p-1 rounded text-[#71717a] hover:text-[#eff1f6] hover:bg-white/[0.04] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRun}
            disabled={isLoading}
            className="px-3 py-1 bg-[#ffa116] hover:bg-[#ffb23d] active:scale-95 text-[#0d0d10] font-bold text-xs rounded-md transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-[#0d0d10]" />
            <span>Trace Input</span>
          </button>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="e.g. nums = [1,2,3,4,5,6,7], k = 3 or root = [1,2,3,null,4]"
          className="w-full bg-[#18181e] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-[#eff1f6] font-mono focus:outline-none focus:border-[#ffa116]/50 focus:bg-[#1c1c22] transition-all shadow-inner"
        />
      </div>
    </div>
  );
};
