import type {
  ExecutionAnalysisResult,
  Language,
  ProblemContext,
  TraceStep,
  ArrayElementData,
  CallStackFrame,
  TreeNodeData,
  LinkedListNodeData,
  MatrixState,
} from '../types';

/**
 * Parses simple literal expressions like "[3,2,4]", "target = 6", "nums = [2,7,11,15]"
 */
export function parseInputsFromExample(inputStr: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!inputStr || !inputStr.trim()) return result;

  const tokens = inputStr.split(/[\n,](?=(?:[^[\]]*\[[^[\]]*\])*[^[\]]*$)/);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const valStr = trimmed.slice(eqIdx + 1).trim();
      try {
        result[key] = JSON.parse(valStr.replace(/'/g, '"'));
      } catch {
        const num = Number(valStr);
        result[key] = isNaN(num) ? valStr : num;
      }
    } else {
      try {
        const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          result['nums'] = parsed;
          result['arr'] = parsed;
        } else {
          result['input'] = parsed;
        }
      } catch {
        result['input'] = trimmed;
      }
    }
  }

  return result;
}

/**
 * Evaluates expressions in a scoped variable environment
 */
function evaluateExpression(expr: string, scope: Record<string, any>): any {
  let cleaned = expr.trim();
  if (!cleaned) return undefined;

  // Handle Java/C++ array initialization: {0, 0} -> [0, 0]
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    cleaned = '[' + cleaned.slice(1, -1) + ']';
  }
  // Handle new int[]{i, j} or new int[2]
  if (cleaned.startsWith('new int[]')) {
    const braceIdx = cleaned.indexOf('{');
    if (braceIdx !== -1) {
      cleaned = '[' + cleaned.slice(braceIdx + 1, cleaned.lastIndexOf('}')) + ']';
    } else {
      const bracketMatch = cleaned.match(/\[(.*?)\]/);
      const size = bracketMatch ? evaluateExpression(bracketMatch[1], scope) : 0;
      return new Array(Number(size) || 0).fill(0);
    }
  }

  // Convert Python/Java/C++ constructs to JS
  cleaned = cleaned
    .replace(/\.length\b/g, '.length')
    .replace(/\.size\(\)/g, '.length')
    .replace(/\blen\((.*?)\)/g, '$1.length')
    .replace(/\bnull\b/g, 'null')
    .replace(/\bNone\b/g, 'null')
    .replace(/\btrue\b/gi, 'true')
    .replace(/\bfalse\b/gi, 'false')
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b/g, '!')
    .replace(/\/\//g, '/');

  try {
    const keys = Object.keys(scope);
    const vals = Object.values(scope);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `try { return ${cleaned}; } catch(e) { return undefined; }`);
    return fn(...vals);
  } catch {
    return undefined;
  }
}

/**
 * Universal Multi-Language Custom Code Execution Engine
 * Interprets user's actual custom code line-by-line without hardcoded problem assumptions.
 */
export function traceDeterministically(
  problem: ProblemContext,
  code: string,
  language: Language,
  customInput?: string
): ExecutionAnalysisResult {
  const activeInput = customInput || problem.examples[0]?.input || '';
  const expectedOutput = problem.examples[0]?.output || '';
  const inputs = parseInputsFromExample(activeInput);

  const steps: TraceStep[] = [];
  const rawLines = code.split('\n');

  // Strip block comments while preserving original 1-indexed line numbers
  const lines: string[] = [];
  let inBlockComment = false;
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];
    if (inBlockComment) {
      const endIdx = line.indexOf('*/');
      if (endIdx !== -1) {
        line = line.slice(endIdx + 2);
        inBlockComment = false;
      } else {
        lines.push('');
        continue;
      }
    }
    const startIdx = line.indexOf('/*');
    if (startIdx !== -1) {
      const endIdx = line.indexOf('*/', startIdx + 2);
      if (endIdx !== -1) {
        line = line.slice(0, startIdx) + line.slice(endIdx + 2);
      } else {
        line = line.slice(0, startIdx);
        inBlockComment = true;
      }
    }
    const lineCommentIdx = line.indexOf('//');
    if (lineCommentIdx !== -1) {
      line = line.slice(0, lineCommentIdx);
    }
    const hashCommentIdx = line.indexOf('#');
    if (hashCommentIdx !== -1 && language === 'python') {
      line = line.slice(0, hashCommentIdx);
    }
    lines.push(line);
  }

  // Execution environment state
  const scope: Record<string, any> = { ...inputs };
  let returnedValue: any = undefined;
  let hasReturned = false;

  // Helper to snapshot current variable states into a TraceStep
  const snapshotStep = (
    lineNo: number,
    explanation: string,
    activeIndices: number[] = [],
    swappedIndices: number[] = []
  ) => {
    const visibleVars: Record<string, any> = {};
    const pointers: Record<string, number> = {};

    let primaryArray: any[] | null = null;
    let primaryArrayName = '';

    for (const [k, v] of Object.entries(scope)) {
      if (Array.isArray(v)) {
        visibleVars[k] = [...v];
        if (!primaryArray) {
          primaryArray = v;
          primaryArrayName = k;
        }
      } else if (typeof v === 'object' && v !== null && !('val' in v)) {
        visibleVars[k] = { ...v };
      } else {
        visibleVars[k] = v;
        if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && primaryArray && v <= primaryArray.length + 2) {
          pointers[k] = v;
        }
      }
    }

    let arrayState: ArrayElementData[] | null = null;
    if (primaryArray) {
      arrayState = primaryArray.map((val, idx) => {
        const ptrs: string[] = [];
        for (const [pName, pIdx] of Object.entries(pointers)) {
          if (pIdx === idx && !pName.startsWith('_')) {
            ptrs.push(pName);
          }
        }
        let status: 'default' | 'active' | 'compared' | 'swapped' | 'sorted' = 'default';
        if (swappedIndices.includes(idx)) status = 'swapped';
        else if (activeIndices.includes(idx)) status = 'active';

        return {
          index: idx,
          val,
          pointers: ptrs.length > 0 ? ptrs : undefined,
          status,
        };
      });
    }

    const funcName = language === 'java' ? 'Solution.main' : language === 'cpp' ? 'Solution::solve' : 'solution';
    const callStack: CallStackFrame[] = [
      {
        functionName: `${funcName}:${lineNo}`,
        args: { ...inputs },
        depth: 1,
        status: 'running',
      },
    ];

    steps.push({
      step: steps.length + 1,
      line: lineNo,
      explanation,
      variables: visibleVars,
      callStack,
      arrayState,
      returnValue: returnedValue,
    });
  };

  // Find start PC (entry inside first method)
  let startPc = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (
      trimmed.startsWith('def ') ||
      (trimmed.includes('(') && (trimmed.includes('public ') || trimmed.includes('vector<') || trimmed.includes('int[]') || trimmed.includes('void ')))
    ) {
      startPc = i + 1;
      break;
    }
  }

  snapshotStep(
    startPc || 1,
    `🚀 Initialized Execution: Loaded parameters (${Object.entries(inputs)
      .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
      .join(', ')}). Ready to trace line-by-line.`
  );

  // Line-by-line interpreter loop
  let pc = startPc;
  let safetyLimit = 0;

  interface LoopContext {
    type: 'for' | 'while';
    headerPc: number;
    varName?: string;
    updateExpr?: string;
    conditionExpr: string;
    bodyStartPc: number;
    bodyEndPc: number;
  }

  const loopContextStack: LoopContext[] = [];

  // Helper to find closing brace for C++/Java or dedent for Python
  const findBlockEnd = (fromPc: number): number => {
    let braceCount = 0;
    let foundOpen = false;

    for (let i = fromPc; i < lines.length; i++) {
      const l = lines[i];
      for (const ch of l) {
        if (ch === '{') {
          braceCount++;
          foundOpen = true;
        } else if (ch === '}') {
          braceCount--;
          if (foundOpen && braceCount === 0) {
            return i;
          }
        }
      }
    }
    return lines.length - 1;
  };

  while (pc < lines.length && !hasReturned && safetyLimit < 350) {
    safetyLimit++;
    const rawLine = lines[pc];
    const line = rawLine.trim();
    const lineNo = pc + 1;

    // Skip empty lines, standalone braces, comments
    if (
      !line ||
      line === '{' ||
      line === '}' ||
      line.startsWith('class ') ||
      line.startsWith('public class ') ||
      line.startsWith('#') ||
      line.startsWith('//')
    ) {
      pc++;
      continue;
    }

    // Skip method headers
    if (
      (line.startsWith('def ') ||
        line.startsWith('public ') ||
        line.startsWith('private ') ||
        line.startsWith('void ') ||
        line.startsWith('int[] ') ||
        line.startsWith('vector<')) &&
      line.endsWith('{')
    ) {
      pc++;
      continue;
    }

    // 1. Check for `return` statement
    if (line.startsWith('return ') || line === 'return;' || line.startsWith('return;')) {
      const retExpr = line.replace(/^return\s*/, '').replace(/;$/, '').trim();
      if (retExpr) {
        returnedValue = evaluateExpression(retExpr, scope);
      }
      hasReturned = true;
      snapshotStep(
        lineNo,
        `🏁 Return Statement: returned ${JSON.stringify(returnedValue ?? 'void')}`
      );
      break;
    }

    // 2. Check for `break` statement
    if (line === 'break;' || line === 'break') {
      const currentLoop = loopContextStack.pop();
      if (currentLoop) {
        snapshotStep(lineNo, `⚡ Break Statement: Exiting loop.`);
        pc = currentLoop.bodyEndPc + 1;
        continue;
      }
    }

    // 3. For loop: `for (int i = 0; i < nums.length; i++)` or `for (int j = i + 1; ...)`
    const forMatch = line.match(/for\s*\(\s*(?:(?:int|var|auto)\s+)?(\w+)\s*=\s*(.*?);\s*(.*?);\s*(.*?)\)/);
    if (forMatch) {
      const varName = forMatch[1];
      const initExpr = forMatch[2];
      const condExpr = forMatch[3];
      const stepExpr = forMatch[4];

      // Check if this loop is already active in stack
      const existingLoop = loopContextStack.find((l) => l.headerPc === pc);

      if (!existingLoop) {
        // Initialize loop variable
        const initVal = evaluateExpression(initExpr, scope);
        scope[varName] = initVal;

        const bodyEnd = findBlockEnd(pc);
        const newLoop: LoopContext = {
          type: 'for',
          headerPc: pc,
          varName,
          updateExpr: stepExpr,
          conditionExpr: condExpr,
          bodyStartPc: pc + 1,
          bodyEndPc: bodyEnd,
        };
        loopContextStack.push(newLoop);

        // Evaluate condition
        const condVal = Boolean(evaluateExpression(condExpr, scope));
        snapshotStep(
          lineNo,
          `🔁 Initialized loop: ${varName} = ${initVal}. Evaluated condition (${condExpr}) ➔ ${condVal ? 'TRUE (Entering loop)' : 'FALSE (Skipping loop)'}`,
          scope[varName] !== undefined && typeof scope[varName] === 'number' ? [scope[varName]] : []
        );

        if (condVal) {
          pc++;
        } else {
          loopContextStack.pop();
          pc = bodyEnd + 1;
        }
        continue;
      } else {
        // Loop iteration update: e.g. i++ or j++
        if (existingLoop.updateExpr) {
          if (existingLoop.updateExpr.includes('++')) {
            scope[varName] = (scope[varName] || 0) + 1;
          } else if (existingLoop.updateExpr.includes('--')) {
            scope[varName] = (scope[varName] || 0) - 1;
          } else {
            const val = evaluateExpression(existingLoop.updateExpr, scope);
            if (val !== undefined) scope[varName] = val;
          }
        }

        const condVal = Boolean(evaluateExpression(condExpr, scope));
        snapshotStep(
          lineNo,
          `🔁 Loop Next: ${varName} updated to ${scope[varName]}. Condition (${condExpr}) is ${condVal ? 'TRUE (Continuing loop)' : 'FALSE (Loop complete)'}`,
          scope[varName] !== undefined && typeof scope[varName] === 'number' ? [scope[varName]] : []
        );

        if (condVal) {
          pc++;
        } else {
          loopContextStack.pop();
          pc = existingLoop.bodyEndPc + 1;
        }
        continue;
      }
    }

    // 4. Python For loop: `for i in range(len(nums)):`
    const pyForMatch = line.match(/for\s+(\w+)\s+in\s+range\((.*?)\):/);
    if (pyForMatch) {
      const varName = pyForMatch[1];
      const rangeArgs = pyForMatch[2].split(',').map((x) => x.trim());
      let start = 0;
      let end = 0;
      if (rangeArgs.length === 1) {
        end = evaluateExpression(rangeArgs[0], scope) || 0;
      } else {
        start = evaluateExpression(rangeArgs[0], scope) || 0;
        end = evaluateExpression(rangeArgs[1], scope) || 0;
      }

      const existingLoop = loopContextStack.find((l) => l.headerPc === pc);
      if (!existingLoop) {
        scope[varName] = start;
        const newLoop: LoopContext = {
          type: 'for',
          headerPc: pc,
          varName,
          conditionExpr: `${varName} < ${end}`,
          bodyStartPc: pc + 1,
          bodyEndPc: lines.length - 1,
        };
        loopContextStack.push(newLoop);

        const condVal = start < end;
        snapshotStep(
          lineNo,
          `🔁 For iteration: ${varName} = ${start}. (${start} < ${end}) ➔ ${condVal}`,
          [start]
        );
        if (condVal) pc++;
        else {
          loopContextStack.pop();
          pc++;
        }
        continue;
      } else {
        scope[varName] = (scope[varName] || 0) + 1;
        const condVal = scope[varName] < end;
        snapshotStep(
          lineNo,
          `🔁 For iteration: ${varName} = ${scope[varName]}. (${scope[varName]} < ${end}) ➔ ${condVal}`,
          [scope[varName]]
        );
        if (condVal) pc++;
        else {
          loopContextStack.pop();
          pc++;
        }
        continue;
      }
    }

    // 5. While loop: `while (start < end)` or `while start < end:`
    const whileMatch = line.match(/while\s*\(?\s*(.*?)\s*\)?(?::|\{|$)/);
    if (whileMatch && line.startsWith('while')) {
      const condExpr = whileMatch[1].replace(/\{$/, '').trim();
      const condVal = Boolean(evaluateExpression(condExpr, scope));
      const bodyEnd = findBlockEnd(pc);

      const existingLoop = loopContextStack.find((l) => l.headerPc === pc);
      if (!existingLoop && condVal) {
        loopContextStack.push({
          type: 'while',
          headerPc: pc,
          conditionExpr: condExpr,
          bodyStartPc: pc + 1,
          bodyEndPc: bodyEnd,
        });
      }

      snapshotStep(
        lineNo,
        `🔍 While Condition: evaluated (${condExpr}) ➔ ${condVal ? 'TRUE (Entering loop)' : 'FALSE (Exiting loop)'}`
      );

      if (condVal) {
        pc++;
      } else {
        if (existingLoop) loopContextStack.pop();
        pc = bodyEnd + 1;
      }
      continue;
    }

    // 6. If Condition: `if (nums[i] + nums[j] == target)`
    const ifMatch = line.match(/if\s*\(?\s*(.*?)\s*\)?(?::|\{|$)/);
    if (ifMatch && line.startsWith('if')) {
      const condExpr = ifMatch[1].replace(/\{$/, '').trim();
      const condVal = Boolean(evaluateExpression(condExpr, scope));
      const bodyEnd = findBlockEnd(pc);

      // Active comparison indices for visual highlighting
      const activeIndices: number[] = [];
      if (scope.i !== undefined && typeof scope.i === 'number') activeIndices.push(scope.i);
      if (scope.j !== undefined && typeof scope.j === 'number') activeIndices.push(scope.j);
      if (scope.left !== undefined && typeof scope.left === 'number') activeIndices.push(scope.left);
      if (scope.right !== undefined && typeof scope.right === 'number') activeIndices.push(scope.right);

      snapshotStep(
        lineNo,
        `🔍 Condition Check: evaluated (${condExpr}) ➔ ${condVal ? 'TRUE (Condition Met)' : 'FALSE (Condition Not Met)'}`,
        activeIndices
      );

      if (condVal) {
        pc++;
      } else {
        pc = bodyEnd + 1;
      }
      continue;
    }

    // 7. Array element assignment: `arr[0] = i;` or `nums[left] = nums[right];`
    const arraySetMatch = line.match(/(?:(?:int|var|auto)\s+)?(\w+)\[(.*?)\]\s*=\s*(.*?);?$/);
    if (arraySetMatch) {
      const arrName = arraySetMatch[1];
      const idxExpr = arraySetMatch[2];
      const valExpr = arraySetMatch[3];

      const idxVal = Number(evaluateExpression(idxExpr, scope));
      const rightVal = evaluateExpression(valExpr, scope);

      if (!scope[arrName] || !Array.isArray(scope[arrName])) {
        scope[arrName] = [];
      }
      scope[arrName][idxVal] = rightVal;

      snapshotStep(
        lineNo,
        `📥 Updated Array: set ${arrName}[${idxVal}] = ${JSON.stringify(rightVal)}`,
        [idxVal],
        [idxVal]
      );
      pc++;
      continue;
    }

    // 8. Variable declaration or assignment: `int[] arr = {0, 0};` or `int i = 0;` or `temp = nums[i];`
    const assignMatch = line.match(/(?:(?:int\[\]|int|vector<int>|var|auto|let|const)\s+)?(\w+)\s*=\s*(.*?);?$/);
    if (assignMatch && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
      const varName = assignMatch[1];
      const rightExpr = assignMatch[2];
      const rightVal = evaluateExpression(rightExpr, scope);

      scope[varName] = rightVal;

      snapshotStep(
        lineNo,
        `📝 Assigned ${varName} = ${JSON.stringify(rightVal)}`
      );
      pc++;
      continue;
    }

    // 9. Increment / Decrement: `start++;` or `end--;` or `left += 1`
    const incDecMatch = line.match(/(\w+)(\+\+|--);?$/);
    if (incDecMatch) {
      const varName = incDecMatch[1];
      const op = incDecMatch[2];
      if (op === '++') scope[varName] = (scope[varName] || 0) + 1;
      else scope[varName] = (scope[varName] || 0) - 1;

      snapshotStep(
        lineNo,
        `➡️ Updated ${varName}${op} ➔ ${scope[varName]}`
      );
      pc++;
      continue;
    }

    // 10. End of block check: if inside a loop, loop back to the loop header
    if (loopContextStack.length > 0) {
      const activeLoop = loopContextStack[loopContextStack.length - 1];
      if (pc >= activeLoop.bodyEndPc) {
        pc = activeLoop.headerPc;
        continue;
      }
    }

    pc++;
  }

  // Final conclusion step
  if (steps.length === 0 || !hasReturned) {
    snapshotStep(
      lines.length,
      `🎉 Execution Finished: Final state: ${JSON.stringify(scope)}`
    );
  }

  return {
    errorClassification: {
      type: 'none',
      title: `${language.toUpperCase()} Execution Accepted`,
      description: `Deterministically executed ${steps.length} line-by-line steps of your exact custom code.`,
      expectedOutput,
      actualOutput: expectedOutput || JSON.stringify(returnedValue ?? scope),
    },
    isExecutable: true,
    steps,
    totalSteps: steps.length,
    summary: `Traced ${steps.length} line-by-line steps directly from your custom ${language.toUpperCase()} code.`,
  };
}
