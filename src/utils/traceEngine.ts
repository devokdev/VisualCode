export interface ArrayElement {
  value: number | string;
  index: number;
  isActive?: boolean;
  isVisited?: boolean;
  isCompared?: boolean;
  isSorted?: boolean;
  pointer?: string; // e.g. "i", "low", "high", "mid"
}

export interface TraceStep {
  stepIndex: number;
  line: number;
  description: string;
  variables: Record<string, string>;
  array?: ArrayElement[];
  hashmap?: Record<string, string>;
  callStack: string[];
  output: string;
  controlFlow: string[]; // List of executed block labels or steps
  highlights?: {
    arrayIndices?: number[];
    hashmapKeys?: string[];
    activeNodeVal?: any;
  };
  linkedList?: any;
  binaryTree?: any;
  matrix?: any;
}

export interface Algorithm {
  id: string;
  name: string;
  description: string;
  defaultInputs: Record<string, any>;
  code: {
    python: string;
    java: string;
    cpp: string;
  };
}

export const ALGORITHMS: Record<string, Algorithm> = {
  twoSum: {
    id: "twoSum",
    name: "Two Sum",
    description: "Find two numbers in an array that add up to a specific target.",
    defaultInputs: {
      nums: [2, 7, 11, 15],
      target: 9,
    },
    code: {
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

nums = [2, 7, 11, 15]
target = 9
result = twoSum(nums, target)
print(result)`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
    },
  },
  binarySearch: {
    id: "binarySearch",
    name: "Binary Search",
    description: "Search a sorted array by repeatedly dividing the search interval in half.",
    defaultInputs: {
      arr: [1, 3, 5, 7, 9, 11, 13, 15],
      target: 7,
    },
    code: {
      python: `def binarySearch(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        val = arr[mid]
        if val == target:
            return mid
        elif val < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binarySearch(arr, target)
print(result)`,
      java: `class BinarySearch {
    public int search(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }
}`,
      cpp: `int binarySearch(vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    },
  },
  bubbleSort: {
    id: "bubbleSort",
    name: "Bubble Sort",
    description: "Repeatedly swap adjacent elements if they are in the wrong order.",
    defaultInputs: {
      arr: [5, 1, 4, 2, 8],
    },
    code: {
      python: `def bubbleSort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

arr = [5, 1, 4, 2, 8]
bubbleSort(arr)
print(arr)`,
      java: `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
    },
  },
  fibonacci: {
    id: "fibonacci",
    name: "Fibonacci (Recursion Tree)",
    description: "Compute the nth Fibonacci number recursively, visualizing the call stack.",
    defaultInputs: {
      n: 4,
    },
    code: {
      python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

n = 4
result = fib(n)
print(result)`,
      java: `int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}`,
      cpp: `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`,
    },
  },
};

export function generateTrace(
  algorithmId: string,
  inputs: Record<string, any>
): TraceStep[] {
  const steps: TraceStep[] = [];

  const addStep = (
    line: number,
    description: string,
    variables: Record<string, string>,
    array?: ArrayElement[],
    hashmap?: Record<string, string>,
    callStack: string[] = [],
    output: string = "",
    controlFlow: string[] = [],
    highlights?: { arrayIndices?: number[]; hashmapKeys?: string[] }
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      line,
      description,
      variables: { ...variables },
      array: array ? JSON.parse(JSON.stringify(array)) : undefined,
      hashmap: hashmap ? { ...hashmap } : undefined,
      callStack: [...callStack],
      output,
      controlFlow: [...controlFlow],
      highlights,
    });
  };

  if (algorithmId === "twoSum") {
    const nums: number[] = inputs.nums || [2, 7, 11, 15];
    const target: number = inputs.target || 9;

    let seen: Record<number, number> = {};
    const arrayState = (): ArrayElement[] =>
      nums.map((val, idx) => ({ value: val, index: idx }));

    const stack = ["twoSum()"];
    const flow = [
      "twoSum(nums, target)",
      "seen = {}",
      "for i, num in enumerate(nums)",
    ];

    // Step 1: Initial state inside twoSum
    addStep(
      1,
      "Function call: twoSum(nums, target)",
      { nums: `[${nums.join(", ")}]`, target: target.toString() },
      arrayState(),
      undefined,
      stack,
      "",
      [flow[0]]
    );

    // Step 2: Initialize seen hashmap
    addStep(
      2,
      "Initialize empty seen hashmap: seen = {}",
      { nums: `[${nums.join(", ")}]`, target: target.toString(), seen: "{}" },
      arrayState(),
      {},
      stack,
      "",
      [flow[0], flow[1]]
    );

    let found = false;
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      const complement = target - num;
      const seenStr = `{${Object.entries(seen)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")}}`;

      const arrWithPointer = arrayState();
      arrWithPointer[i].pointer = `i = ${i}`;
      arrWithPointer[i].isActive = true;

      // Step 3: Loop iteration
      addStep(
        3,
        `Loop: i = ${i}, num = ${num}`,
        {
          nums: `[${nums.join(", ")}]`,
          target: target.toString(),
          seen: seenStr,
          i: i.toString(),
          num: num.toString(),
        },
        arrWithPointer,
        { ...seen } as any,
        stack,
        "",
        [...flow, `i = ${i}, num = ${num}`]
      );

      // Step 4: Calculate complement
      addStep(
        4,
        `Calculate complement = target - num = ${target} - ${num} = ${complement}`,
        {
          nums: `[${nums.join(", ")}]`,
          target: target.toString(),
          seen: seenStr,
          i: i.toString(),
          num: num.toString(),
          complement: complement.toString(),
        },
        arrWithPointer,
        { ...seen } as any,
        stack,
        "",
        [...flow, `complement = ${complement}`]
      );

      // Step 5: Check in seen
      const hasComplement = seen[complement] !== undefined;
      addStep(
        5,
        `Check if complement ${complement} is in seen: ${hasComplement}`,
        {
          nums: `[${nums.join(", ")}]`,
          target: target.toString(),
          seen: seenStr,
          i: i.toString(),
          num: num.toString(),
          complement: complement.toString(),
        },
        arrWithPointer,
        { ...seen } as any,
        stack,
        "",
        [...flow, `Check complement in seen (${hasComplement})`],
        hasComplement
          ? {
              arrayIndices: [seen[complement], i],
              hashmapKeys: [complement.toString()],
            }
          : undefined
      );

      if (hasComplement) {
        // Step 6: Return match
        const result = [seen[complement], i];
        addStep(
          6,
          `Match found! Return index pair: [${seen[complement]}, ${i}]`,
          {
            nums: `[${nums.join(", ")}]`,
            target: target.toString(),
            seen: seenStr,
            i: i.toString(),
            num: num.toString(),
            complement: complement.toString(),
            result: `[${result.join(", ")}]`,
          },
          arrWithPointer,
          { ...seen } as any,
          stack,
          `[${result.join(", ")}]`,
          [...flow, `Return [${result.join(", ")}]`]
        );
        found = true;
        break;
      }

      // Step 7: Add to seen
      seen[num] = i;
      const updatedSeenStr = `{${Object.entries(seen)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")}}`;
      addStep(
        7,
        `Insert seen[${num}] = ${i}`,
        {
          nums: `[${nums.join(", ")}]`,
          target: target.toString(),
          seen: updatedSeenStr,
          i: i.toString(),
          num: num.toString(),
          complement: complement.toString(),
        },
        arrWithPointer,
        { ...seen } as any,
        stack,
        "",
        [...flow, `seen[${num}] = ${i}`],
        { hashmapKeys: [num.toString()] }
      );
    }

    if (!found) {
      // Step 8: Return empty
      addStep(
        8,
        "No matching pair found. Return empty list []",
        {
          nums: `[${nums.join(", ")}]`,
          target: target.toString(),
          seen: `{${Object.entries(seen)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}}`,
          result: "[]",
        },
        arrayState(),
        { ...seen } as any,
        stack,
        "[]",
        [...flow, "Return []"]
      );
    }
  } else if (algorithmId === "binarySearch") {
    const arr: number[] = inputs.arr || [1, 3, 5, 7, 9, 11, 13, 15];
    const target: number = inputs.target || 7;

    let low = 0;
    let high = arr.length - 1;
    const arrayState = (l: number, h: number, m?: number): ArrayElement[] => {
      return arr.map((val, idx) => {
        let pointer = "";
        if (idx === l) pointer += "low";
        if (idx === h) pointer += (pointer ? " & " : "") + "high";
        if (idx === m) pointer += (pointer ? " & " : "") + "mid";

        return {
          value: val,
          index: idx,
          isActive: idx === m,
          isVisited: idx >= l && idx <= h,
          pointer: pointer || undefined,
        };
      });
    };

    const stack = ["binarySearch()"];

    addStep(
      1,
      "Function call: binarySearch(arr, target)",
      { arr: `[${arr.join(", ")}]`, target: target.toString() },
      arr.map((val, idx) => ({ value: val, index: idx })),
      undefined,
      stack,
      "",
      ["binarySearch(arr, target)"]
    );

    addStep(
      2,
      `Initialize low index: low = 0`,
      { arr: `[${arr.join(", ")}]`, target: target.toString(), low: "0" },
      arrayState(0, arr.length - 1),
      undefined,
      stack,
      "",
      ["low = 0"]
    );

    addStep(
      3,
      `Initialize high index: high = ${arr.length - 1}`,
      {
        arr: `[${arr.join(", ")}]`,
        target: target.toString(),
        low: "0",
        high: (arr.length - 1).toString(),
      },
      arrayState(0, arr.length - 1),
      undefined,
      stack,
      "",
      ["low = 0", `high = ${arr.length - 1}`]
    );

    let foundIdx = -1;
    while (low <= high) {
      addStep(
        4,
        `Loop condition check: low <= high (${low} <= ${high}) is True`,
        {
          arr: `[${arr.join(", ")}]`,
          target: target.toString(),
          low: low.toString(),
          high: high.toString(),
        },
        arrayState(low, high),
        undefined,
        stack,
        "",
        [`low <= high`]
      );

      const mid = Math.floor((low + high) / 2);
      const val = arr[mid];

      addStep(
        5,
        `Calculate middle index: mid = (low + high) // 2 = (${low} + ${high}) // 2 = ${mid}`,
        {
          arr: `[${arr.join(", ")}]`,
          target: target.toString(),
          low: low.toString(),
          high: high.toString(),
          mid: mid.toString(),
        },
        arrayState(low, high, mid),
        undefined,
        stack,
        "",
        [`mid = ${mid}`]
      );

      addStep(
        6,
        `Retrieve value at middle index: val = arr[mid] = arr[${mid}] = ${val}`,
        {
          arr: `[${arr.join(", ")}]`,
          target: target.toString(),
          low: low.toString(),
          high: high.toString(),
          mid: mid.toString(),
          val: val.toString(),
        },
        arrayState(low, high, mid),
        undefined,
        stack,
        "",
        [`val = ${val}`]
      );

      addStep(
        7,
        `Check if val == target (${val} == ${target})`,
        {
          arr: `[${arr.join(", ")}]`,
          target: target.toString(),
          low: low.toString(),
          high: high.toString(),
          mid: mid.toString(),
          val: val.toString(),
        },
        arrayState(low, high, mid),
        undefined,
        stack,
        "",
        [`val == target (${val == target})`]
      );

      if (val === target) {
        foundIdx = mid;
        addStep(
          8,
          `Found! Return middle index mid = ${mid}`,
          {
            arr: `[${arr.join(", ")}]`,
            target: target.toString(),
            low: low.toString(),
            high: high.toString(),
            mid: mid.toString(),
            val: val.toString(),
            result: mid.toString(),
          },
          arrayState(low, high, mid),
          undefined,
          stack,
          mid.toString(),
          [`Return ${mid}`]
        );
        break;
      } else if (val < target) {
        addStep(
          9,
          `Check if val < target (${val} < ${target}) is True`,
          {
            arr: `[${arr.join(", ")}]`,
            target: target.toString(),
            low: low.toString(),
            high: high.toString(),
            mid: mid.toString(),
            val: val.toString(),
          },
          arrayState(low, high, mid),
          undefined,
          stack,
          "",
          [`val < target (True)`]
        );

        low = mid + 1;
        addStep(
          10,
          `Target is larger than val. Move low pointer: low = mid + 1 = ${low}`,
          {
            arr: `[${arr.join(", ")}]`,
            target: target.toString(),
            low: low.toString(),
            high: high.toString(),
            mid: mid.toString(),
            val: val.toString(),
          },
          arrayState(low, high),
          undefined,
          stack,
          "",
          [`low = ${low}`]
        );
      } else {
        addStep(
          11,
          `Check if val < target (${val} < ${target}) is False. Target is smaller than val.`,
          {
            arr: `[${arr.join(", ")}]`,
            target: target.toString(),
            low: low.toString(),
            high: high.toString(),
            mid: mid.toString(),
            val: val.toString(),
          },
          arrayState(low, high, mid),
          undefined,
          stack,
          "",
          [`val < target (False)`]
        );

        high = mid - 1;
        addStep(
          12,
          `Move high pointer: high = mid - 1 = ${high}`,
          {
            arr: `[${arr.join(", ")}]`,
            target: target.toString(),
            low: low.toString(),
            high: high.toString(),
            mid: mid.toString(),
            val: val.toString(),
          },
          arrayState(low, high),
          undefined,
          stack,
          "",
          [`high = ${high}`]
        );
      }
    }

    if (foundIdx === -1) {
      addStep(
        13,
        `Loop finished with low > high. Target not found. Return -1`,
        {
          arr: `[${arr.join(", ")}]`,
          target: target.toString(),
          low: low.toString(),
          high: high.toString(),
          result: "-1",
        },
        arr.map((val, idx) => ({ value: val, index: idx })),
        undefined,
        stack,
        "-1",
        [`Return -1`]
      );
    }
  } else if (algorithmId === "bubbleSort") {
    const arr: number[] = [...(inputs.arr || [5, 1, 4, 2, 8])];
    const n = arr.length;

    const arrayState = (
      active1?: number,
      active2?: number,
      sortedCount = 0
    ): ArrayElement[] => {
      return arr.map((val, idx) => ({
        value: val,
        index: idx,
        isActive: idx === active1 || idx === active2,
        isCompared: idx === active1 || idx === active2,
        isSorted: idx >= n - sortedCount,
        pointer: idx === active1 ? "j" : idx === active2 ? "j+1" : undefined,
      }));
    };

    const stack = ["bubbleSort()"];

    addStep(
      1,
      "Function call: bubbleSort(arr)",
      { arr: `[${arr.join(", ")}]` },
      arrayState(),
      undefined,
      stack,
      "",
      ["bubbleSort(arr)"]
    );

    addStep(
      2,
      `Get array length: n = ${n}`,
      { arr: `[${arr.join(", ")}]`, n: n.toString() },
      arrayState(),
      undefined,
      stack,
      "",
      [`n = ${n}`]
    );

    for (let i = 0; i < n; i++) {
      addStep(
        3,
        `Outer loop i = ${i}`,
        { arr: `[${arr.join(", ")}]`, n: n.toString(), i: i.toString() },
        arrayState(undefined, undefined, i),
        undefined,
        stack,
        "",
        [`i = ${i}`]
      );

      for (let j = 0; j < n - i - 1; j++) {
        addStep(
          4,
          `Inner loop j = ${j}, comparing index ${j} and ${j + 1}`,
          {
            arr: `[${arr.join(", ")}]`,
            n: n.toString(),
            i: i.toString(),
            j: j.toString(),
          },
          arrayState(j, j + 1, i),
          undefined,
          stack,
          "",
          [`i = ${i}`, `j = ${j}`]
        );

        addStep(
          5,
          `Compare arr[j] > arr[j+1] (${arr[j]} > ${arr[j + 1]})`,
          {
            arr: `[${arr.join(", ")}]`,
            n: n.toString(),
            i: i.toString(),
            j: j.toString(),
          },
          arrayState(j, j + 1, i),
          undefined,
          stack,
          "",
          [`${arr[j]} > ${arr[j + 1]}`]
        );

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          addStep(
            6,
            `Swap elements: arr[j], arr[j+1] = arr[j+1], arr[j]`,
            {
              arr: `[${arr.join(", ")}]`,
              n: n.toString(),
              i: i.toString(),
              j: j.toString(),
            },
            arrayState(j, j + 1, i),
            undefined,
            stack,
            "",
            [`Swapped ${arr[j + 1]} and ${arr[j]}`]
          );
        }
      }
    }

    addStep(
      7,
      `Array sorted! Return arr`,
      { arr: `[${arr.join(", ")}]`, n: n.toString() },
      arr.map((val, idx) => ({ value: val, index: idx, isSorted: true })),
      undefined,
      stack,
      `[${arr.join(", ")}]`,
      [`Return sorted array`]
    );
  } else if (algorithmId === "fibonacci") {
    const n: number = inputs.n || 4;

    const stack: string[] = [];

    const runFib = (val: number): number => {
      const frame = `fib(${val})`;
      stack.push(frame);

      addStep(
        1,
        `Function entry: Call ${frame}`,
        { n: val.toString() },
        undefined,
        undefined,
        [...stack],
        "",
        [...stack]
      );

      addStep(
        2,
        `Check base case: is n <= 1 (${val} <= 1)?`,
        { n: val.toString() },
        undefined,
        undefined,
        [...stack],
        "",
        [...stack]
      );

      if (val <= 1) {
        addStep(
          3,
          `Base case met. Return ${val}`,
          { n: val.toString(), result: val.toString() },
          undefined,
          undefined,
          [...stack],
          "",
          [...stack]
        );
        stack.pop();
        return val;
      }

      addStep(
        4,
        `Recurse: Calculate fib(${val - 1})`,
        { n: val.toString() },
        undefined,
        undefined,
        [...stack],
        "",
        [...stack]
      );

      const r1 = runFib(val - 1);

      addStep(
        4,
        `Recurse: Calculate fib(${val - 2})`,
        { n: val.toString(), "fib(n-1)": r1.toString() },
        undefined,
        undefined,
        [...stack],
        "",
        [...stack]
      );

      const r2 = runFib(val - 2);

      const sum = r1 + r2;
      addStep(
        4,
        `Sum results: fib(${val - 1}) + fib(${val - 2}) = ${r1} + ${r2} = ${sum}`,
        { n: val.toString(), "fib(n-1)": r1.toString(), "fib(n-2)": r2.toString(), result: sum.toString() },
        undefined,
        undefined,
        [...stack],
        "",
        [...stack]
      );

      stack.pop();
      return sum;
    };

    runFib(n);
  }

  return steps;
}
