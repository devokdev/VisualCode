import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { GraphState } from '../../types';

interface GraphVisualizerProps {
  data: GraphState | null | undefined;
  stepExplanation?: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ data, stepExplanation }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    if (!data || !data.nodes || data.nodes.length === 0) {
      return;
    }

    const elements: cytoscape.ElementDefinition[] = [];

    // Nodes
    data.nodes.forEach((n) => {
      elements.push({
        group: 'nodes',
        data: {
          id: n.id,
          label: n.pointers && n.pointers.length > 0 ? `${n.label}\n[${n.pointers.join(',')}]` : n.label,
          status: n.status || 'default',
        },
      });
    });

    // Edges
    data.edges?.forEach((e) => {
      elements.push({
        group: 'edges',
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.weight !== undefined ? String(e.weight) : '',
          status: e.status || 'default',
        },
      });
    });

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1e293b',
            'border-color': '#64748b',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#f8fafc',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': 'bold',
            'width': 44,
            'height': 44,
            'text-wrap': 'wrap',
          },
        },
        {
          selector: 'node[status = "active"]',
          style: {
            'background-color': '#0284c7',
            'border-color': '#38bdf8',
            'border-width': 3,
            'color': '#ffffff',
          },
        },
        {
          selector: 'node[status = "visited"]',
          style: {
            'background-color': '#334155',
            'border-color': '#475569',
          },
        },
        {
          selector: 'node[status = "target"]',
          style: {
            'background-color': '#d97706',
            'border-color': '#fbbf24',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#94a3b8',
            'font-size': '10px',
            'text-background-color': '#0f172a',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge[status = "active"]',
          style: {
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'width': 3,
          },
        },
        {
          selector: 'edge[status = "traversed"]',
          style: {
            'line-color': '#34d399',
            'target-arrow-color': '#34d399',
            'width': 2.5,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 40,
      } as any,
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden select-none">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm backdrop-blur">
          🕸️ Graph Structure
        </span>
        {data && data.nodes?.length > 0 && (
          <span className="text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/60">
            Drag nodes • Zoom/Pan
          </span>
        )}
      </div>

      <div className="w-full flex-1 min-h-[360px] relative">
        {(!data || !data.nodes || data.nodes.length === 0) ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            Graph is empty or not initialized
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>

      {stepExplanation && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-medium text-sky-300">Action:</span>
          <span className="truncate">{stepExplanation}</span>
        </div>
      )}
    </div>
  );
};
