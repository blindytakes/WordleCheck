/**
 * WORD SELECTION HOOK
 *
 * Custom hook for selecting and sizing words for the word cloud.
 * Handles two modes: stable (deterministic) and dynamic (random).
 *
 * Features:
 * - Stable mode (≤40 words): Hash-based ordering, deterministic sizes, dramatic scaling
 * - Dynamic mode (>40 words): Random selection, random sizes
 * - Performance optimized with useMemo
 * - Progressive dramatic scaling (fewer words = larger fonts)
 */

import { useMemo } from 'react';
import { shuffleArray, hashWord, getFontSizeRange } from '../utils/wordCloudHelpers';

/**
 * Selects and sizes words for display in the word cloud
 *
 * @param {string[]} filteredWords - Array of words that match current constraints
 * @param {string[]} fontSizes - Array of Tailwind font size classes
 * @param {number} maxDisplayWords - Maximum number of words to display
 * @returns {{ wordsWithSizes: Array, isStableMode: boolean }}
 */
export default function useWordSelection(filteredWords, fontSizes, maxDisplayWords) {
  const { wordsWithSizes, isStableMode } = useMemo(() => {
    const isStableMode = filteredWords.length <= maxDisplayWords;

    // STEP 1: Select which words to display
    const wordsToShow = isStableMode
      ? [...filteredWords].sort((a, b) => hashWord(a) - hashWord(b))  // Stable: hash-based "random" order
      : shuffleArray(filteredWords).slice(0, maxDisplayWords);         // Dynamic: true random selection

    // STEP 2: Determine available font sizes (dramatic scaling in stable mode)
    const availableSizes = isStableMode
      ? getFontSizeRange(filteredWords.length, fontSizes)  // Fewer words = larger fonts
      : fontSizes;                                          // All sizes available

    // STEP 3: Assign sizes and create display objects
    const wordsWithSizes = wordsToShow.map((word, index) => ({
      word,
      size: isStableMode
        ? availableSizes[hashWord(word) % availableSizes.length]                // Deterministic size
        : availableSizes[Math.floor(Math.random() * availableSizes.length)],    // Random size
      id: isStableMode ? word : `${word}-${index}`  // Stable keys prevent re-animation
    }));

    return { wordsWithSizes, isStableMode };
  }, [filteredWords, fontSizes, maxDisplayWords]);

  return { wordsWithSizes, isStableMode };
}
