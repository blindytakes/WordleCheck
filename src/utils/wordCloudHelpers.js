/**
 * WORD CLOUD HELPER FUNCTIONS
 *
 * Pure utility functions for word cloud manipulation and sizing.
 * These functions have no side effects and can be tested independently.
 */

import {
  FONT_SCALE_THRESHOLDS
} from '../constants';

/**
 * Fisher-Yates shuffle algorithm
 * Efficiently shuffles an array with unbiased randomization
 * Time complexity: O(n)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Hash function for deterministic word ordering and sizing
 * Converts a word to a consistent number based on character codes
 * Same word always produces the same hash
 */
export function hashWord(word) {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash += word.charCodeAt(i);
  }
  return hash;
}

/**
 * Determines available font sizes based on word count (PROGRESSIVE DRAMATIC SCALING)
 * Fewer words = larger fonts by eliminating small sizes from the range
 * This creates a noticeable "growing" effect as you narrow down options
 *
 * Progressive strategy (minimum size increases as count decreases):
 * - 30-40 words: text-2xl to text-5xl (min: 2xl)
 * - 20-30 words: text-3xl to text-5xl (min: 3xl) ← no more small sizes!
 * - 10-20 words: text-4xl to text-5xl (min: 4xl) ← only large sizes!
 * - 1-10 words: ALL text-5xl (everything HUGE!)
 */
export function getFontSizeRange(wordCount, fontSizes) {
  if (wordCount <= FONT_SCALE_THRESHOLDS.LARGEST_ONLY) return [fontSizes[5]];  // Only largest size
  if (wordCount <= FONT_SCALE_THRESHOLDS.LARGE_SIZES) return fontSizes.slice(4);  // Two largest sizes
  if (wordCount <= FONT_SCALE_THRESHOLDS.MEDIUM_LARGE) return fontSizes.slice(3);  // Three largest sizes
  if (wordCount <= FONT_SCALE_THRESHOLDS.MIXED_SIZES) return fontSizes.slice(2);  // Four largest sizes
  return fontSizes;  // All sizes
}
