import type { ExecutionAnalysisResult, Language, ProblemContext } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'google/gemini-2.5-flash';

export function getApiKey(): string {
  return localStorage.getItem('visualcode_openrouter_key') || (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('visualcode_openrouter_key', key.trim());
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
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Received empty response from OpenRouter AI.');
  }

  if (jsonMode) {
    try {
      return JSON.parse(content);
    } catch {
      // Fallback: extract JSON from markdown block if wrapped
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]);
      }
      throw new Error('Failed to parse AI structured response as JSON.');
    }
  }

  return content;
}

export async function fetchLeetCodeProblem(query: string): Promise<ProblemContext> {
  const prompt = `You are a LeetCode problem scraper and data structures expert.
Given the user query (which can be a problem title like "Validate Binary Search Tree", a problem number like "98", a slug like "validate-binary-search-tree", or a brief concept), return the complete structured problem context.

Query: "${query}"

Respond with ONLY a JSON object matching this TypeScript structure:
{
  "title": string, // e.g. "98. Validate Binary Search Tree"
  "slug": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": string[], // e.g. ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"]
  "description": string, // Detailed markdown description of the problem with clear problem rules
  "examples": [
    {
      "input": string, // e.g. "root = [2,1,3]"
      "output": string, // e.g. "true"
      "explanation": string // optional explanation
    }
  ],
  "constraints": string[], // e.g. ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"]
  "starterCode": {
    "python": string, // Standard LeetCode class Solution and helper TreeNode/ListNode definition comments
    "java": string,   // Standard LeetCode class Solution with TreeNode/ListNode class comments
    "cpp": string     // Standard LeetCode class Solution with TreeNode/ListNode struct comments
  },
  "dataStructureType": "tree" | "bst" | "graph" | "linked_list" | "array" | "matrix" | "recursion"
}`;

  const messages = [
    { role: 'system', content: 'You generate exact, authentic LeetCode problem specifications in JSON format.' },
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

  const prompt = `You are a world-class code execution engine, compiler, and data structure visualizer for LeetCode problems in Python, Java, and C++.

PROBLEM:
Title: ${problem.title}
Data Structure: ${problem.dataStructureType}
Description: ${problem.description}
Test Input to Execute: ${activeInput}
Expected Output: ${expectedOutput}

USER IMPLEMENTATION (${language.toUpperCase()}):
\`\`\`${language}
${code}
\`\`\`

YOUR TASKS:
1. CLASSIFY THE ERROR into one of 4 types:
   - 'syntax': The code has compiler errors, invalid syntax, missing semicolons/parentheses/colons/keywords, or invalid language constructs.
   - 'semantic': The code compiles, but crashes during execution due to runtime issues (e.g. NullPointerException, segmentation fault, dereferencing None/null/nullptr, array out of bounds, division by zero, stack overflow/infinite recursion without base case).
   - 'logical': The code runs to completion without crashing, but produces an INCORRECT return value, bad mutation, or wrong logic compared to what the problem requires.
   - 'none': The code is completely correct and produces the exact expected output.

2. IF SYNTAX ERROR:
   - Set "isExecutable": false
   - Provide "errorClassification": { "type": "syntax", "title": "Syntax Error", "description": "exact details of what failed to parse", "line": line_number_if_known, "fixRecommendation": "how to fix it" }
   - "steps": []

3. IF SEMANTIC / LOGICAL / NONE (Executable):
   - Set "isExecutable": true
   - Trace step-by-step what the code ACTUALLY DOES on the given test input: "${activeInput}".
   - Generate a detailed list of execution steps (between 5 to 30 steps showing key transitions, loops, recursive calls, pointer updates, and return values).
   - Even if the code is WRONG or buggy, faithfully reflect the buggy state of the data structures as the code executes!
   - For each step, include:
     - "step": 1, 2, ...
     - "line": line number in user code currently executing (1-indexed)
     - "explanation": clear, beginner-friendly sentence of what is happening on this line (e.g., "Checking if root (val: 5) is null", "Updating curr.left pointer to node 3", "Pushing node (val: 2) onto call stack", "Returning false because 5 <= 5 violates strict BST property").
     - "variables": map of current variable names and values (e.g. {"root": 5, "minVal": "-Infinity", "maxVal": 5, "res": false})
     - "callStack": array of active frames: [{ "functionName": "isValidBST", "args": {"val": 5, "min": "-inf", "max": "inf"}, "depth": 1, "status": "running" }]
     - Data Structure Visual State (fill the one that matches '${problem.dataStructureType}'):
       - If 'tree' or 'bst': "treeState": {
           "id": "1", "val": 2, "pointers": ["root", "curr"], "status": "active" | "visited" | "modified" | "inserted" | "deleted" | "target" | "default",
           "left": { "id": "2", "val": 1, "pointers": ["p"], "status": "visited", "left": null, "right": null },
           "right": { "id": "3", "val": 3, "pointers": [], "status": "default", "left": null, "right": null }
         }
       - If 'graph': "graphState": { "nodes": [{"id": "0", "label": "0", "status": "active", "pointers": ["u"]}], "edges": [{"id": "0-1", "source": "0", "target": "1", "status": "active", "isDirected": true}] }
       - If 'linked_list': "linkedListState": [{"id": "node-1", "val": 1, "nextId": "node-2", "pointers": ["head", "curr"], "status": "active"}]
       - If 'array' or 'matrix': "arrayState": [{"index": 0, "val": 2, "pointers": ["left", "i"], "status": "active"}]
     - "stdout": string or null
     - "returnValue": return value if returned on this step

4. Provide final error classification with actual vs expected output and fix recommendation.

RETURN ONLY VALID JSON matching:
{
  "errorClassification": {
    "type": "syntax" | "semantic" | "logical" | "none",
    "title": string,
    "description": string,
    "line": number (or null),
    "fixRecommendation": string,
    "expectedOutput": "${expectedOutput}",
    "actualOutput": string
  },
  "isExecutable": boolean,
  "totalSteps": number,
  "summary": string,
  "steps": [
    {
      "step": number,
      "line": number,
      "explanation": string,
      "variables": object,
      "callStack": array,
      "treeState": object or null,
      "graphState": object or null,
      "linkedListState": array or null,
      "arrayState": array or null,
      "matrixState": object or null,
      "stdout": string or null,
      "returnValue": any
    }
  ]
}`;

  const messages = [
    { role: 'system', content: 'You are an accurate code tracer and AST step-by-step visual execution simulator.' },
    { role: 'user', content: prompt }
  ];

  return await callOpenRouter(messages, true);
}
