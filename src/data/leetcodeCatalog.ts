export interface CatalogProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export const LEETCODE_POPULAR_CATALOG: CatalogProblem[] = [
  // Arrays & Hashing
  { id: 1, title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy', category: 'Array / Hash Table' },
  { id: 217, title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'Easy', category: 'Array / Hash Table' },
  { id: 242, title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy', category: 'String / Hash Table' },
  { id: 49, title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium', category: 'String / Hash Table' },
  { id: 347, title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium', category: 'Heap / Hash Table' },
  { id: 238, title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium', category: 'Array' },
  { id: 128, title: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', difficulty: 'Medium', category: 'Array / Hash Table' },
  { id: 189, title: 'Rotate Array', slug: 'rotate-array', difficulty: 'Medium', category: 'Array / Two Pointers' },
  { id: 53, title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium', category: 'Array / DP' },
  { id: 152, title: 'Maximum Product Subarray', slug: 'maximum-product-subarray', difficulty: 'Medium', category: 'Array / DP' },
  { id: 88, title: 'Merge Sorted Array', slug: 'merge-sorted-array', difficulty: 'Easy', category: 'Array / Two Pointers' },
  { id: 26, title: 'Remove Duplicates from Sorted Array', slug: 'remove-duplicates-from-sorted-array', difficulty: 'Easy', category: 'Array / Two Pointers' },
  { id: 27, title: 'Remove Element', slug: 'remove-element', difficulty: 'Easy', category: 'Array / Two Pointers' },

  // Two Pointers & Sliding Window
  { id: 125, title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy', category: 'Two Pointers' },
  { id: 167, title: 'Two Sum II - Input Array Is Sorted', slug: 'two-sum-ii-input-array-is-sorted', difficulty: 'Medium', category: 'Two Pointers' },
  { id: 15, title: '3Sum', slug: '3sum', difficulty: 'Medium', category: 'Two Pointers' },
  { id: 11, title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium', category: 'Two Pointers' },
  { id: 42, title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard', category: 'Two Pointers / Stack' },
  { id: 121, title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', category: 'Sliding Window' },
  { id: 3, title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', category: 'Sliding Window' },
  { id: 424, title: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', difficulty: 'Medium', category: 'Sliding Window' },
  { id: 76, title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard', category: 'Sliding Window' },

  // Stack
  { id: 20, title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy', category: 'Stack' },
  { id: 155, title: 'Min Stack', slug: 'min-stack', difficulty: 'Medium', category: 'Stack / Design' },
  { id: 150, title: 'Evaluate Reverse Polish Notation', slug: 'evaluate-reverse-polish-notation', difficulty: 'Medium', category: 'Stack' },
  { id: 739, title: 'Daily Temperatures', slug: 'daily-temperatures', difficulty: 'Medium', category: 'Monotonic Stack' },
  { id: 84, title: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram', difficulty: 'Hard', category: 'Monotonic Stack' },

  // Binary Search
  { id: 704, title: 'Binary Search', slug: 'binary-search', difficulty: 'Easy', category: 'Binary Search' },
  { id: 74, title: 'Search a 2D Matrix', slug: 'search-a-2d-matrix', difficulty: 'Medium', category: 'Binary Search' },
  { id: 875, title: 'Koko Eating Bananas', slug: 'koko-eating-bananas', difficulty: 'Medium', category: 'Binary Search' },
  { id: 33, title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium', category: 'Binary Search' },
  { id: 153, title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium', category: 'Binary Search' },
  { id: 4, title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard', category: 'Binary Search' },

  // Linked List
  { id: 206, title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy', category: 'Linked List' },
  { id: 21, title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy', category: 'Linked List' },
  { id: 141, title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy', category: 'Linked List' },
  { id: 142, title: 'Linked List Cycle II', slug: 'linked-list-cycle-ii', difficulty: 'Medium', category: 'Linked List' },
  { id: 143, title: 'Reorder List', slug: 'reorder-list', difficulty: 'Medium', category: 'Linked List' },
  { id: 19, title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium', category: 'Linked List' },
  { id: 138, title: 'Copy List with Random Pointer', slug: 'copy-list-with-random-pointer', difficulty: 'Medium', category: 'Linked List' },
  { id: 2, title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'Medium', category: 'Linked List' },
  { id: 146, title: 'LRU Cache', slug: 'lru-cache', difficulty: 'Medium', category: 'Linked List / Design' },
  { id: 23, title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'Hard', category: 'Heap / Linked List' },

  // Trees & BST
  { id: 226, title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy', category: 'Tree' },
  { id: 104, title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy', category: 'Tree / DFS' },
  { id: 543, title: 'Diameter of Binary Tree', slug: 'diameter-of-binary-tree', difficulty: 'Easy', category: 'Tree / DFS' },
  { id: 110, title: 'Balanced Binary Tree', slug: 'balanced-binary-tree', difficulty: 'Easy', category: 'Tree / DFS' },
  { id: 100, title: 'Same Tree', slug: 'same-tree', difficulty: 'Easy', category: 'Tree / DFS' },
  { id: 572, title: 'Subtree of Another Tree', slug: 'subtree-of-another-tree', difficulty: 'Easy', category: 'Tree / DFS' },
  { id: 235, title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', difficulty: 'Medium', category: 'Tree / BST' },
  { id: 102, title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium', category: 'Tree / BFS' },
  { id: 199, title: 'Binary Tree Right Side View', slug: 'binary-tree-right-side-view', difficulty: 'Medium', category: 'Tree / BFS' },
  { id: 98, title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium', category: 'Tree / BST' },
  { id: 230, title: 'Kth Smallest Element in a BST', slug: 'kth-smallest-element-in-a-bst', difficulty: 'Medium', category: 'Tree / BST' },
  { id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', difficulty: 'Medium', category: 'Tree' },
  { id: 124, title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', difficulty: 'Hard', category: 'Tree / DFS' },
  { id: 297, title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree', difficulty: 'Hard', category: 'Tree / Design' },
  { id: 700, title: 'Search in a Binary Search Tree', slug: 'search-in-a-binary-search-tree', difficulty: 'Easy', category: 'Tree / BST' },
  { id: 701, title: 'Insert into a Binary Search Tree', slug: 'insert-into-a-binary-search-tree', difficulty: 'Medium', category: 'Tree / BST' },

  // Graphs & Matrix
  { id: 200, title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium', category: 'Graph / Matrix' },
  { id: 133, title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium', category: 'Graph' },
  { id: 695, title: 'Max Area of Island', slug: 'max-area-of-island', difficulty: 'Medium', category: 'Graph / Matrix' },
  { id: 417, title: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', difficulty: 'Medium', category: 'Graph / Matrix' },
  { id: 130, title: 'Surrounded Regions', slug: 'surrounded-regions', difficulty: 'Medium', category: 'Graph / Matrix' },
  { id: 994, title: 'Rotting Oranges', slug: 'rotting-oranges', difficulty: 'Medium', category: 'Graph / BFS' },
  { id: 207, title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium', category: 'Graph / Topological Sort' },
  { id: 210, title: 'Course Schedule II', slug: 'course-schedule-ii', difficulty: 'Medium', category: 'Graph / Topological Sort' },
  { id: 73, title: 'Set Matrix Zeroes', slug: 'set-matrix-zeroes', difficulty: 'Medium', category: 'Matrix' },
  { id: 54, title: 'Spiral Matrix', slug: 'spiral-matrix', difficulty: 'Medium', category: 'Matrix' },
  { id: 48, title: 'Rotate Image', slug: 'rotate-image', difficulty: 'Medium', category: 'Matrix' },
  { id: 127, title: 'Word Ladder', slug: 'word-ladder', difficulty: 'Hard', category: 'Graph / BFS' },

  // Dynamic Programming
  { id: 70, title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy', category: 'Dynamic Programming' },
  { id: 746, title: 'Min Cost Climbing Stairs', slug: 'min-cost-climbing-stairs', difficulty: 'Easy', category: 'Dynamic Programming' },
  { id: 198, title: 'House Robber', slug: 'house-robber', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 213, title: 'House Robber II', slug: 'house-robber-ii', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 5, title: 'Longest Palindromic Substring', slug: 'longest-palindromic-substring', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 322, title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 300, title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 1143, title: 'Longest Common Subsequence', slug: 'longest-common-subsequence', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 62, title: 'Unique Paths', slug: 'unique-paths', difficulty: 'Medium', category: 'Dynamic Programming' },
  { id: 72, title: 'Edit Distance', slug: 'edit-distance', difficulty: 'Hard', category: 'Dynamic Programming' },

  // Backtracking
  { id: 78, title: 'Subsets', slug: 'subsets', difficulty: 'Medium', category: 'Backtracking' },
  { id: 39, title: 'Combination Sum', slug: 'combination-sum', difficulty: 'Medium', category: 'Backtracking' },
  { id: 46, title: 'Permutations', slug: 'permutations', difficulty: 'Medium', category: 'Backtracking' },
  { id: 79, title: 'Word Search', slug: 'word-search', difficulty: 'Medium', category: 'Backtracking' },
  { id: 131, title: 'Palindrome Partitioning', slug: 'palindrome-partitioning', difficulty: 'Medium', category: 'Backtracking' },
  { id: 51, title: 'N-Queens', slug: 'n-queens', difficulty: 'Hard', category: 'Backtracking' },

  // Intervals
  { id: 57, title: 'Insert Interval', slug: 'insert-interval', difficulty: 'Medium', category: 'Intervals' },
  { id: 56, title: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'Medium', category: 'Intervals' },
  { id: 435, title: 'Non-overlapping Intervals', slug: 'non-overlapping-intervals', difficulty: 'Medium', category: 'Intervals' },
  { id: 252, title: 'Meeting Rooms', slug: 'meeting-rooms', difficulty: 'Easy', category: 'Intervals' },
  { id: 253, title: 'Meeting Rooms II', slug: 'meeting-rooms-ii', difficulty: 'Medium', category: 'Intervals' },

  // Greedy
  { id: 55, title: 'Jump Game', slug: 'jump-game', difficulty: 'Medium', category: 'Greedy' },
  { id: 45, title: 'Jump Game II', slug: 'jump-game-ii', difficulty: 'Medium', category: 'Greedy' },
  { id: 134, title: 'Gas Station', slug: 'gas-station', difficulty: 'Medium', category: 'Greedy' },
  { id: 846, title: 'Hand of Straights', slug: 'hand-of-straights', difficulty: 'Medium', category: 'Greedy' },

  // Math & Bit Manipulation
  { id: 136, title: 'Single Number', slug: 'single-number', difficulty: 'Easy', category: 'Bit Manipulation' },
  { id: 191, title: 'Number of 1 Bits', slug: 'number-of-1-bits', difficulty: 'Easy', category: 'Bit Manipulation' },
  { id: 338, title: 'Counting Bits', slug: 'counting-bits', difficulty: 'Easy', category: 'Bit Manipulation' },
  { id: 268, title: 'Missing Number', slug: 'missing-number', difficulty: 'Easy', category: 'Bit Manipulation' },
  { id: 371, title: 'Sum of Two Integers', slug: 'sum-of-two-integers', difficulty: 'Medium', category: 'Bit Manipulation' },
  { id: 7, title: 'Reverse Integer', slug: 'reverse-integer', difficulty: 'Medium', category: 'Math' },
  { id: 9, title: 'Palindrome Number', slug: 'palindrome-number', difficulty: 'Easy', category: 'Math' },
  { id: 50, title: 'Pow(x, n)', slug: 'powx-n', difficulty: 'Medium', category: 'Math' },
  { id: 66, title: 'Plus One', slug: 'plus-one', difficulty: 'Easy', category: 'Array / Math' },
];

/**
 * Instant local search through pre-indexed catalog (0ms latency)
 */
export function searchCatalogInstantly(query: string, limit = 8): CatalogProblem[] {
  if (!query || !query.trim()) {
    return LEETCODE_POPULAR_CATALOG.slice(0, limit);
  }

  const q = query.trim().toLowerCase();
  const isNumber = /^\d+$/.test(q);

  return LEETCODE_POPULAR_CATALOG.filter((item) => {
    if (isNumber) {
      return String(item.id).startsWith(q) || String(item.id) === q;
    }
    return (
      item.title.toLowerCase().includes(q) ||
      item.slug.includes(q) ||
      item.category.toLowerCase().includes(q) ||
      String(item.id).includes(q)
    );
  }).slice(0, limit);
}
