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

  // 1. Direct standard parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Extract content between markdown code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const targetStr = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

  try {
    return JSON.parse(targetStr);
  } catch {}

  // 3. Use dedicated jsonrepair library for unescaped characters, trailing commas, missing quotes/brackets
  try {
    const repaired = jsonrepair(targetStr);
    return JSON.parse(repaired);
  } catch (err1) {
    // 4. Substring slicing from first '{' to last '}'
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

async function callOpenRouter(messages: { role: string; content: string }[], jsonMode = true): Promise<any> {
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
      max_tokens: 6000,
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
Given the user query (which can be a problem title like "Validate Binary Search Tree", a problem number like "98", a slug like "validate-binary-search-tree", or a concept), return the complete structured problem context.

Query: "${query}"

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

  return await callOpenRouter(messages, true);
}

export async function analyzeAndTraceExecution(
  problem: ProblemContext,
  code: string,
  language: Language,
  customInput?: string
): Promise<ExecutionAnalysisResult> {
  const activeInput = customInput || problem.examples[0]?.input || 'default test case';
  const expectedOutput = problem.examples[0]?.output || '';

  const prompt = `You are a code execution simulator and AST visualizer for LeetCode problems in Python, Java, and C++.

PROBLEM:
Title: ${problem.title}
Data Structure: ${problem.dataStructureType}
Description: ${problem.description}
Test Input to Execute: ${activeInput}
Expected Output: ${expectedOutput}

USER CODE (${language.toUpperCase()}):
\`\`\`${language}
${code}
\`\`\`

INSTRUCTIONS:
1. Classify error type:
   - 'syntax': Unparseable, compiler/syntax errors, missing brackets/semicolons.
   - 'semantic': Crashes during runtime (e.g. NullPointerException, out of bounds, stack overflow).
   - 'logical': Runs without crashing, but output / state is incorrect.
   - 'none': Correct logic and produces expected output.

2. Step-by-step Execution Trace:
   - Provide between 4 to 15 concise key execution steps.
   - Trace variables, call stack, and data structure state on each step.
   - Keep string explanations clean and concise (1 sentence).

3. Return ONLY a valid JSON object in this format:
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
      "line": 16,
      "explanation": "Brief description of action",
      "variables": { "root": 1 },
      "callStack": [{ "functionName": "rightSideView", "args": { "root": 1 }, "depth": 1 }],
      "treeState": {
        "id": "1",
        "val": 1,
        "pointers": ["root", "curr"],
        "status": "active",
        "left": { "id": "2", "val": 2, "pointers": [], "status": "default", "left": null, "right": null },
        "right": { "id": "3", "val": 3, "pointers": [], "status": "default", "left": null, "right": null }
      },
      "graphState": null,
      "linkedListState": null,
      "arrayState": null,
      "matrixState": null,
      "stdout": null,
      "returnValue": null
    }
  ]
}`;

  const messages = [
    { role: 'system', content: 'You are a high-precision code tracer that always responds in valid, parsable JSON.' },
    { role: 'user', content: prompt }
  ];

  return await callOpenRouter(messages, true);
}
