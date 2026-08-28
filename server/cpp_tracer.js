import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Traces C++ execution line-by-line using GDB Machine Interface (gdb --interpreter=mi2)
 */
export async function traceCpp(userCode, testInputs = {}, maxSteps = 400) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visualcode_cpp_'));

  try {
    let fullCode = userCode;

    // Ensure includes and main driver exist
    const hasMain = userCode.includes('int main(') || userCode.includes('int main ()');

    if (!hasMain) {
      const headerIncludes = `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;
`;
      // Find method in Solution
      const methodMatch = userCode.match(/(?:vector<int>|void|int|bool)\s+(\w+)\s*\((.*?)\)/);
      let callHarness = '';

      if (methodMatch) {
        const methodName = methodMatch[1];
        const argStrings = [];
        for (const [k, v] of Object.entries(testInputs)) {
          if (Array.isArray(v)) {
            argStrings.push(`vector<int>{${v.join(', ')}}`);
          } else if (typeof v === 'string') {
            argStrings.push(`"${v}"`);
          } else {
            argStrings.push(String(v));
          }
        }
        callHarness = `
int main() {
    Solution sol;
    sol.${methodName}(${argStrings.join(', ')});
    return 0;
}
`;
      } else {
        callHarness = `
int main() {
    Solution sol;
    return 0;
}
`;
      }

      fullCode = headerIncludes + '\n' + userCode + '\n' + callHarness;
    }

    const cppFile = path.join(tempDir, 'solution.cpp');
    const exeFile = path.join(tempDir, 'solution.exe');
    fs.writeFileSync(cppFile, fullCode, 'utf8');

    // Compile with g++ -g -O0
    execSync(`g++ -g -O0 "${cppFile}" -o "${exeFile}"`, { cwd: tempDir, timeout: 6000 });

    // Spawn GDB with Machine Interface
    const gdb = spawn('gdb', ['--interpreter=mi2', '-q', exeFile], {
      cwd: tempDir,
    });

    const steps = [];
    let stepIndex = 0;

    return new Promise((resolve) => {
      let buffer = '';
      const timer = setTimeout(() => {
        try { gdb.kill(); } catch (e) {}
        resolve({ success: true, steps, totalSteps: steps.length });
      }, 5000);

      const sendGdb = (cmd) => {
        try { gdb.stdin.write(cmd + '\n'); } catch (e) {}
      };

      gdb.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const l of lines) {
          const trimmed = l.trim();

          // GDB/MI stopped event: *stopped,reason="end-stepping-range",frame={addr="...",func="...",args=[...],file="solution.cpp",fullname="...",line="14"}
          if (trimmed.startsWith('*stopped') && trimmed.includes('solution.cpp')) {
            const lineMatch = trimmed.match(/line="(\d+)"/);
            const funcMatch = trimmed.match(/func="(\w+)"/);

            if (lineMatch) {
              stepIndex++;
              const lineNo = parseInt(lineMatch[1], 10);
              const funcName = funcMatch ? funcMatch[1] : 'solve';

              steps.push({
                step: stepIndex,
                line: lineNo,
                event: 'line',
                func_name: funcName,
                callStack: [{ functionName: funcName, line: lineNo, depth: 1, status: 'running' }],
                variables: {},
                explanation: `Line ${lineNo}: Stepped in ${funcName}()`,
              });

              // Request local variables via GDB/MI
              sendGdb('-stack-list-variables --all-values');

              if (stepIndex < maxSteps) {
                sendGdb('-exec-step');
              } else {
                sendGdb('-exec-continue');
              }
            }
          }

          // Parse variable results: ^done,variables=[{name="i",value="0"},{name="j",value="1"}]
          if (trimmed.startsWith('^done,variables=')) {
            const varRegex = /{name="(\w+)",value="(.*?)"}/g;
            let match;
            if (steps.length > 0) {
              const lastStep = steps[steps.length - 1];
              while ((match = varRegex.exec(trimmed)) !== null) {
                const name = match[1];
                let valStr = match[2];
                if (name !== 'sol' && name !== 'argc' && name !== 'argv') {
                  const num = Number(valStr);
                  lastStep.variables[name] = isNaN(num) ? valStr : num;
                }
              }
            }
          }

          if (trimmed.includes('exited-normally') || trimmed.includes('*stopped,reason="exited"')) {
            clearTimeout(timer);
            try { gdb.kill(); } catch (e) {}
            resolve({ success: true, steps, totalSteps: steps.length });
            return;
          }
        }
      });

      // Initial command sequence: break at main and run
      sendGdb('-break-insert main');
      sendGdb('-exec-run');
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
