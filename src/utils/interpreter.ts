import type { TraceStep, ArrayElement } from "./traceEngine";

export interface TreeNode {
  val: any;
  left: TreeNode | null;
  right: TreeNode | null;
}

export interface ListNode {
  val: any;
  next: ListNode | null;
}

// Parse LeetCode style level-order binary tree list [1, 2, 3, null, 4]
export function parseBinaryTree(str: string): TreeNode | null {
  try {
    const cleaned = str.trim();
    if (!cleaned.startsWith("[") || !cleaned.endsWith("]")) return null;
    const arr = JSON.parse(cleaned);
    if (!Array.isArray(arr) || arr.length === 0) return null;

    const root: TreeNode = { val: arr[0], left: null, right: null };
    const queue: TreeNode[] = [root];
    let i = 1;

    while (queue.length > 0 && i < arr.length) {
      const curr = queue.shift()!;
      
      if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
        curr.left = { val: arr[i], left: null, right: null };
        queue.push(curr.left);
      }
      i++;

      if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
        curr.right = { val: arr[i], left: null, right: null };
        queue.push(curr.right);
      }
      i++;
    }
    return root;
  } catch (e) {
    return null;
  }
}

// Parse Linked List string "1 -> 2 -> 3 -> 4"
export function parseLinkedList(str: string): ListNode | null {
  try {
    const parts = str.split("->").map((x) => x.trim()).filter(Boolean);
    if (parts.length === 0) return null;

    const head: ListNode = { val: parts[0], next: null };
    let curr = head;
    for (let i = 1; i < parts.length; i++) {
      curr.next = { val: parts[i], next: null };
      curr = curr.next;
    }
    return head;
  } catch (e) {
    return null;
  }
}

interface FunctionDef {
  name: string;
  params: string[];
  startPc: number;
}

interface StackFrame {
  returnPc: number;
  returnVar: string | null;
  variables: Record<string, any>;
  callStackLabel: string;
}

export function runCustomCode(
  code: string,
  initialInputs: Record<string, any>
): TraceStep[] {
  const steps: TraceStep[] = [];

  // Capture initial structures
  let initialArray: any = undefined;
  let initialList: any = undefined;
  let initialTree: any = undefined;
  let initialMatrix: any = undefined;

  for (const val of Object.values(initialInputs)) {
    if (val && typeof val === "object") {
      if ("val" in val && "next" in val) {
        initialList = val;
      } else if ("val" in val && "left" in val && "right" in val) {
        initialTree = val;
      } else if (Array.isArray(val) && val.length > 0) {
        if (Array.isArray(val[0])) {
          initialMatrix = val;
        } else {
          initialArray = val;
        }
      }
    }
  }
  
  // 1. Preprocess code: strip block comments preserving line numbers
  let cleanedCode = code;
  cleanedCode = cleanedCode.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    return match.split("\n").map(() => "").join("\n");
  });

  const lines = cleanedCode.split("\n");

  // 2. Discover function definitions in code
  const functions: Record<string, FunctionDef> = {};
  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.trim();

    // Python syntax: def name(a, b):
    let match = line.match(/^def\s+(\w+)\s*\((.*?)\)\s*:/);
    if (match) {
      const name = match[1];
      const params = match[2].split(",").map((x) => x.trim()).filter(Boolean);
      functions[name] = { name, params, startPc: idx + 1 };
      continue;
    }

    // Java/C++ syntax: private int height(TreeNode node) {
    match = line.match(/(?:public|private|protected|static|\w+)\s+(\w+)\s*\((.*?)\)\s*\{/);
    if (match && !line.startsWith("class") && !line.startsWith("if") && !line.startsWith("while") && !line.startsWith("for")) {
      const name = match[1];
      const params = match[2].split(",").map((x) => {
        const parts = x.trim().split(/\s+/);
        return parts[parts.length - 1]; // get param name
      }).filter(Boolean);
      functions[name] = { name, params, startPc: idx + 1 };
    }
  }

  // 3. Setup execution frames & scopes
  let variables: Record<string, any> = { ...initialInputs, diameter: 0 };
  const callStack: string[] = ["main()"];
  const controlFlow: string[] = [];
  let output = "";

  const frameStack: StackFrame[] = [];

  // Helper to safely evaluate simple Python/JS-like expressions in current variable context
  const evalExpr = (expr: string): any => {
    let jsExpr = expr
      .replace(/\/\//g, "/")
      .replace(/len\((.*?)\)/g, "$1.length")
      .replace(/enumerate\((.*?)\)/g, "$1")
      .replace(/in seen/g, " !== undefined")
      .replace(/and/g, "&&")
      .replace(/or/g, "||")
      .replace(/True/g, "true")
      .replace(/False/g, "false")
      .replace(/None/g, "null")
      .replace(/Math\.max/g, "Math.max");

    // Replace variable names with values
    const keys = Object.keys(variables).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      const val = variables[key];
      const regex = new RegExp(`\\b${key}\\b`, "g");
      if (typeof val === "object" && val !== null) {
        jsExpr = jsExpr.replace(regex, JSON.stringify(val));
      } else if (typeof val === "string") {
        jsExpr = jsExpr.replace(regex, `"${val}"`);
      } else {
        jsExpr = jsExpr.replace(regex, String(val));
      }
    }

    try {
      if (expr.includes("//") || expr.includes("floor") || expr.includes("/ 2")) {
        return Math.floor(new Function(`return ${jsExpr}`)());
      }
      return new Function(`return ${jsExpr}`)();
    } catch (e) {
      return null;
    }
  };

  const getArrayState = (): ArrayElement[] | undefined => {
    for (const [_, val] of Object.entries(variables)) {
      if (Array.isArray(val) && val.length > 0 && !Array.isArray(val[0]) && typeof val[0] !== "object") {
        return val.map((x, idx) => {
          let pointer = "";
          if (variables.i === idx) pointer += "i";
          if (variables.j === idx) pointer += (pointer ? " & " : "") + "j";
          if (variables.low === idx) pointer += (pointer ? " & " : "") + "low";
          if (variables.high === idx) pointer += (pointer ? " & " : "") + "high";
          if (variables.mid === idx) pointer += (pointer ? " & " : "") + "mid";

          return {
            value: x,
            index: idx,
            isActive: variables.i === idx || variables.j === idx || variables.mid === idx,
            pointer: pointer || undefined,
          };
        });
      }
    }
    return undefined;
  };

  const getHashmapState = (): Record<string, string> | undefined => {
    for (const [name, val] of Object.entries(variables)) {
      if (
        typeof val === "object" &&
        val !== null &&
        !Array.isArray(val) &&
        name !== "initialInputs" &&
        !("val" in val)
      ) {
        return val;
      }
    }
    return undefined;
  };

  const getLinkedListState = (): ListNode | undefined => {
    for (const val of Object.values(variables)) {
      if (val && typeof val === "object" && "val" in val && "next" in val) {
        return val as ListNode;
      }
    }
    return undefined;
  };

  const getBinaryTreeState = (): TreeNode | undefined => {
    for (const val of Object.values(variables)) {
      if (val && typeof val === "object" && "val" in val && "left" in val && "right" in val) {
        return val as TreeNode;
      }
    }
    return undefined;
  };

  const getMatrixState = (): any[][] | undefined => {
    for (const val of Object.values(variables)) {
      if (Array.isArray(val) && val.length > 0 && Array.isArray(val[0])) {
        return val;
      }
    }
    return undefined;
  };

  const getActiveNodeValue = (): any => {
    for (const val of Object.values(variables)) {
      if (val && typeof val === "object" && "val" in val) {
        return val.val;
      }
    }
    return undefined;
  };

  const addStep = (lineNum: number, desc: string) => {
    const varsFormatted: Record<string, string> = {};
    for (const [k, v] of Object.entries(variables)) {
      if (typeof v === "object" && v !== null) {
        varsFormatted[k] = JSON.stringify(v);
      } else {
        varsFormatted[k] = String(v);
      }
    }

    const activeNodeVal = getActiveNodeValue();

    steps.push({
      stepIndex: steps.length + 1,
      line: lineNum,
      description: desc,
      variables: varsFormatted,
      array: getArrayState() || (initialArray ? initialArray.map((x: any, idx: number) => ({ value: x, index: idx })) : undefined),
      hashmap: getHashmapState(),
      linkedList: getLinkedListState() as any || initialList,
      binaryTree: getBinaryTreeState() as any || initialTree,
      matrix: getMatrixState() as any || initialMatrix,
      callStack: [...callStack],
      output,
      controlFlow: [...controlFlow],
      highlights: {
        arrayIndices: [],
        hashmapKeys: [],
        activeNodeVal: activeNodeVal,
      },
    });
  };

  // Find start PC - start inside first function
  let pc = 0;
  const firstFunc = Object.values(functions)[0];
  if (firstFunc) {
    pc = firstFunc.startPc;
    // Bind main inputs
    firstFunc.params.forEach((param) => {
      // Find matching key in initialInputs
      const matchedKey = Object.keys(initialInputs).find((k) => k.toLowerCase().includes(param.toLowerCase()));
      if (matchedKey) {
        variables[param] = initialInputs[matchedKey];
      }
    });
    callStack.push(`${firstFunc.name}(root)`);
  }

  let safetyCounter = 0;
  const loopStack: { type: "while" | "for"; pc: number; condition: string; varName?: string; rangeMax?: number; currentVal?: number }[] = [];

  while (pc < lines.length && safetyCounter < 500) {
    safetyCounter++;
    const rawLine = lines[pc];
    const line = rawLine.trim();
    const lineNum = pc + 1;

    // Normalize Java/C++ line to Python/JS style
    let normalizedLine = line;
    if (normalizedLine.endsWith(";")) {
      normalizedLine = normalizedLine.slice(0, -1).trim();
    }

    // Strip class, access modifiers
    if (normalizedLine.startsWith("class ") || normalizedLine.startsWith("private ") || normalizedLine.startsWith("public ")) {
      // check if it is a class declaration or variable declaration
      if (normalizedLine.endsWith("{")) {
        pc++;
        continue;
      }
      normalizedLine = normalizedLine.replace(/^(?:public|private|protected|static)\s+/, "");
    }

    normalizedLine = normalizedLine.replace(/^(?:int|double|float|auto|var)\s+(\w+)\s*=/, "$1 =");

    if (!normalizedLine || normalizedLine.startsWith("#") || normalizedLine.startsWith("//") || normalizedLine.startsWith("/*") || normalizedLine.startsWith("}")) {
      pc++;
      continue;
    }

    const indent = rawLine.length - rawLine.trimStart().length;

    // Intercept function/method definitions
    if (normalizedLine.includes("(") && normalizedLine.endsWith("{") && !normalizedLine.startsWith("if") && !normalizedLine.startsWith("while") && !normalizedLine.startsWith("for")) {
      // It's a helper function definition line. Since we enter functions via explicit call, skip definition blocks.
      let nextPc = pc + 1;
      let depth = 1;
      while (nextPc < lines.length && depth > 0) {
        if (lines[nextPc].trim().endsWith("{")) depth++;
        if (lines[nextPc].trim() === "}") depth--;
        nextPc++;
      }
      pc = nextPc;
      continue;
    }

    // Check for helper function call expression: height(node.left)
    let hasFuncCall = false;
    for (const [funcName, funcDef] of Object.entries(functions)) {
      const regex = new RegExp(`\\b${funcName}\\((.*?)\\)`);
      const matchCall = normalizedLine.match(regex);
      if (matchCall) {
        hasFuncCall = true;
        // Evaluate args
        const rawArgs = matchCall[1].split(",").map((x) => x.trim()).filter(Boolean);
        const argsVals = rawArgs.map((arg) => evalExpr(arg));

        // Find assignment target if any
        let assignmentTarget: string | null = null;
        if (normalizedLine.includes("=")) {
          assignmentTarget = normalizedLine.split("=")[0].trim();
        }

        // Push frame
        frameStack.push({
          returnPc: pc + 1,
          returnVar: assignmentTarget,
          variables: { ...variables },
          callStackLabel: `${funcName}(${rawArgs.join(", ")})`,
        });

        // Initialize new scope variables
        const nextVars: Record<string, any> = { diameter: variables.diameter };
        funcDef.params.forEach((param, pIdx) => {
          nextVars[param] = argsVals[pIdx];
        });

        variables = nextVars;
        callStack.push(`${funcName}(${argsVals[0] && typeof argsVals[0] === "object" ? "node" : String(argsVals[0])})`);

        addStep(lineNum, `Call function: ${funcName}(${rawArgs.join(", ")})`);
        pc = funcDef.startPc;
        break;
      }
    }

    if (hasFuncCall) continue;

    // Assignment: x = y
    if (normalizedLine.includes("=") && !normalizedLine.includes("==") && !normalizedLine.includes("for ") && !normalizedLine.includes("while ")) {
      const parts = normalizedLine.split("=");
      const left = parts[0].trim();
      const right = parts[1].trim();

      if (left.includes(",") && right.includes(",")) {
        const leftVars = left.split(",").map((x) => x.trim());
        const rightExprs = right.split(",").map((x) => x.trim());
        const vals = rightExprs.map((expr) => evalExpr(expr));
        
        leftVars.forEach((lvar, idx) => {
          if (lvar.includes("[") && lvar.includes("]")) {
            const match = lvar.match(/(.*?)\[(.*?)\]/);
            if (match) {
              const arrName = match[1].trim();
              const idxVal = evalExpr(match[2].trim());
              if (variables[arrName] && Array.isArray(variables[arrName])) {
                variables[arrName][idxVal] = vals[idx];
              }
            }
          } else {
            variables[lvar] = vals[idx];
          }
        });

        addStep(lineNum, `Swap assignment: ${left} = ${right}`);
      } else if (left.includes("[") && left.includes("]")) {
        const match = left.match(/(.*?)\[(.*?)\]/);
        if (match) {
          const arrName = match[1].trim();
          const idxExpr = match[2].trim();
          const idxVal = evalExpr(idxExpr);
          const rightVal = evalExpr(right);

          if (variables[arrName]) {
            variables[arrName][idxVal] = rightVal;
          }
          addStep(lineNum, `Update index: ${left} = ${rightVal}`);
        }
      } else {
        const rightVal = evalExpr(right);
        variables[left] = rightVal;
        addStep(lineNum, `Assign: ${left} = ${rightVal}`);
      }
      pc++;
      continue;
    }

    // Return statement
    if (normalizedLine.startsWith("return")) {
      const retVal = evalExpr(normalizedLine.substring(6).trim());
      addStep(lineNum, `Return statement: return ${JSON.stringify(retVal)}`);

      if (frameStack.length > 0) {
        // Pop call stack
        const frame = frameStack.pop()!;
        callStack.pop();

        // Restore scope
        const diameterVal = variables.diameter; // retain global/class updates
        variables = { ...frame.variables, diameter: diameterVal };

        if (frame.returnVar) {
          variables[frame.returnVar] = retVal;
        }

        pc = frame.returnPc;
      } else {
        output = `Returned: ${JSON.stringify(retVal)}`;
        break;
      }
      continue;
    }

    // While loop
    if (normalizedLine.startsWith("while ") && normalizedLine.endsWith(":")) {
      const condition = normalizedLine.substring(6, normalizedLine.length - 1).trim();
      const conditionMet = evalExpr(condition);

      addStep(lineNum, `Check while condition: ${condition} ➔ ${conditionMet}`);

      if (conditionMet) {
        const existing = loopStack.find((x) => x.pc === pc);
        if (!existing) {
          loopStack.push({ type: "while", pc, condition });
        }
        pc++;
      } else {
        let nextPc = pc + 1;
        while (nextPc < lines.length) {
          const nextIndent = lines[nextPc].length - lines[nextPc].trimStart().length;
          if (lines[nextPc].trim() && nextIndent <= indent) {
            break;
          }
          nextPc++;
        }
        pc = nextPc;
      }
      continue;
    }

    // For loop
    if (normalizedLine.startsWith("for ") && normalizedLine.endsWith(":")) {
      const body = normalizedLine.substring(4, normalizedLine.length - 1).trim();
      
      if (body.includes("enumerate(")) {
        const parts = body.split(" in ");
        const loopVars = parts[0].split(",").map((x) => x.trim());
        const arrExpr = parts[1].replace("enumerate(", "").replace(")", "").trim();
        const targetArr = variables[arrExpr] || [];

        const existing = loopStack.find((x) => x.pc === pc);
        let currentIdx = existing ? (existing.currentVal ?? 0) : 0;

        if (currentIdx < targetArr.length) {
          variables[loopVars[0]] = currentIdx;
          variables[loopVars[1]] = targetArr[currentIdx];

          if (!existing) {
            loopStack.push({
              type: "for",
              pc,
              condition: body,
              currentVal: currentIdx,
              rangeMax: targetArr.length,
            });
          } else {
            existing.currentVal = currentIdx;
          }

          addStep(lineNum, `For iteration: ${loopVars[0]} = ${currentIdx}, ${loopVars[1]} = ${targetArr[currentIdx]}`);
          pc++;
        } else {
          let nextPc = pc + 1;
          while (nextPc < lines.length) {
            const nextIndent = lines[nextPc].length - lines[nextPc].trimStart().length;
            if (lines[nextPc].trim() && nextIndent <= indent) {
              break;
            }
            nextPc++;
          }
          pc = nextPc;
        }
      } else if (body.includes("range(")) {
        const parts = body.split(" in ");
        const loopVar = parts[0].trim();
        const rangeExpr = parts[1].replace("range(", "").replace(")", "").trim();
        
        let start = 0;
        let end = 0;

        if (rangeExpr.includes(",")) {
          const rangeParts = rangeExpr.split(",");
          start = evalExpr(rangeParts[0].trim());
          end = evalExpr(rangeParts[1].trim());
        } else {
          end = evalExpr(rangeExpr);
        }

        const existing = loopStack.find((x) => x.pc === pc);
        let currentIdx = existing ? (existing.currentVal ?? start) : start;

        if (currentIdx < end) {
          variables[loopVar] = currentIdx;

          if (!existing) {
            loopStack.push({
              type: "for",
              pc,
              condition: body,
              currentVal: currentIdx,
              rangeMax: end,
            });
          } else {
            existing.currentVal = currentIdx;
          }

          addStep(lineNum, `For iteration: ${loopVar} = ${currentIdx}`);
          pc++;
        } else {
          let nextPc = pc + 1;
          while (nextPc < lines.length) {
            const nextIndent = lines[nextPc].length - lines[nextPc].trimStart().length;
            if (lines[nextPc].trim() && nextIndent <= indent) {
              break;
            }
            nextPc++;
          }
          pc = nextPc;
        }
      } else {
        pc++;
      }
      continue;
    }

    // If condition
    if (normalizedLine.startsWith("if ") || normalizedLine.startsWith("if(")) {
      let condition = "";
      if (normalizedLine.startsWith("if(")) {
        // extract expression in parenthesis
        const cMatch = normalizedLine.match(/if\s*\((.*?)\)/);
        condition = cMatch ? cMatch[1] : "";
      } else {
        condition = normalizedLine.substring(3, normalizedLine.length - 1).trim();
      }
      
      const conditionMet = evalExpr(condition);
      addStep(lineNum, `Check condition: ${condition} ➔ ${conditionMet}`);

      if (conditionMet) {
        pc++;
      } else {
        let nextPc = pc + 1;
        while (nextPc < lines.length) {
          const nextIndent = lines[nextPc].length - lines[nextPc].trimStart().length;
          if (lines[nextPc].trim() && nextIndent <= indent) {
            break;
          }
          nextPc++;
        }
        pc = nextPc;
      }
      continue;
    }

    // Block indent check
    let nextLinePc = pc + 1;
    if (nextLinePc < lines.length) {
      const nextRaw = lines[nextLinePc];
      const nextIndent = nextRaw.length - nextRaw.trimStart().length;
      if (nextRaw.trim() && nextIndent <= indent && loopStack.length > 0) {
        const activeLoop = loopStack[loopStack.length - 1];
        const loopHeaderIndent = lines[activeLoop.pc].length - lines[activeLoop.pc].trimStart().length;
        if (nextIndent <= loopHeaderIndent) {
          if (activeLoop.type === "while") {
            pc = activeLoop.pc;
          } else if (activeLoop.type === "for") {
            activeLoop.currentVal = (activeLoop.currentVal ?? 0) + 1;
            pc = activeLoop.pc;
          }
          continue;
        }
      }
    }

    pc++;
  }

  if (steps.length === 0) {
    steps.push({
      stepIndex: 1,
      line: 1,
      description: "Code loaded. Click Run Code to execute.",
      variables: {},
      array: getArrayState(),
      hashmap: getHashmapState(),
      linkedList: getLinkedListState() as any,
      binaryTree: getBinaryTreeState() as any,
      matrix: getMatrixState() as any,
      callStack,
      output: "",
      controlFlow: [],
    });
  }

  return steps;
}
