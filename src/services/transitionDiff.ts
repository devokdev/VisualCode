import type { TraceStep } from '../types';

export interface ArrayDiffItem {
  index: number;
  val: string | number;
  prevVal?: string | number;
  isChanged: boolean;
  isNew: boolean;
  pointers: string[];
  prevPointers: string[];
  status: 'active' | 'changed' | 'default';
}

export interface NamedArrayDiff {
  name: string;
  items: ArrayDiffItem[];
  hasChanges: boolean;
}

export interface VariableDiff {
  name: string;
  currentVal: any;
  prevVal: any;
  hasChanged: boolean;
  isNew: boolean;
}

export interface StateTransitionDiff {
  changedVariableKeys: Set<string>;
  variableDiffs: VariableDiff[];
  namedArrays: NamedArrayDiff[];
  activePointers: Record<string, { current: number; prev?: number }>;
  activeNodeId?: string | number;
  prevNodeId?: string | number;
}

/**
 * Computes deep differences between the previous execution step and the current step.
 * Allows visualizers to animate transitions (swaps, updates, pointer moves, new allocations)
 * instead of replacing static snapshots.
 */
export function computeStateTransitionDiff(
  currentStep?: TraceStep | null,
  prevStep?: TraceStep | null
): StateTransitionDiff {
  const currentVars = currentStep?.variables || {};
  const prevVars = prevStep?.variables || {};

  const changedVariableKeys = new Set<string>();
  const variableDiffs: VariableDiff[] = [];
  const allVarKeys = Array.from(new Set([...Object.keys(currentVars), ...Object.keys(prevVars)]));

  allVarKeys.forEach((key) => {
    const cur = currentVars[key];
    const prev = prevVars[key];
    const isNew = !(key in prevVars) && (key in currentVars);
    const hasChanged = JSON.stringify(cur) !== JSON.stringify(prev);

    if (hasChanged) {
      changedVariableKeys.add(key);
    }

    if (key in currentVars || key in prevVars) {
      variableDiffs.push({
        name: key,
        currentVal: cur,
        prevVal: prev,
        hasChanged,
        isNew,
      });
    }
  });

  // Track pointers (i, j, k, left, right, mid, ptr, p, q)
  const activePointers: Record<string, { current: number; prev?: number }> = {};
  Object.entries(currentVars).forEach(([k, v]) => {
    if (typeof v === 'number' && !Array.isArray(v) && v >= 0) {
      const prevV = typeof prevVars[k] === 'number' ? prevVars[k] : undefined;
      activePointers[k] = { current: v, prev: prevV };
    }
  });

  // Track all named array variables
  const namedArrays: NamedArrayDiff[] = [];

  allVarKeys.forEach((key) => {
    const curArr = currentVars[key];
    const prevArr = prevVars[key];

    if (Array.isArray(curArr)) {
      const prevList = Array.isArray(prevArr) ? prevArr : [];
      let hasArrChanges = false;

      const items: ArrayDiffItem[] = curArr.map((val, idx) => {
        const prevVal = prevList[idx];
        const isChanged = prevVal !== undefined && JSON.stringify(val) !== JSON.stringify(prevVal);
        const isNew = prevVal === undefined;
        if (isChanged || isNew) hasArrChanges = true;

        // Collect pointers pointing to this index
        const currentPointersForIdx: string[] = [];
        const prevPointersForIdx: string[] = [];

        Object.entries(activePointers).forEach(([ptrName, pos]) => {
          if (pos.current === idx) currentPointersForIdx.push(ptrName);
          if (pos.prev === idx) prevPointersForIdx.push(ptrName);
        });

        return {
          index: idx,
          val: typeof val === 'object' ? JSON.stringify(val) : val,
          prevVal: typeof prevVal === 'object' ? JSON.stringify(prevVal) : prevVal,
          isChanged,
          isNew,
          pointers: currentPointersForIdx,
          prevPointers: prevPointersForIdx,
          status: isChanged ? 'changed' : currentPointersForIdx.length > 0 ? 'active' : 'default',
        };
      });

      namedArrays.push({
        name: key,
        items,
        hasChanges: hasArrChanges,
      });
    }
  });

  return {
    changedVariableKeys,
    variableDiffs,
    namedArrays,
    activePointers,
  };
}
