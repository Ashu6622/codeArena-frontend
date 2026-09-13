export type PreviewProblem = {
  id: string;
  number: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  progressStatus?: 'SOLVED' | 'ATTEMPTED' | 'NOT_STARTED';
  isBookmarked?: boolean;
  description: string;
  inputLabel: string;
  input: string;
  target?: string;
  expected: string;
  explanation: string;
  complexity: string;
  code: string;
};

export const previewProblems: PreviewProblem[] = [
  {
    id: 'two-sum',
    number: '001',
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Arrays', 'Hash maps'],
    description:
      'Given an array of integers and a target, return the indices of the two numbers that add up to the target. Each element can be used only once.',
    inputLabel: 'nums',
    input: '[2, 7, 11, 15]',
    target: '9',
    expected: '[0, 1]',
    explanation: 'nums[0] + nums[1] = 2 + 7 = 9. Return their indices, not the values.',
    complexity: 'O(n)',
    code: `function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }

    seen.set(nums[i], i);
  }
  return null;
}`,
  },
  {
    id: 'valid-parentheses',
    number: '002',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topics: ['Strings', 'Stacks'],
    description:
      'Given a string containing only brackets, determine whether every opening bracket is closed by the same type in the correct order.',
    inputLabel: 's',
    input: '([]){}',
    expected: 'true',
    explanation: 'Each opening bracket has a matching closing bracket, in the correct order.',
    complexity: 'O(n)',
    code: `function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };

  for (const char of s) {
    if ('([{'.includes(char)) {
      stack.push(char);
    } else if (stack.pop() !== pairs[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
  },
  {
    id: 'binary-search',
    number: '003',
    title: 'Binary Search',
    difficulty: 'Easy',
    topics: ['Arrays', 'Binary search'],
    description:
      'Find the target in a sorted array of unique integers. Return its index, or -1 if it is not present. Aim for logarithmic time.',
    inputLabel: 'nums',
    input: '[-1, 0, 3, 5, 9, 12]',
    target: '9',
    expected: '4',
    explanation: 'The target 9 appears at index 4. Discard half of the search space at every step.',
    complexity: 'O(log n)',
    code: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  {
    id: 'longest-substring',
    number: '004',
    title: 'Longest Unique Substring',
    difficulty: 'Medium',
    topics: ['Strings', 'Sliding window'],
    description:
      'Find the length of the longest substring without repeating characters. A substring must be a continuous part of the original string.',
    inputLabel: 's',
    input: 'abcabcbb',
    expected: '3',
    explanation: 'The longest substring without repeated characters is "abc", with length 3.',
    complexity: 'O(n)',
    code: `function longestUnique(s) {
  const seen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char)) {
      left = Math.max(left, seen.get(char) + 1);
    }
    seen.set(char, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  },
];

export function runPreview(id: string, input: string, target: string): string {
  if (input.length > 256) throw new Error('Keep sample input under 256 characters.');
  if (id === 'valid-parentheses') {
    if (!/^[()[\]{}]*$/.test(input))
      throw new Error('Use only the bracket characters: ( ) [ ] { }.');
    const stack: string[] = [];
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    for (const char of input) {
      if ('([{'.includes(char)) stack.push(char);
      else if (stack.pop() !== pairs[char]) return 'false';
    }
    return String(stack.length === 0);
  }
  if (id === 'longest-substring') {
    const seen = new Map<string, number>();
    let left = 0;
    let best = 0;
    for (let right = 0; right < input.length; right++) {
      const char = input[right];
      if (seen.has(char)) left = Math.max(left, seen.get(char)! + 1);
      seen.set(char, right);
      best = Math.max(best, right - left + 1);
    }
    return String(best);
  }
  let nums: unknown;
  try {
    nums = JSON.parse(input);
  } catch {
    throw new Error('Enter an array of integers, such as [2, 7, 11, 15].');
  }
  if (
    !Array.isArray(nums) ||
    nums.length > 32 ||
    !nums.every(
      (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && Math.abs(n) <= 1000000,
    )
  ) {
    throw new Error('Use an array of up to 32 integers between -1000000 and 1000000.');
  }
  if (
    !target.trim() ||
    !Number.isSafeInteger(Number(target)) ||
    Math.abs(Number(target)) > 1000000
  ) {
    throw new Error('Enter an integer target between -1000000 and 1000000.');
  }
  const values = nums as number[];
  const goal = Number(target);
  if (id === 'two-sum') {
    const seen = new Map<number, number>();
    for (let i = 0; i < values.length; i++) {
      const complement = goal - values[i];
      if (seen.has(complement)) return JSON.stringify([seen.get(complement), i]);
      seen.set(values[i], i);
    }
    return 'null';
  }
  if (id !== 'binary-search') throw new Error('Unknown sample problem.');
  if (values.some((n, i) => i > 0 && n <= values[i - 1]))
    throw new Error('Binary search needs unique integers in ascending order.');
  let left = 0;
  let right = values.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (values[mid] === goal) return String(mid);
    if (values[mid] < goal) left = mid + 1;
    else right = mid - 1;
  }
  return '-1';
}
