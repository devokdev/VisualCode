import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Traces Java execution line-by-line using jdb (Java Debugger / JDI)
 */
export async function traceJava(userCode, testInputs = {}, maxSteps = 400) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visualcode_java_'));

  try {
    // 1. Wrap user code with a Driver harness if not already having main
    let fullCode = userCode;
    let className = 'Solution';

    const classMatch = userCode.match(/class\s+(\w+)/);
    if (classMatch) {
      className = classMatch[1];
    }

    if (!userCode.includes('public static void main')) {
      // Find the method name in Solution
      const methodMatch = userCode.match(/public\s+(?:static\s+)?[\w\[\]<>]+\s+(\w+)\s*\((.*?)\)/);
      let callHarness = '';

      if (methodMatch) {
        const methodName = methodMatch[1];
        // Prepare call arguments based on testInputs
        const argStrings = [];
        for (const [k, v] of Object.entries(testInputs)) {
          if (Array.isArray(v)) {
            argStrings.push(`new int[]{${v.join(', ')}}`);
          } else if (typeof v === 'string') {
            argStrings.push(`"${v}"`);
          } else {
            argStrings.push(String(v));
          }
        }
        callHarness = `
    public static void main(String[] args) {
        ${className} sol = new ${className}();
        try {
            sol.${methodName}(${argStrings.join(', ')});
        } catch(Exception e) {}
    }
`;
      } else {
        callHarness = `
    public static void main(String[] args) {
        ${className} sol = new ${className}();
    }
`;
      }

      // Insert harness right before the last closing brace
      const lastBrace = fullCode.lastIndexOf('}');
      if (lastBrace !== -1) {
        fullCode = fullCode.slice(0, lastBrace) + callHarness + '\n}';
      }
    }

    const javaFile = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(javaFile, fullCode, 'utf8');

    // 2. Compile with debug symbols (-g)
    execSync(`javac -g "${javaFile}"`, { cwd: tempDir, timeout: 5000 });

    // 3. Step execution using jdb session
    const jdb = spawn('jdb', ['-classpath', tempDir, className], {
      cwd: tempDir,
      shell: true,
    });

    const steps = [];
    let stepIndex = 0;

    return new Promise((resolve) => {
      let buffer = '';
      const timer = setTimeout(() => {
        try { jdb.kill(); } catch (e) {}
        resolve({ success: true, steps, totalSteps: steps.length });
      }, 5000);

      const sendCmd = (cmd) => {
        try {
          jdb.stdin.write(cmd + '\n');
        } catch (e) {}
      };

      jdb.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial

        for (const l of lines) {
          const trimmed = l.trim();

          // Check breakpoint / step location
          // e.g. "Breakpoint hit: "thread=main", Solution.twoSum(), line=4 bci=0"
          // e.g. "Step completed: "thread=main", Solution.twoSum(), line=5 bci=12"
          const stepMatch = trimmed.match(/(?:Breakpoint hit|Step completed):\s*".*?",\s*(?:[\w$.]+)\.(\w+)\(\),\s*line=(\d+)/);

          if (stepMatch) {
            stepIndex++;
            const funcName = stepMatch[1];
            const lineNo = parseInt(stepMatch[2], 10);

            // Queue commands to inspect locals
            sendCmd('locals');

            steps.push({
              step: stepIndex,
              line: lineNo,
              event: 'line',
              func_name: funcName,
              callStack: [{ functionName: `${className}.${funcName}`, line: lineNo, depth: 1, status: 'running' }],
              variables: {},
              explanation: `Line ${lineNo}: Stepped into ${funcName}`,
            });

            if (stepIndex < maxSteps) {
              sendCmd('step');
            } else {
              sendCmd('cont');
            }
          }

          // Parse local variables from 'locals' command output
          // e.g. "i = 0" or "nums = instance of int[3] (id=...)"
          const varMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
          if (varMatch && steps.length > 0 && !trimmed.startsWith('Method arguments:') && !trimmed.startsWith('Local variables:')) {
            const varName = varMatch[1];
            let rawVal = varMatch[2].trim();

            if (rawVal === 'null') rawVal = null;
            else if (!isNaN(Number(rawVal))) rawVal = Number(rawVal);

            const lastStep = steps[steps.length - 1];
            if (lastStep && varName !== 'args' && varName !== 'this' && varName !== 'sol') {
              lastStep.variables[varName] = rawVal;
            }
          }

          if (trimmed.includes('The application exited') || trimmed.includes('main[1]') && stepIndex >= maxSteps) {
            clearTimeout(timer);
            try { jdb.kill(); } catch (e) {}
            resolve({ success: true, steps, totalSteps: steps.length });
            return;
          }
        }
      });

      // Initial command sequence: set breakpoint on main and run
      sendCmd(`stop in ${className}.main`);
      sendCmd('run');
    });
  } catch (err) {
    return {
      success: false,
      error: err.message,
      steps: [],
      totalSteps: 0,
    };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}
