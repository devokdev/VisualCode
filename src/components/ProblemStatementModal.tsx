import React from 'react';
import type { ProblemContext } from '../types';
import { BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface ProblemStatementModalProps {
  problem: ProblemContext | null;
  isOpen: boolean;
  onClose: () => void;
  activeInput: string;
  onInputChange: (val: string) => void;
}

export const ProblemStatementModal: React.FC<ProblemStatementModalProps> = ({
  problem,
  isOpen,
  onClose,
  activeInput,
  onInputChange,
}) => {
  if (!isOpen || !problem) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#3a3a3a] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#242424] border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] flex items-center justify-center text-[#ffa116]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#eff1f6]">{problem.title}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    problem.difficulty === 'Easy'
                      ? 'badge-easy'
                      : problem.difficulty === 'Medium'
                      ? 'badge-medium'
                      : 'badge-hard'
                  }`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#2a2a2a] text-[#8c8c8c] border border-[#3a3a3a] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#ffa116]" />
                  <span>{problem.dataStructureType}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#8c8c8c] hover:text-[#eff1f6] px-2.5 py-1 rounded-md hover:bg-[#2e2e2e] transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#d4d4d4] leading-relaxed select-text">
          {/* Description */}
          <div className="bg-[#242424] p-4 rounded-xl border border-[#333333] whitespace-pre-line font-sans text-xs">
            {problem.description}
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#eff1f6] text-xs uppercase tracking-wider font-mono">Examples</h4>
              {problem.examples.map((ex, idx) => (
                <div key={idx} className="bg-[#242424] p-3.5 rounded-xl border border-[#333333] space-y-1.5 font-mono text-xs">
                  <div>
                    <span className="text-[#8c8c8c]">Input: </span>
                    <span className="text-[#ffa116] font-semibold">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-[#8c8c8c]">Output: </span>
                    <span className="text-[#2cbb5d] font-semibold">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-[11px] text-[#8c8c8c] font-sans pt-1 border-t border-[#333333]">
                      <span className="font-semibold text-[#eff1f6]">Explanation: </span>
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-[#eff1f6] text-xs uppercase tracking-wider font-mono">Constraints</h4>
              <ul className="list-disc pl-5 space-y-1 text-[#8c8c8c] font-mono text-[11px]">
                {problem.constraints.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Active Test Case Input Modifier */}
          <div className="bg-[#242424] p-3.5 rounded-xl border border-[#333333] space-y-2">
            <h4 className="font-bold text-[#eff1f6] text-xs uppercase tracking-wider font-mono">Active Execution Input</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeInput}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="e.g. root = [1,2,3,null,5,null,4]"
                className="flex-1 bg-[#1a1a1a] border border-[#383838] rounded-lg px-3 py-1.5 text-xs text-[#ffa116] font-mono focus:outline-none focus:border-[#ffa116]"
              />
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-[#ffa116] text-[#141414] font-bold rounded-lg text-xs hover:bg-[#ffb23d] transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
