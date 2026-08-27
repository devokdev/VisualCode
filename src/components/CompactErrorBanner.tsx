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
      className={`px-4 py-2.5 rounded-xl border text-xs transition-all ${
        isSuccess
          ? 'bg-[#66734F]/15 border-[#66734F]/40 text-[#EAE5DF]'
          : 'bg-[#A3543A]/15 border-[#A3543A]/40 text-[#EAE5DF]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-[#66734F] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#A3543A] shrink-0" />
          )}

          <span
            className={`font-semibold px-2 py-0.5 rounded text-[11px] uppercase tracking-wide ${
              isSuccess
                ? 'bg-[#66734F]/30 text-[#B8C99E]'
                : isLogical
                ? 'bg-[#A3543A]/30 text-[#F0A994]'
                : isSemantic
                ? 'bg-[#A3543A]/40 text-[#F0A994]'
                : 'bg-[#A3543A]/50 text-[#F0A994]'
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

          <span className="font-medium text-[#EAE5DF]">{error.title}</span>

          {error.line && (
            <span className="font-mono text-[10px] text-[#9E948C] bg-[#171412] px-1.5 py-0.5 rounded border border-[#3D322A]">
              Line {error.line}
            </span>
          )}

          {isLogical && (error.expectedOutput || error.actualOutput) && (
            <span className="font-mono text-[11px] text-[#9E948C]">
              Expected <span className="text-[#66734F] font-bold">{error.expectedOutput}</span> • Got{' '}
              <span className="text-[#A3543A] font-bold">{error.actualOutput || 'wrong'}</span>
            </span>
          )}
        </div>

        {error.fixRecommendation && (
          <button
            onClick={() => setShowFix(!showFix)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#B38A4A] hover:underline"
          >
            <span>{showFix ? 'Hide Fix' : 'Show Fix'}</span>
            {showFix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Fix Drawer */}
      {showFix && error.fixRecommendation && (
        <div className="mt-2 pt-2 border-t border-[#3D322A]/60 text-[#D8D2CA] text-xs leading-relaxed flex items-start gap-2">
          <span className="text-[#B38A4A] font-bold">Why?</span>
          <span>{error.description}</span>
          <div className="mt-1 text-[#B38A4A]">
            <span className="font-semibold">Insight: </span>
            {error.fixRecommendation}
          </div>
        </div>
      )}
    </div>
  );
};
