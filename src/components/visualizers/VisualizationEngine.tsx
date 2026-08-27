import React from 'react';
import type { TraceStep, ProblemContext, TreeNodeData } from '../../types';
import { TreeVisualizer } from './TreeVisualizer';
import { ArrayVisualizer } from './ArrayVisualizer';
import { LinkedListVisualizer } from './LinkedListVisualizer';
import { GraphVisualizer } from './GraphVisualizer';
import { Sparkles } from 'lucide-react';

interface VisualizationEngineProps {
  problem: ProblemContext | null;
  activeStep?: TraceStep;
  onSelectTreeNode?: (node: TreeNodeData) => void;
}

export const VisualizationEngine: React.FC<VisualizationEngineProps> = ({
  problem,
  activeStep,
  onSelectTreeNode,
}) => {
  if (!problem) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#71717a]">
        <Sparkles className="w-6 h-6 text-[#ffa116] mb-2" />
        <h4 className="text-sm font-semibold text-[#f4f4f5] mb-1">Visualizer Ready</h4>
        <p className="text-xs max-w-xs text-[#71717a]">
          Click <strong className="text-[#ffa116]">Run</strong> to visualize your code execution.
        </p>
      </div>
    );
  }

  // 1. Binary Tree / BST (D3 Hierarchy)
  if (
    problem.dataStructureType === 'tree' ||
    problem.dataStructureType === 'bst' ||
    Boolean(activeStep?.treeState)
  ) {
    return (
      <TreeVisualizer
        data={activeStep?.treeState}
        stepExplanation={activeStep?.explanation}
        onSelectNode={onSelectTreeNode}
      />
    );
  }

  // 2. Linked List (React Flow)
  if (
    problem.dataStructureType === 'linked_list' ||
    Boolean(activeStep?.linkedListState && activeStep.linkedListState.length > 0)
  ) {
    return (
      <LinkedListVisualizer
        linkedListState={activeStep?.linkedListState}
        stepExplanation={activeStep?.explanation}
      />
    );
  }

  // 3. Graph (Cytoscape.js)
  if (
    problem.dataStructureType === 'graph' ||
    Boolean(activeStep?.graphState && activeStep.graphState.nodes && activeStep.graphState.nodes.length > 0)
  ) {
    return (
      <GraphVisualizer
        data={activeStep?.graphState}
        stepExplanation={activeStep?.explanation}
      />
    );
  }

  // 4. Default: Arrays / Matrices / DP / Two-Pointers (Framer Motion)
  return (
    <ArrayVisualizer
      arrayState={activeStep?.arrayState}
      matrixState={activeStep?.matrixState}
      variables={activeStep?.variables}
      stepExplanation={activeStep?.explanation}
    />
  );
};
