import { jsonrepair } from 'jsonrepair';
import type { ExecutionAnalysisResult, Language, ProblemContext } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Live Verified OpenRouter Free & DeepSeek Models
const MODELS_PRIORITY = [
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'deepseek/deepseek-v4-flash',
  'deepseek/deepseek-chat',
  'deepseek/deepseek-r1',
  'nvidia/nemotron-3.5-lightning:free',
  'cohere/north-mini-code:free',
  'z-ai/glm-5.2:free',
];

export function getApiKey(): string {
  return localStorage.getItem('visualcode_openrouter_key') || (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('visualcode_openrouter_key', key.trim());
}

function parseAndRepairJson(rawContent: string): any {
  // Strip DeepSeek R1 reasoning <think>...</think> tags if present
  let trimmed = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const targetStr = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

  try {
    return JSON.parse(targetStr);
  } catch {}

  try {
    const repaired = jsonrepair(targetStr);
    return JSON.parse(repaired);
  } catch (err1) {
    const start = targetStr.indexOf('{');
    const end = targetStr.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const sliced = targetStr.slice(start, end + 1);
      try {
        const repairedSliced = jsonrepair(sliced);
        return JSON.parse(repairedSliced);
      } catch (err2) {
        console.error('jsonrepair failed on slice:', err2);
      }
    }
  }

  throw new Error('Could not parse AI response. Please try re-running.');
}

async function callOpenRouter(messages: { role: string; content: string }[], jsonMode = true, maxTokens = 800): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API Key. Please click the "API Key" button at the top right to configure your OpenRouter API Key.');
  }

  let lastError: Error | null = null;

  // Try each model in sequence (cascade fallback to free models)
  for (const model of MODELS_PRIORITY) {
    try {
      const supportsJsonFormat = !model.includes('free');
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://visualcode.dev',
          'X-Title': 'VisualCode AI Visualizer',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: jsonMode && supportsJsonFormat ? { type: 'json_object' } : undefined,
          temperature: 0.1,
          max_tokens: maxTokens,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Model ${model} returned error (${res.status}):`, errText);
        lastError = new Error(`OpenRouter (${model}): ${errText}`);
        continue;
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        continue;
      }

      if (jsonMode) {
        return parseAndRepairJson(rawContent);
      }

      return rawContent;
    } catch (err: any) {
      console.warn(`Failed with ${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All free model fallbacks failed. Please verify your OpenRouter key.');
}

function normalizeProblem(raw: any, query: string): ProblemContext {
  return {
    title: raw?.title || query,
    slug: raw?.slug || query.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    difficulty: (['Easy', 'Medium', 'Hard'].includes(raw?.difficulty) ? raw.difficulty : 'Medium') as any,
    tags: Array.isArray(raw?.tags) ? raw.tags : ['Algorithm'],
    description: raw?.description || 'No description available.',
    examples: Array.isArray(raw?.examples) && raw.examples.length > 0 ? raw.examples : [{ input: '', output: '', explanation: '' }],
    constraints: Array.isArray(raw?.constraints) ? raw.constraints : [],
    starterCode: {
      python: raw?.starterCode?.python || '# Write solution here\nclass Solution:\n    pass\n',
      java: raw?.starterCode?.java || '// Write solution here\nclass Solution {\n}\n',
      cpp: raw?.starterCode?.cpp || '// Write solution here\nclass Solution {\n};\n',
    },
    dataStructureType: raw?.dataStructureType || 'array',
  };
}

function normalizeTraceResult(raw: any, expectedOutput = ''): ExecutionAnalysisResult {
  if (!raw || typeof raw !== 'object') {
    return {
      errorClassification: {
        type: 'none',
        title: 'Execution Completed',
        description: 'Completed without fatal errors.',
        expectedOutput,
        actualOutput: expectedOutput,
      },
      isExecutable: true,
      steps: [],
      totalSteps: 0,
      summary: 'Execution finished.',
    };
  }

  const rawErr = raw.errorClassification || {};
  const errorClassification = {
    type: (['syntax', 'semantic', 'logical', 'none'].includes(rawErr.type) ? rawErr.type : 'none') as any,
    title: rawErr.title || (rawErr.type && rawErr.type !== 'none' ? 'Execution Notice' : 'Success'),
    description: rawErr.description || '',
    line: rawErr.line,
    fixRecommendation: rawErr.fixRecommendation,
    expectedOutput: rawErr.expectedOutput || expectedOutput,
    actualOutput: rawErr.actualOutput || '',
  };

  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const steps = rawSteps.map((s: any, idx: number) => ({
    step: typeof s?.step === 'number' ? s.step : idx + 1,
    line: typeof s?.line === 'number' ? s?.line : 1,
    explanation: s?.explanation || s?.description || `Step ${idx + 1}`,
    stdout: s?.stdout || undefined,
    returnValue: s?.returnValue !== undefined ? s.returnValue : undefined,
    variables: s?.variables && typeof s?.variables === 'object' ? s.variables : {},
    callStack: Array.isArray(s?.callStack) ? s.callStack : [],
    treeState: s?.treeState || null,
    graphState: s?.graphState || null,
    linkedListState: s?.linkedListState || null,
    arrayState: Array.isArray(s?.arrayState) ? s.arrayState : null,
    matrixState: s?.matrixState || null,
    highlightedLines: Array.isArray(s?.highlightedLines) ? s.highlightedLines : undefined,
  }));

  return {
    errorClassification,
    isExecutable: raw.isExecutable !== undefined ? Boolean(raw.isExecutable) : true,
    steps,
    totalSteps: steps.length,
    summary: raw.summary || 'Execution analysis complete.',
  };
}

export async function fetchLeetCodeProblem(query: string): Promise<ProblemContext> {
  const prompt = `You are a LeetCode problem scraper and data structures expert.
Given the user query (e.g. "Rotate Array", "189", "Invert Binary Tree"), return the complete structured problem context in valid JSON.

Query: "${query}"

CRITICAL RULE FOR dataStructureType:
- Arrays/rotations/two-pointers: "array"
- Tree/BST: "tree" | "bst"
- Graph: "graph"
- Linked list: "linked_list"
- 2D grid: "matrix"

Respond with ONLY valid JSON:
{
  "title": string,
  "slug": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": string[],
  "description": string,
  "examples": [
    { "input": string, "output": string, "explanation": string }
  ],
  "constraints": string[],
  "starterCode": {
    "python": string,
    "java": string,
    "cpp": string
  },
  "dataStructureType": "tree" | "bst" | "graph" | "linked_list" | "array" | "matrix" | "recursion"
}`;

  const messages = [
    { role: 'system', content: 'Respond with valid, raw JSON only without markdown explanation.' },
    { role: 'user', content: prompt }
  ];

  const raw = await callOpenRouter(messages, true, 1500);
  return normalizeProblem(raw, query);
}

export async function diagnoseExecutionError(
  problem: ProblemContext,
  code: string,
  language: Language,
  actualOutput?: string,
  runtimeError?: string
): Promise<{
  errorClassification: {
    type: 'syntax' | 'semantic' | 'logical' | 'none';
    title: string;
    description: string;
    line?: number;
    fixRecommendation?: string;
    expectedOutput?: string;
    actualOutput?: string;
  };
  suggestedFixCode?: string;
}> {
  const expectedOutput = problem.examples[0]?.output || '';

  const prompt = `You are a code debugger and error diagnostic expert.
Analyze the following LeetCode solution for bugs, syntax errors, runtime crashes, or logical mistakes.

PROBLEM:
Title: ${problem.title}
Expected Output: ${expectedOutput}
Actual Output / Error: ${runtimeError || actualOutput || 'Wrong output or runtime issue'}

USER CODE (${language.toUpperCase()}):
\`\`\`${language}
${code}
\`\`\`

INSTRUCTIONS:
1. Classify the error type:
   - 'syntax': Compiler or parsing error.
   - 'semantic': Runtime crash / null pointer / index out of bounds.
   - 'logical': Runs without crashing, but output differs from expected output.
   - 'none': Code is completely correct.

2. Return ONLY valid JSON matching this schema:
{
  "errorClassification": {
    "type": "syntax" | "semantic" | "logical" | "none",
    "title": "Short concise error title",
    "description": "Clear explanation of why it failed and what went wrong",
    "line": 1,
    "fixRecommendation": "Direct step-by-step recommendation to fix",
    "expectedOutput": "${expectedOutput}",
    "actualOutput": "${actualOutput || runtimeError || ''}"
  },
  "suggestedFixCode": "Full corrected code here"
}`;

  const messages = [
    { role: 'system', content: 'Respond with valid, raw JSON only without markdown commentary.' },
    { role: 'user', content: prompt }
  ];

  try {
    const raw = await callOpenRouter(messages, true, 1500);
    return {
      errorClassification: {
        type: (['syntax', 'semantic', 'logical', 'none'].includes(raw?.errorClassification?.type) ? raw.errorClassification.type : 'logical') as any,
        title: raw?.errorClassification?.title || 'Execution Bug Detected',
        description: raw?.errorClassification?.description || 'Code encountered a logical or runtime issue.',
        line: raw?.errorClassification?.line,
        fixRecommendation: raw?.errorClassification?.fixRecommendation,
        expectedOutput: raw?.errorClassification?.expectedOutput || expectedOutput,
        actualOutput: raw?.errorClassification?.actualOutput || actualOutput || '',
      },
      suggestedFixCode: raw?.suggestedFixCode || undefined,
    };
  } catch (err: any) {
    return {
      errorClassification: {
        type: 'logical',
        title: 'Diagnostic Notice',
        description: `AI diagnostic error: ${err.message}`,
        expectedOutput,
        actualOutput: actualOutput || '',
      },
    };
  }
}

export async function analyzeAndTraceExecution(
  problem: ProblemContext,
  code: string,
  language: Language,
  customInput?: string
): Promise<ExecutionAnalysisResult> {
  const activeInput = customInput || problem.examples[0]?.input || 'default test case';
  const expectedOutput = problem.examples[0]?.output || '';

  const dsType = problem.dataStructureType || 'array';

  const prompt = `You are a code execution simulator and AST visualizer for LeetCode problems in Python, Java, and C++.

PROBLEM:
Title: ${problem.title}
Data Structure: ${dsType}
Test Input: ${activeInput}
Expected Output: ${expectedOutput}

USER CODE (${language.toUpperCase()}):
\`\`\`${language}
${code}
\`\`\`

INSTRUCTIONS:
1. Classify error:
   - 'syntax': Compiler/syntax error.
   - 'semantic': Runtime crash.
   - 'logical': Runs, but output is wrong.
   - 'none': Correct logic.

2. Step-by-step Execution Trace:
   - Provide 6 to 12 clear execution steps covering each loop iteration and transformation.
   - For EACH step, MUST populate the matching data structure state for "${dsType}":
     * If "${dsType}" is "array": populate "arrayState" with [{ "index": 0, "val": 1, "pointers": ["i"], "status": "active" }] showing array values and pointer badges.
     * If "${dsType}" is "tree" or "bst": populate "treeState" with { id, val, pointers, status, left, right }.
     * If "${dsType}" is "linked_list": populate "linkedListState" with [{ id, val, pointers, status }].
     * If "${dsType}" is "graph": populate "graphState" with { nodes, edges }.
     * If "${dsType}" is "matrix": populate "matrixState" with { rows, cols, grid: [[{ val, status, pointers }]] }.
   - Always populate "variables" with active local variable values (e.g. { "i": 3, "k": 3, "nums": [1,2,3,4,5,6,7] }).

3. Return ONLY valid JSON matching this schema:
{
  "errorClassification": {
    "type": "syntax" | "semantic" | "logical" | "none",
    "title": "Short title",
    "description": "Clear error description",
    "line": 1,
    "fixRecommendation": "How to fix",
    "expectedOutput": "${expectedOutput}",
    "actualOutput": "Actual output"
  },
  "isExecutable": true,
  "totalSteps": 5,
  "summary": "Brief execution summary",
  "steps": [
    {
      "step": 1,
      "line": 4,
      "explanation": "Brief description of action",
      "variables": { "i": 0, "k": 3, "nums": [1,2,3,4,5,6,7] },
      "callStack": [{ "functionName": "rotate", "args": {}, "depth": 1 }],
      "treeState": null,
      "graphState": null,
      "linkedListState": null,
      "arrayState": [
        { "index": 0, "val": 1, "pointers": ["i"], "status": "active" }
      ],
      "matrixState": null,
      "stdout": null,
      "returnValue": null
    }
  ]
}`;

  const messages = [
    { role: 'system', content: 'Respond with valid, raw JSON only without markdown explanation.' },
    { role: 'user', content: prompt }
  ];

  const raw = await callOpenRouter(messages, true, 3000);
  return normalizeTraceResult(raw, expectedOutput);
}
