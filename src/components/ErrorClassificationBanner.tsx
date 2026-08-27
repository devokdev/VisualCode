import React from 'react';
import type { ErrorClassification } from '../types';
import { AlertCircle, AlertTriangle, Bug, CheckCircle2, Lightbulb } from 'lucide-react';

interface ErrorClassificationBannerProps {
  error: ErrorClassification | null;
}

export const ErrorClassificationBanner: React.FC<ErrorClassificationBannerProps> = ({ error }) => {
  if (!error) return null;

  const isSyntax = error.type === 'syntax';
  const isSemantic = error.type === 'semantic';
  const isLogical = error.type === 'logical';
  const isNone = error.type === 'none';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isSyntax
          ? 'bg-rose-950/40 border-rose-600/50 text-rose-200'
          : isSemantic
          ? 'bg-orange-950/40 border-orange-500/50 text-orange-200'
          : isLogical
          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isSyntax && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {isSemantic && <AlertTriangle className="w-5 h-5 text-orange-400" />}
          {isLogical && <Bug className="w-5 h-5 text-amber-400" />}
          {isNone && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                  isSyntax
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : isSemantic
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : isLogical
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isSyntax
                  ? '🔴 Syntax Error'
                  : isSemantic
                  ? '🟠 Semantic / Runtime Error'
                  : isLogical
                  ? '🟡 Logical Error'
                  : '🟢 Accepted / Correct'}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{error.title}</h3>
            </div>

            {error.line && (
              <span className="text-xs font-mono bg-slate-900/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                Line {error.line}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{error.description}</p>

          {/* Actual vs Expected output for Logical Errors */}
          {isLogical && (error.expectedOutput || error.actualOutput) && (
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
              {error.expectedOutput && (
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-emerald-300">
                  <span className="text-slate-500 block text-[10px]">Expected:</span>
                  {error.expectedOutput}
                </div>
              )}
              {error.actualOutput && (
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-rose-300">
                  <span className="text-slate-500 block text-[10px]">Your Code Output:</span>
                  {error.actualOutput}
                </div>
              )}
            </div>
          )}

          {/* Fix recommendation */}
          {error.fixRecommendation && (
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs text-sky-200">
              <Lightbulb className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-sky-300">Insight: </span>
                {error.fixRecommendation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
