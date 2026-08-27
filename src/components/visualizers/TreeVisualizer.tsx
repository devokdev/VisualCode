import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TreeNodeData } from '../../types';

interface TreeVisualizerProps {
  data: TreeNodeData | null | undefined;
  prevData?: TreeNodeData | null | undefined;
  stepExplanation?: string;
  onSelectNode?: (node: TreeNodeData) => void;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  data,
  stepExplanation,
  onSelectNode,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = Math.max(340, containerRef.current.clientHeight || 340);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!data) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#71717a')
        .attr('font-size', '13px')
        .text('Tree is empty or null (root is null)');
      return;
    }

    const g = svg.append('g').attr('class', 'tree-viewport');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const hierarchyData = d3.hierarchy<TreeNodeData>(data, (d) => {
      const children: TreeNodeData[] = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : undefined;
    });

    const nodeRadius = 22;
    const treeLayout = d3
      .tree<TreeNodeData>()
      .nodeSize([70, 75])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5));

    const root = treeLayout(hierarchyData);

    // Initial position
    const initialTransform = d3.zoomIdentity.translate(width / 2, 50).scale(0.95);
    svg.call(zoom.transform as any, initialTransform);

    // Links with animated gradient transitions
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
      .attr('stroke', (d: any) => {
        const isTargetActive = d.target.data.status === 'active' || (d.target.data.pointers && d.target.data.pointers.length > 0);
        return isTargetActive ? '#ffa116' : '#3f3f46';
      })
      .attr('stroke-width', (d: any) => {
        const isTargetActive = d.target.data.status === 'active' || (d.target.data.pointers && d.target.data.pointers.length > 0);
        return isTargetActive ? 2.5 : 1.5;
      })
      .attr('opacity', (d: any) => {
        const isTargetActive = d.target.data.status === 'active' || (d.target.data.pointers && d.target.data.pointers.length > 0);
        return isTargetActive ? 1.0 : 0.45;
      });

    // Node Groups with enter/update animations
    const nodeGroups = g
      .selectAll('.tree-node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        if (onSelectNode) onSelectNode(d.data);
      });

    // 40% noise dimming on inactive nodes
    nodeGroups.attr('opacity', (d) => {
      const isActive = d.data.status === 'active' || (d.data.pointers && d.data.pointers.length > 0);
      return isActive ? 1.0 : 0.4;
    });

    // Highlight only active current node with glowing pulse
    nodeGroups
      .filter((d) => Boolean(d.data.status === 'active' || (d.data.pointers && d.data.pointers.length > 0)))
      .append('circle')
      .attr('r', nodeRadius + 6)
      .attr('fill', 'none')
      .attr('stroke', '#ffa116')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2');

    // Main Node Circle
    nodeGroups
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', (d) => {
        const isActive = d.data.status === 'active' || (d.data.pointers && d.data.pointers.length > 0);
        return isActive ? '#2e2b24' : '#1a1a20';
      })
      .attr('stroke', (d) => {
        const isActive = d.data.status === 'active' || (d.data.pointers && d.data.pointers.length > 0);
        return isActive ? '#ffa116' : '#52525b';
      })
      .attr('stroke-width', 2);

    // Node Value Text
    nodeGroups
      .append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => {
        const isActive = d.data.status === 'active' || (d.data.pointers && d.data.pointers.length > 0);
        return isActive ? '#ffa116' : '#f4f4f5';
      })
      .attr('font-size', '12px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '700')
      .text((d) => String(d.data.val));

    // Pointer Badges above active nodes
    nodeGroups
      .filter((d) => Boolean(d.data.pointers && d.data.pointers.length > 0))
      .each(function (d) {
        const pointers = d.data.pointers || [];
        const group = d3.select(this);

        pointers.forEach((ptr, idx) => {
          const badgeY = -nodeRadius - 12 - idx * 18;
          const badgeGroup = group.append('g').attr('transform', `translate(0, ${badgeY})`);

          const textEl = badgeGroup
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', '#0d0d10')
            .attr('font-size', '10px')
            .attr('font-weight', '700')
            .attr('font-family', 'JetBrains Mono, monospace')
            .text(ptr);

          const bbox = (textEl.node() as any)?.getBBox?.() || { width: 24, height: 12 };
          const padding = 4;

          badgeGroup
            .insert('rect', 'text')
            .attr('x', -(bbox.width + padding * 2) / 2)
            .attr('y', -9)
            .attr('width', bbox.width + padding * 2)
            .attr('height', 13)
            .attr('rx', 3)
            .attr('fill', '#ffa116');
        });
      });
  }, [data, onSelectNode]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#111114] overflow-hidden select-none">
      <div className="w-full flex-1 min-h-[300px] relative">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
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
