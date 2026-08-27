import { jsonrepair } from 'jsonrepair';
import type { ExecutionAnalysisResult, Language, ProblemContext } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 100% Free / Ultra-Low-Credit Models:
// Models with :free suffix or extremely low cost per token (Qwen, Llama 3, DeepSeek, Gemma)
const MODELS_PRIORITY = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'google/gemini-2.0-flash-lite-001',
  'deepseek/deepseek-chat',
  'mistralai/mistral-small-24b-instruct-2501:free',
];

export function getApiKey(): string {
  return localStorage.getItem('visualcode_openrouter_key') || (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('visualcode_openrouter_key', key.trim());
}

function parseAndRepairJson(rawContent: string): any {
  const trimmed = rawContent.trim();

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

  return await callOpenRouter(messages, true, 800);
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
   - Provide 4 to 6 concise key execution steps.
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

  return await callOpenRouter(messages, true, 800);
}
