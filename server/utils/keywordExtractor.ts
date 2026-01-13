/**
 * Keyword Extractor Utility
 *
 * Extracts meaningful keywords from Feature List text with weight calculation.
 *
 * Requirements:
 * - AC-001: Extract 3-15 meaningful keywords from text
 * - Assign weights (0-100) based on frequency
 * - Filter out stopwords (particles, conjunctions)
 * - Normalize tags (lowercase, special char removal, deduplication)
 */

/**
 * Represents an extracted keyword with its weight
 */
export interface ExtractedKeyword {
  keyword: string;
  weight: number; // 0-100
}

/**
 * Korean stopwords (particles, conjunctions, common words)
 */
const KOREAN_STOPWORDS = new Set([
  // Particles
  '은', '는', '이', '가', '을', '를', '의', '에', '로', '으로',
  '와', '과', '도', '만', '시', '때', '에서', '부터', '까지',
  '께서', '한테', '에게', '처럼', '같이', '보다', '라고', '이라고',
  // Conjunctions and common words
  '그리고', '하지만', '그러나', '또는', '혹은', '및', '그래서',
  '따라서', '때문에', '위해', '대해', '통해', '합니다', '있습니다',
  '됩니다', '입니다', '하고', '이고', '것', '수', '등', '중',
  // Common verbs/endings
  '하다', '되다', '있다', '없다', '이다', '아니다',
  '진행', '개발', '구현', '추가', '관리', // Too generic
]);

/**
 * English stopwords
 */
const ENGLISH_STOPWORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Pronouns
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  // Verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'would', 'should', 'could', 'ought', 'might', 'must', 'shall', 'will', 'can',
  // Prepositions
  'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'to', 'with',
  'about', 'against', 'between', 'through', 'during', 'before', 'after',
  'above', 'below', 'under', 'over', 'again', 'further', 'then', 'once',
  // Conjunctions
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'same', 'than', 'too', 'very', 'just',
  // Other common words
  'if', 'else', 'when', 'while', 'as', 'because', 'until', 'unless',
  'where', 'how', 'all', 'any', 'each', 'every', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'own', 'here', 'there', 'now',
  // Common verbs
  'get', 'got', 'make', 'made', 'take', 'taken', 'use', 'used',
  'new', 'also', 'like', 'well', 'way', 'even', 'back',
  // Filler words for development context
  'accordingly', 'able', 'using', 'users', 'user',
]);

/** Minimum text length required for keyword extraction */
const MIN_TEXT_LENGTH = 100;

/** Minimum length for a word to be considered as keyword */
const MIN_KEYWORD_LENGTH = 2;

/** Maximum number of keywords to return */
const MAX_KEYWORDS = 15;

/**
 * Extracts meaningful keywords from Feature List text
 *
 * Process:
 * 1. Validate input length (minimum 100 characters)
 * 2. Normalize text (lowercase, clean whitespace)
 * 3. Tokenize into words
 * 4. Filter stopwords (Korean particles, English common words)
 * 5. Calculate frequency-based weights (0-100)
 * 6. Return sorted keywords (max 15)
 *
 * @param text - The input text to extract keywords from (min 100 chars)
 * @returns Array of ExtractedKeyword objects sorted by weight (descending)
 *
 * @example
 * const keywords = extractKeywords('Character growth system development...');
 * // Returns: [{ keyword: 'character', weight: 100 }, { keyword: 'system', weight: 67 }, ...]
 */
export function extractKeywords(text: string): ExtractedKeyword[] {
  // Validate input
  if (!text || text.length < MIN_TEXT_LENGTH) {
    return [];
  }

  // Process text through pipeline
  const normalizedText = normalizeText(text);
  const words = tokenize(normalizedText);
  const frequencyMap = calculateFrequency(words);

  // Handle empty frequency map
  if (frequencyMap.size === 0) {
    return [];
  }

  // Calculate weights, sort by weight descending, and limit results
  return calculateWeights(frequencyMap)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_KEYWORDS);
}

/**
 * Normalizes text by converting to lowercase and cleaning whitespace
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into words, separating Korean and English
 */
function tokenize(text: string): string[] {
  // Remove punctuation and special characters, keeping Korean, English, and numbers
  const cleaned = text.replace(/[^\w가-힣\s]/g, ' ');

  // Split by whitespace
  const tokens = cleaned.split(/\s+/).filter((token) => token.length > 0);

  // Further split mixed tokens (e.g., "level999" -> ["level", "999"])
  const result: string[] = [];

  for (const token of tokens) {
    // Check if token contains both letters and numbers
    if (/[a-z]/.test(token) && /\d/.test(token)) {
      // Split letters from numbers
      const parts = token.split(/(\d+)/).filter((p) => p.length > 0);
      result.push(...parts);
    } else {
      result.push(token);
    }
  }

  return result;
}

/**
 * Calculates word frequency, filtering out stopwords
 */
function calculateFrequency(words: string[]): Map<string, number> {
  const frequency = new Map<string, number>();

  for (const word of words) {
    // Skip short words
    if (word.length < MIN_KEYWORD_LENGTH) {
      continue;
    }

    // Skip pure numbers
    if (/^\d+$/.test(word)) {
      continue;
    }

    // Check if word is a Korean stopword
    if (isKoreanWord(word) && KOREAN_STOPWORDS.has(word)) {
      continue;
    }

    // Check if word is an English stopword
    if (isEnglishWord(word) && ENGLISH_STOPWORDS.has(word)) {
      continue;
    }

    // Increment frequency
    const count = frequency.get(word) || 0;
    frequency.set(word, count + 1);
  }

  return frequency;
}

/**
 * Checks if a word contains Korean characters
 */
function isKoreanWord(word: string): boolean {
  return /[가-힣]/.test(word);
}

/**
 * Checks if a word contains only English letters
 */
function isEnglishWord(word: string): boolean {
  return /^[a-z]+$/.test(word);
}

/**
 * Calculates weights (0-100) based on frequency and creates keyword objects
 *
 * @param frequencyMap - Map of keywords to their occurrence count
 * @returns Array of ExtractedKeyword objects with normalized weights
 */
function calculateWeights(frequencyMap: Map<string, number>): ExtractedKeyword[] {
  // Find max frequency for normalization
  const maxFreq = Math.max(...frequencyMap.values());

  // Create keyword objects with normalized weights (0-100 range)
  return Array.from(frequencyMap.entries()).map(([keyword, freq]) => ({
    keyword,
    weight: Math.round((freq / maxFreq) * 100),
  }));
}
