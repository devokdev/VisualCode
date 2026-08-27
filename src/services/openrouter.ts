import { jsonrepair } from 'jsonrepair';
import type { ExecutionAnalysisResult, Language, ProblemContext } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'google/gemini-2.5-flash';

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

async function callOpenRouter(messages: { role: string; content: string }[], jsonMode = true, maxTokens = 2800): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing API Key. Please click the "API Key" button at the top right to configure your OpenRouter API Key.');
  }
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://visualcode.dev',
      'X-Title': 'VisualCode AI Visualizer',
    },
    body: JSON.stringify({
      model: PRIMARY_MODEL,
      messages,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Received empty response from OpenRouter AI.');
  }

  if (jsonMode) {
    return parseAndRepairJson(rawContent);
  }

  return rawContent;
}

export async function fetchLeetCodeProblem(query: string): Promise<ProblemContext> {
  const prompt = `You are a LeetCode problem scraper and data structures expert.
Given the user query (which can be a problem title like "Rotate Array", a problem number like "189", or a concept), return the complete structured problem context.

Query: "${query}"

CRITICAL RULE FOR dataStructureType:
- If the problem involves arrays, lists, rotations, two pointers, sliding window, sorting, prefix sums: set "dataStructureType": "array"
- If tree/BST: "tree" | "bst"
- If graph/BFS/DFS on graph: "graph"
- If linked list: "linked_list"
- If 2D grid/matrix: "matrix"

Respond with ONLY a valid JSON object matching this TypeScript structure:
{
  "title": string,
  "slug": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": string[],
  "description": string,
  "examples": [
    {
      "input": string,
      "output": string,
      "explanation": string
    }
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
    { role: 'system', content: 'You generate exact LeetCode problem specifications in clean JSON format.' },
    { role: 'user', content: prompt }
  ];

  return await callOpenRouter(messages, true, 1800);
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
Description: ${problem.description}
Test Input to Execute: ${activeInput}
Expected Output: ${expectedOutput}

USER CODE (${language.toUpperCase()}):
\`\`\`${language}
${code}
\`\`\`

INSTRUCTIONS:
1. Classify error type:
   - 'syntax': Compiler/syntax error, missing semicolons/brackets.
   - 'semantic': Runtime crashes (NullPointerException, out of bounds, infinite loop).
   - 'logical': Runs cleanly, but output/state is incorrect.
   - 'none': Correct logic and passes expected output.

2. Step-by-step Execution Trace:
   - Provide 4 to 12 concise key execution steps.
   - For EACH step, MUST populate the matching data structure state for "${dsType}":
     * If "${dsType}" is "array": you MUST populate "arrayState" as an array of objects: [{ "index": 0, "val": 1, "pointers": ["i"], "status": "active" }, { "index": 1, "val": 2, "pointers": [], "status": "default" }] showing the current array values and where any pointers/indices (i, j, k, left, right) are.
     * If "${dsType}" is "tree" or "bst": populate "treeState" with { id, val, pointers, status, left, right }.
     * If "${dsType}" is "linked_list": populate "linkedListState" with [{ id, val, pointers, status }].
     * If "${dsType}" is "graph": populate "graphState" with { nodes, edges }.
     * If "${dsType}" is "matrix": populate "matrixState" with { rows, cols, grid: [[{ val, status, pointers }]] }.
   - Always populate "variables" with active local variable values (e.g. { "i": 3, "k": 3 }).

3. Return ONLY a valid JSON object matching this schema:
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
      "variables": { "i": 0, "k": 3 },
      "callStack": [{ "functionName": "rotate", "args": {}, "depth": 1 }],
      "treeState": null,
      "graphState": null,
      "linkedListState": null,
      "arrayState": [
        { "index": 0, "val": 1, "pointers": ["i"], "status": "active" },
        { "index": 1, "val": 2, "pointers": [], "status": "default" }
      ],
      "matrixState": null,
      "stdout": null,
      "returnValue": null
    }
  ]
}`;

  const messages = [
    { role: 'system', content: 'You are a high-precision code tracer that always returns valid JSON and always populates arrayState, treeState, or graphState according to the problem dataStructureType.' },
    { role: 'user', content: prompt }
  ];

  return await callOpenRouter(messages, true, 2800);
}
