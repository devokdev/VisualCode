import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TreeNodeData } from '../../types';

interface TreeVisualizerProps {
  data: TreeNodeData | null | undefined;
  stepExplanation?: string;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ data, stepExplanation }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = Math.max(380, containerRef.current.clientHeight || 380);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '14px')
        .text('Tree is empty or null (root is null)');
      return;
    }

    // Set up zoom & pan
    const g = svg.append('g').attr('class', 'tree-viewport');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Convert custom TreeNodeData to d3 hierarchy
    const hierarchyData = d3.hierarchy<TreeNodeData>(data, (d) => {
      const children: TreeNodeData[] = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : undefined;
    });

    const nodeRadius = 24;
    const treeLayout = d3
      .tree<TreeNodeData>()
      .nodeSize([70, 75])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

    const root = treeLayout(hierarchyData);

    // Center root at top
    const initialTransform = d3.zoomIdentity.translate(width / 2, 60).scale(0.95);
    svg.call(zoom.transform as any, initialTransform);

    // Draw links
    const links = root.links();
    g.selectAll('.tree-link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('d', (d: any) => {
        return `M ${d.source.x} ${d.source.y}
                C ${d.source.x} ${(d.source.y + d.target.y) / 2},
                  ${d.target.x} ${(d.source.y + d.target.y) / 2},
                  ${d.target.x} ${d.target.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2')
      .transition()
      .duration(300)
      .attr('stroke-dasharray', 'none')
      .attr('stroke', '#64748b');

    // Draw nodes
    const nodeGroups = g
      .selectAll('.tree-node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Outer glow for active nodes
    nodeGroups
      .filter((d) => Boolean(d.data.status === 'active' || (d.data.pointers && d.data.pointers.length > 0)))
      .append('circle')
      .attr('r', nodeRadius + 6)
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.data.status === 'active' ? '#38bdf8' : '#a855f7'))
      .attr('stroke-width', 2.5)
      .attr('opacity', 0.8)
      .attr('class', 'animate-pulse');

    // Main node circle
    nodeGroups
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', (d) => {
        switch (d.data.status) {
          case 'active':
            return '#0284c7'; // sky blue
          case 'visited':
            return '#334155'; // muted slate
          case 'modified':
          case 'inserted':
            return '#059669'; // emerald
          case 'deleted':
            return '#dc2626'; // red
          case 'target':
            return '#d97706'; // amber
          default:
            return '#1e293b'; // slate-800
        }
      })
      .attr('stroke', (d) => {
        switch (d.data.status) {
          case 'active':
            return '#38bdf8';
          case 'modified':
          case 'inserted':
            return '#34d399';
          case 'deleted':
            return '#f87171';
          case 'target':
            return '#fbbf24';
          default:
            return '#475569';
        }
      })
      .attr('stroke-width', 2.5)
      .style('cursor', 'pointer');

    // Node Value Text
    nodeGroups
      .append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#f8fafc')
      .attr('font-size', '13px')
      .attr('font-weight', '700')
      .text((d) => String(d.data.val));

    // Pointer Badges (e.g. root, curr, p, q)
    nodeGroups
      .filter((d) => !!d.data.pointers && d.data.pointers.length > 0)
      .each(function (d) {
        const pointers = d.data.pointers || [];
        const group = d3.select(this);

        pointers.forEach((ptr, idx) => {
          const badgeY = -nodeRadius - 14 - idx * 18;

          const badgeGroup = group.append('g').attr('transform', `translate(0, ${badgeY})`);

          const textEl = badgeGroup
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '10px')
            .attr('font-weight', '800')
            .text(ptr);

          const bbox = (textEl.node() as any)?.getBBox?.() || { width: 28, height: 12 };
          const padding = 5;

          badgeGroup
            .insert('rect', 'text')
            .attr('x', -(bbox.width + padding * 2) / 2)
            .attr('y', -10)
            .attr('width', bbox.width + padding * 2)
            .attr('height', 14)
            .attr('rx', 4)
            .attr('fill', ptr === 'root' ? '#6366f1' : ptr === 'curr' ? '#0ea5e9' : '#ec4899')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1);
        });
      });
  }, [data]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Header controls overlay */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm backdrop-blur">
          🌳 Tree Structure
        </span>
        {data && (
          <span className="text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/60">
            Scroll to zoom • Drag to pan
          </span>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full flex-1 min-h-[360px] relative">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Step context explanation bottom bar */}
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
