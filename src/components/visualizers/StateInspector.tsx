import React from 'react';
import type { CallStackFrame } from '../../types';

interface StateInspectorProps {
  variables?: Record<string, any>;
  callStack?: CallStackFrame[];
  stdout?: string;
  returnValue?: any;
}

export const StateInspector: React.FC<StateInspectorProps> = ({
  variables,
  callStack,
  stdout,
  returnValue,
}) => {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Variables View */}
      <div className="bg-[#0e0f15] rounded-2xl border border-[#d4af37]/20 p-4 shadow-xl">
        <h4 className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
          <span>📦</span> Variables
        </h4>
        {!variables || Object.keys(variables).length === 0 ? (
          <p className="text-xs text-[#737080] italic">No active variables</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(variables).map(([name, val]) => (
              <div
                key={name}
                className="flex items-center justify-between bg-[#08090d] px-2.5 py-1.5 rounded-lg border border-[#d4af37]/15 text-xs"
              >
                <span className="font-mono text-[#e6c97a] font-medium">{name}</span>
                <span className="font-mono text-[#00b8a3] font-semibold truncate max-w-[120px]">
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Stack */}
      <div className="bg-[#0e0f15] rounded-2xl border border-[#d4af37]/20 p-4 shadow-xl">
        <h4 className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
          <span>🥞</span> Call Stack / Recursion Depth
        </h4>
        {!callStack || callStack.length === 0 ? (
          <p className="text-xs text-[#737080] italic">Main Frame</p>
        ) : (
          <div className="flex flex-col-reverse gap-1.5">
            {callStack.map((frame, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  idx === callStack.length - 1
                    ? 'border-[#d4af37] bg-[#1a1b28] text-[#f3f0e6] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                    : 'border-[#d4af37]/15 bg-[#090a0f] text-[#8e8a9c]'
                }`}
              >
                <div>
                  <div className="font-mono font-semibold text-[#f1ede2] flex items-center gap-1.5">
                    <span>{frame.functionName}</span>
                    <span className="text-[10px] text-[#8e897a]">depth {frame.depth}</span>
                  </div>
                  {frame.args && Object.keys(frame.args).length > 0 && (
                    <div className="text-[10px] font-mono text-[#a39e90] mt-0.5">
                      args: {JSON.stringify(frame.args)}
                    </div>
                  )}
                </div>
                {frame.returnValue !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-[#00b8a3] font-mono font-bold">
                      ret: {String(frame.returnValue)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Value / Output if present */}
      {(returnValue !== undefined || stdout) && (
        <div className="bg-[#0e0f15] rounded-2xl border border-[#d4af37]/20 p-4 shadow-xl">
          <h4 className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <span>📤</span> Execution Output / Return
          </h4>
          {returnValue !== undefined && (
            <div className="text-xs bg-[#08090d] p-2.5 rounded-xl border border-[#d4af37]/20 font-mono text-[#00b8a3]">
              <span className="text-[#8e8a9c]">Result: </span>
              {typeof returnValue === 'object' ? JSON.stringify(returnValue) : String(returnValue)}
            </div>
          )}
          {stdout && (
            <div className="text-xs bg-[#08090d] p-2.5 rounded-xl border border-[#d4af37]/20 font-mono text-[#e2e8f0] whitespace-pre-wrap mt-1.5">
              {stdout}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
