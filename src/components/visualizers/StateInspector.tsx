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
      <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="text-sky-400 font-mono">📦</span> Variables
        </h4>
        {!variables || Object.keys(variables).length === 0 ? (
          <p className="text-xs text-slate-500 italic">No active variables</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(variables).map(([name, val]) => (
              <div
                key={name}
                className="flex items-center justify-between bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800/80 text-xs"
              >
                <span className="font-mono text-sky-300 font-medium">{name}</span>
                <span className="font-mono text-amber-200 font-semibold truncate max-w-[120px]">
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Stack */}
      <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="text-indigo-400 font-mono">🥞</span> Call Stack / Recursion Depth
        </h4>
        {!callStack || callStack.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Main Frame</p>
        ) : (
          <div className="flex flex-col-reverse gap-1.5">
            {callStack.map((frame, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border text-xs flex items-center justify-between transition-all ${
                  idx === callStack.length - 1
                    ? 'border-sky-500 bg-sky-950/40 text-sky-100 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>{frame.functionName}</span>
                    <span className="text-[10px] text-slate-500">depth {frame.depth}</span>
                  </div>
                  {frame.args && Object.keys(frame.args).length > 0 && (
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      args: {JSON.stringify(frame.args)}
                    </div>
                  )}
                </div>
                {frame.returnValue !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
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
        <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono">📤</span> Execution Output / Return
          </h4>
          {returnValue !== undefined && (
            <div className="text-xs bg-slate-950/80 p-2 rounded border border-slate-800 font-mono text-emerald-300">
              <span className="text-slate-500">Result: </span>
              {typeof returnValue === 'object' ? JSON.stringify(returnValue) : String(returnValue)}
            </div>
          )}
          {stdout && (
            <div className="text-xs bg-slate-950/80 p-2 rounded border border-slate-800 font-mono text-slate-300 whitespace-pre-wrap mt-1.5">
              {stdout}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
