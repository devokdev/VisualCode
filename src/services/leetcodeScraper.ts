import type { ProblemContext } from '../types';
import { fetchLeetCodeProblem as fetchLeetCodeViaAI } from './openrouter';

const LEETCODE_GRAPHQL_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    topicTags {
      name
      slug
    }
    codeSnippets {
      lang
      langSlug
      code
    }
    sampleTestCase
    exampleTestcaseList
  }
}
`;

const LEETCODE_SEARCH_QUERY = `
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    total: totalNum
    questions: data {
      frontendQuestionId: questionFrontendId
      title
      titleSlug
      difficulty
      topicTags {
        name
        slug
      }
    }
  }
}
`;

/**
 * Extracts a clean slug from a URL, number, or title string.
 */
export function extractSlugFromQuery(query: string): string {
  const trimmed = query.trim();

  // 1. If it's a full LeetCode URL: https://leetcode.com/problems/rotate-array/description/
  const urlMatch = trimmed.match(/leetcode\.com\/problems\/([^/]+)/i);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }

  // 2. If it's formatted like "189. Rotate Array"
  const numberedTitleMatch = trimmed.match(/^\d+\.\s*(.+)$/);
  if (numberedTitleMatch) {
    return numberedTitleMatch[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // 3. Clean string into slug
  return trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Strips HTML tags and extracts text + examples + constraints from LeetCode raw HTML content
 */
export function parseLeetCodeContent(html: string): {
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
} {
  if (!html) {
    return { description: '', examples: [], constraints: [] };
  }

  // 1. Extract examples from <pre> blocks or Example headers
  const examples: { input: string; output: string; explanation?: string }[] = [];

  // Match <pre>...</pre> content in HTML
  const preMatches = html.match(/<pre>([\s\S]*?)<\/pre>/gi) || [];
  for (const pre of preMatches) {
    const text = pre.replace(/<[^>]+>/g, '').trim();

    // Input: nums = [1,2,3], k = 3 \n Output: [5,6,7,1,2,3,4]
    const inputMatch = text.match(/Input:\s*([\s\S]*?)(?=Output:|$)/i);
    const outputMatch = text.match(/Output:\s*([\s\S]*?)(?=Explanation:|$)/i);
    const explMatch = text.match(/Explanation:\s*([\s\S]*?)$/i);

    if (inputMatch && outputMatch) {
      examples.push({
        input: inputMatch[1].trim(),
        output: outputMatch[1].trim(),
        explanation: explMatch ? explMatch[1].trim() : undefined,
      });
    }
  }

  // 2. Extract Constraints
  const constraints: string[] = [];
  const constraintsMatch = html.match(/<strong[^>]*>Constraints:<\/strong>([\s\S]*?)(?:<\/ul>|$)/i);
  if (constraintsMatch) {
    const liMatches = constraintsMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    for (const li of liMatches) {
      const cleanLi = li.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&le;/g, '≤').replace(/&ge;/g, '≥').trim();
      if (cleanLi) constraints.push(cleanLi);
    }
  }

  // 3. Clean full text description
  let description = html
    .replace(/<pre>[\s\S]*?<\/pre>/gi, '') // Remove pre blocks from main description
    .replace(/<strong class="example">[\s\S]*?<\/strong>/gi, '')
    .replace(/<p>&nbsp;<\/p>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  // If description cut off too much, fallback to plain text stripping
  if (description.length < 20) {
    description = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return { description, examples, constraints };
}

/**
 * Infer primary data structure type from tags, problem title, and content
 */
export function inferDataStructureType(
  title: string,
  tags: string[],
  content: string
): 'tree' | 'bst' | 'graph' | 'linked_list' | 'array' | 'matrix' | 'recursion' {
  const lower = `${title} ${tags.join(' ')} ${content}`.toLowerCase();

  if (lower.includes('bst') || lower.includes('binary search tree')) return 'bst';
  if (lower.includes('binary tree') || lower.includes('treenode') || lower.includes('tree')) return 'tree';
  if (lower.includes('linked list') || lower.includes('listnode')) return 'linked_list';
  if (lower.includes('graph') || lower.includes('islands') || lower.includes('bfs') || lower.includes('dfs')) return 'graph';
  if (lower.includes('matrix') || lower.includes('2d grid') || lower.includes('board')) return 'matrix';
  return 'array';
}

/**
 * Sends GraphQL query using Vite proxy or direct fallback
 */
async function sendLeetCodeGraphQL(query: string, variables: Record<string, any>): Promise<any> {
  const endpoints = [
    '/api/leetcode/graphql', // Local proxy via vite.config.ts (Zero CORS issues in dev)
    'https://leetcode.com/graphql', // Direct endpoint
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        body: JSON.stringify({ query, variables }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && !json.errors) {
          return json.data;
        }
      }
    } catch (e) {
      // Continue to next endpoint
    }
  }

  throw new Error('Could not connect to LeetCode GraphQL API');
}

export interface LeetCodeSearchResult {
  id: string | number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category?: string;
  tags?: string[];
}

/**
 * Searches LeetCode GraphQL in real-time for live autocomplete suggestions
 */
export async function searchLeetCodeLive(keyword: string): Promise<LeetCodeSearchResult[]> {
  if (!keyword || !keyword.trim()) return [];

  try {
    const data = await sendLeetCodeGraphQL(LEETCODE_SEARCH_QUERY, {
      categorySlug: '',
      limit: 8,
      skip: 0,
      filters: { searchKeywords: keyword.trim() },
    });

    const questions = data?.problemsetQuestionList?.questions;
    if (questions && Array.isArray(questions)) {
      return questions.map((q: any) => ({
        id: q.frontendQuestionId || '',
        title: q.title,
        slug: q.titleSlug,
        difficulty: (['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium') as any,
        tags: Array.isArray(q.topicTags) ? q.topicTags.map((t: any) => t.name) : [],
        category: q.topicTags?.[0]?.name || 'Algorithm',
      }));
    }
  } catch (err) {
    console.warn('Live search failed:', err);
  }

  return [];
}

/**
 * Search LeetCode to find the exact titleSlug for numbers or keyword searches
 */
async function searchLeetCodeSlug(keyword: string): Promise<string> {
  try {
    const liveResults = await searchLeetCodeLive(keyword);
    if (liveResults && liveResults.length > 0) {
      const exactMatch = liveResults.find(
        (q) =>
          String(q.id) === keyword.trim() ||
          q.title.toLowerCase() === keyword.toLowerCase().trim() ||
          q.slug === extractSlugFromQuery(keyword)
      );
      return exactMatch ? exactMatch.slug : liveResults[0].slug;
    }
  } catch (err) {
    console.warn('LeetCode search fallback to direct slug:', err);
  }

  return extractSlugFromQuery(keyword);
}

/**
 * Scrapes and fetches the complete official LeetCode problem data directly.
 */
export async function scrapeLeetCodeProblem(query: string): Promise<ProblemContext> {
  const trimmed = query.trim();
  let targetSlug = extractSlugFromQuery(trimmed);

  // If query is a number (e.g. "189" or "1") or words without hyphens, perform GraphQL search
  if (/^\d+$/.test(trimmed) || (!trimmed.includes('-') && trimmed.includes(' '))) {
    targetSlug = await searchLeetCodeSlug(trimmed);
  }

  try {
    const data = await sendLeetCodeGraphQL(LEETCODE_GRAPHQL_QUERY, { titleSlug: targetSlug });
    const q = data?.question;

    if (!q || !q.title) {
      throw new Error(`Problem "${targetSlug}" not found on LeetCode.`);
    }

    // Extract starter code snippets for Python, Java, C++
    const starterCode = {
      python: q.codeSnippets?.find((s: any) => s.langSlug === 'python3' || s.langSlug === 'python')?.code || '# Write solution here\nclass Solution:\n    pass\n',
      java: q.codeSnippets?.find((s: any) => s.langSlug === 'java')?.code || '// Write solution here\nclass Solution {\n}\n',
      cpp: q.codeSnippets?.find((s: any) => s.langSlug === 'cpp')?.code || '// Write solution here\nclass Solution {\n};\n',
    };

    // Extract tag names
    const tags = Array.isArray(q.topicTags) ? q.topicTags.map((t: any) => t.name) : ['Algorithm'];

    // Parse HTML content
    const parsed = parseLeetCodeContent(q.content || '');

    // If sample test cases exist in GraphQL, incorporate them into examples
    let examples = parsed.examples;
    if ((!examples || examples.length === 0) && q.sampleTestCase) {
      examples = [
        {
          input: q.sampleTestCase.replace(/\n/g, ', '),
          output: '',
          explanation: '',
        },
      ];
    } else if ((!examples || examples.length === 0) && q.exampleTestcaseList && q.exampleTestcaseList.length > 0) {
      examples = q.exampleTestcaseList.map((testStr: string) => ({
        input: testStr.replace(/\n/g, ', '),
        output: '',
      }));
    }

    const dataStructureType = inferDataStructureType(q.title, tags, q.content || '');

    return {
      title: `${q.questionFrontendId ? `${q.questionFrontendId}. ` : ''}${q.title}`,
      slug: q.titleSlug,
      difficulty: q.difficulty || 'Medium',
      tags,
      description: parsed.description,
      examples: examples.length > 0 ? examples : [{ input: 'nums = [1,2,3,4,5], k = 2', output: '[4,5,1,2,3]' }],
      constraints: parsed.constraints,
      starterCode,
      dataStructureType,
    };
  } catch (directErr: any) {
    console.warn(`Direct LeetCode scraping failed (${directErr.message}), falling back to AI scraper...`);
    // Safe fallback to OpenRouter AI scraper
    return await fetchLeetCodeViaAI(query);
  }
}
