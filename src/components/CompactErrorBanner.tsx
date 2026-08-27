import React, { useState } from 'react';
import type { ErrorClassification } from '../types';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface CompactErrorBannerProps {
  error: ErrorClassification | null;
}

export const CompactErrorBanner: React.FC<CompactErrorBannerProps> = ({ error }) => {
  const [showFix, setShowFix] = useState(false);

  if (!error) return null;

  const isSuccess = error.type === 'none';
  const isLogical = error.type === 'logical';
  const isSemantic = error.type === 'semantic';

  return (
    <div
      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
        isSuccess
          ? 'bg-[#2cbb5d]/10 border-[#2cbb5d]/40 text-[#eff1f6]'
          : 'bg-[#ef4743]/10 border-[#ef4743]/40 text-[#eff1f6]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {isSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2cbb5d] shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-[#ef4743] shrink-0" />
          )}

          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide ${
              isSuccess
                ? 'bg-[#2cbb5d]/20 text-[#2cbb5d]'
                : isLogical
                ? 'bg-[#ffa116]/20 text-[#ffa116]'
                : 'bg-[#ef4743]/20 text-[#ef4743]'
            }`}
          >
            {isSuccess
              ? 'Accepted'
              : isLogical
              ? 'Logical Error'
              : isSemantic
              ? 'Runtime Error'
              : 'Syntax Error'}
          </span>

          <span className="font-semibold text-[#eff1f6]">{error.title}</span>

          {error.line && (
            <span className="font-mono text-[10px] text-[#8c8c8c] bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333333]">
              Line {error.line}
            </span>
          )}

          {isLogical && (error.expectedOutput || error.actualOutput) && (
            <span className="font-mono text-[11px] text-[#8c8c8c]">
              Expected <span className="text-[#2cbb5d] font-bold">{error.expectedOutput}</span> • Got{' '}
              <span className="text-[#ef4743] font-bold">{error.actualOutput || 'wrong'}</span>
            </span>
          )}
        </div>

        {error.fixRecommendation && (
          <button
            onClick={() => setShowFix(!showFix)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#ffa116] hover:underline"
          >
            <span>{showFix ? 'Hide Fix' : 'Show Fix'}</span>
            {showFix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Fix Drawer */}
      {showFix && (
        <div className="mt-2 pt-2 border-t border-[#333333] text-[#d4d4d4] text-xs leading-relaxed space-y-1">
          <div>
            <span className="text-[#ffa116] font-bold">Why? </span>
            <span>{error.description}</span>
          </div>
          {error.fixRecommendation && (
            <div className="text-[#eff1f6]">
              <span className="text-[#2cbb5d] font-bold">Insight: </span>
              {error.fixRecommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
