import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import type { GraphState } from '../../types';

try {
  cytoscape.use(dagre);
} catch {}

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
            'background-color': '#1a1a20',
            'border-color': '#52525b',
            'border-width': 2,
            'label': 'data(label)',
            'color': '#f4f4f5',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'width': '48px',
            'height': '48px',
          },
        },
        {
          selector: 'node[status = "active"]',
          style: {
            'background-color': '#2e2b24',
            'border-color': '#ffa116',
            'border-width': 3,
            'color': '#ffa116',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node[status = "visited"]',
          style: {
            'background-color': '#0d261e',
            'border-color': '#10b981',
            'color': '#10b981',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#52525b',
            'target-arrow-color': '#52525b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#71717a',
            'font-size': '10px',
          },
        },
        {
          selector: 'edge[status = "active"]',
          style: {
            'width': 3,
            'line-color': '#ffa116',
            'target-arrow-color': '#ffa116',
          },
        },
        {
          selector: 'edge[status = "visited"]',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        padding: 50,
      } as any,
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111114] overflow-hidden select-none">
      <div className="w-full flex-1 min-h-[300px] relative">
        <div ref={containerRef} className="w-full h-full" />
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
