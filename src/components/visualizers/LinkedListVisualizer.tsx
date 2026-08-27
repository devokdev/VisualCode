import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { LinkedListNodeData } from '../../types';

interface LinkedListVisualizerProps {
  linkedListState?: LinkedListNodeData[] | null;
  stepExplanation?: string;
  variables?: Record<string, any>;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  linkedListState,
  stepExplanation,
  variables = {},
}) => {
  const { nodes, edges } = useMemo(() => {
    if (!linkedListState || linkedListState.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nList: Node[] = [];
    const eList: Edge[] = [];

    // Collect all pointer names from variables pointing to node values/indices
    linkedListState.forEach((node, idx) => {
      const isActive = node.status === 'active';
      const pointers = [...(node.pointers || [])];

      // Also map scalar pointer variables (e.g. curr, prev, fast, slow)
      Object.entries(variables).forEach(([vName, vVal]) => {
        if (
          (vVal === node.val || (typeof vVal === 'object' && vVal?.val === node.val)) &&
          !pointers.includes(vName)
        ) {
          pointers.push(vName);
        }
      });

      const hasPointers = pointers.length > 0;

      nList.push({
        id: node.id || `node-${idx}`,
        position: { x: idx * 170 + 60, y: 130 },
        data: {
          label: (
            <div className="flex flex-col items-center">
              {/* Pointer Badges */}
              {hasPointers && (
                <div className="flex gap-1 mb-2 -mt-7">
                  {pointers.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#ffa116] text-[#0d0d10] shadow-md animate-bounce"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Node Value Box */}
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-lg ${
                  isActive || hasPointers
                    ? 'border-[#ffa116] bg-[#2e2b24] text-[#ffa116] font-bold shadow-[0_0_16px_rgba(255,161,22,0.35)] scale-105'
                    : 'border-white/[0.12] bg-[#1a1a20] text-[#f4f4f5]'
                }`}
              >
                <span className="text-base font-mono font-bold">{node.val}</span>
                <span className="text-[9px] text-[#71717a] font-mono">val</span>
              </div>
            </div>
          ),
        },
        style: {
          background: 'transparent',
          border: 'none',
          padding: 0,
        },
      });

      // Edge link to next node
      if (idx < linkedListState.length - 1) {
        const nextId = linkedListState[idx + 1].id || `node-${idx + 1}`;
        eList.push({
          id: `edge-${idx}`,
          source: node.id || `node-${idx}`,
          target: nextId,
          animated: isActive || hasPointers,
          style: {
            stroke: isActive || hasPointers ? '#ffa116' : '#52525b',
            strokeWidth: 2.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isActive || hasPointers ? '#ffa116' : '#52525b',
          },
        });
      }
    });

    return { nodes: nList, edges: eList };
  }, [linkedListState, variables]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111114] overflow-hidden select-none">
      <div className="flex-1 w-full h-full">
        {nodes.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#71717a]">
            Linked List / Object graph is uninitialized
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#27272a" gap={20} size={1} />
            <Controls className="!bg-[#1a1a20] !border-white/[0.08] !text-white" />
          </ReactFlow>
        )}
      </div>

      {stepExplanation && (
        <div className="px-6 py-2.5 bg-[#14141a] border-t border-white/[0.06] text-xs text-[#d4d4d8] flex items-center gap-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ffa116] animate-ping shrink-0" />
          <span className="font-bold text-[#ffa116] uppercase text-[10px] tracking-wider shrink-0">Action</span>
          <span className="truncate text-xs text-[#f4f4f5]">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
