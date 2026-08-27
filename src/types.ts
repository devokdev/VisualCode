export type Language = 'python' | 'java' | 'cpp';

export type ErrorType = 'syntax' | 'semantic' | 'logical' | 'none';

export interface ErrorClassification {
  type: ErrorType;
  title: string;
  description: string;
  line?: number;
  fixRecommendation?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

export interface ProblemContext {
  title: string;
  slug?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    python: string;
    java: string;
    cpp: string;
  };
  dataStructureType: 'tree' | 'bst' | 'graph' | 'linked_list' | 'array' | 'matrix' | 'recursion';
}

export interface TreeNodeData {
  id: string;
  val: string | number;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
  pointers?: string[]; // e.g. ["root", "curr", "p", "q"]
  status?: 'default' | 'active' | 'visited' | 'modified' | 'inserted' | 'deleted' | 'target';
  highlightMsg?: string;
}

export interface GraphNodeData {
  id: string;
  label: string;
  status?: 'default' | 'active' | 'visited' | 'queued' | 'target';
  pointers?: string[];
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number | string;
  isDirected?: boolean;
  status?: 'default' | 'active' | 'visited' | 'traversed';
}

export interface GraphState {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface LinkedListNodeData {
  id: string;
  val: string | number;
  nextId?: string | null;
  prevId?: string | null;
  pointers?: string[];
  status?: 'default' | 'active' | 'visited' | 'modified' | 'inserted' | 'deleted';
}

export interface ArrayElementData {
  index: number;
  val: string | number;
  pointers?: string[]; // e.g. ["left", "right", "mid", "i", "j"]
  status?: 'default' | 'active' | 'compared' | 'swapped' | 'sorted';
}

export interface MatrixState {
  rows: number;
  cols: number;
  grid: {
    r: number;
    c: number;
    val: string | number;
    pointers?: string[];
    status?: 'default' | 'active' | 'visited' | 'path';
  }[][];
}

export interface CallStackFrame {
  functionName: string;
  args: Record<string, any>;
  returnValue?: any;
  depth: number;
  status?: 'running' | 'returning' | 'paused';
}

export interface TraceStep {
  step: number;
  line: number;
  explanation: string;
  stdout?: string;
  returnValue?: any;
  variables: Record<string, any>;
  callStack: CallStackFrame[];
  treeState?: TreeNodeData | null;
  graphState?: GraphState | null;
  linkedListState?: LinkedListNodeData[] | null;
  arrayState?: ArrayElementData[] | null;
  matrixState?: MatrixState | null;
  highlightedLines?: number[];
}

export interface ExecutionAnalysisResult {
  errorClassification: ErrorClassification;
  isExecutable: boolean;
  steps: TraceStep[];
  totalSteps: number;
  summary: string;
}
