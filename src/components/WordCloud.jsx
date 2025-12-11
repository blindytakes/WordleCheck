/**
 * WORD CLOUD COMPONENT
 *
 * Displays possible Wordle words in a beautiful fluffy cloud design.
 * This is the main visual output showing which words still match your constraints.
 *
 * Design features:
 * - Fluffy cloud shape made of overlapping gradient circles with blur
 * - Words displayed inside the cloud with random font sizes
 * - Continuous floating animation (cloud gently bobs up and down)
 * - Individual word animations (fade in, scale, rotate on hover)
 * - Shows up to 40 random words if there are more than 40 matches
 * - Word count display above the cloud
 *
 * Performance:
 * - Uses useMemo to prevent unnecessary recalculations
 * - Fisher-Yates shuffle for efficient randomization
 * - AnimatePresence for smooth word transitions
 *
 * Color scheme:
 * - Blue gradients for cloud (white -> blue-50 -> blue-100)
 * - Blue text gradients for words (blue-500 -> blue-700)
 * - Matches the overall pink/blue theme of the app
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useConstraints } from '../context/ConstraintContext';
import { useMemo, useState, useEffect } from 'react';
import DefinitionModal from './DefinitionModal';
import { getRUM } from '../rum.js';
import useTouchDevice from '../hooks/useTouchDevice';

// Available font sizes for words (from small to large)
// Desktop: larger fonts for better visibility
const FONT_SIZES_DESKTOP = [
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl'
];

// Mobile: smaller fonts to fit more words comfortably
const FONT_SIZES_MOBILE = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl'
];

// Maximum words to show (prevents cloud from getting too crowded)
const MAX_DISPLAY_WORDS_DESKTOP = 40;
const MAX_DISPLAY_WORDS_MOBILE = 15;

// Dictionary cache to avoid repeated API calls
const definitionCache = {};

/**
 * Fisher-Yates shuffle algorithm
 * Efficiently shuffles an array with unbiased randomization
 * Time complexity: O(n)
 */
function shuffleArray(array) {
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
function hashWord(word) {
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
function getFontSizeRange(wordCount, fontSizes) {
  if (wordCount <= 10) return [fontSizes[5]];           // Only largest size
  if (wordCount <= 20) return fontSizes.slice(4);       // Two largest sizes
  if (wordCount <= 30) return fontSizes.slice(3);       // Three largest sizes
  if (wordCount <= 40) return fontSizes.slice(2);       // Four largest sizes
  return fontSizes;                                      // All sizes
}

export default function WordCloud() {
  const { filteredWords } = useConstraints();
  const isTouchDevice = useTouchDevice();

  // Device-specific settings
  const FONT_SIZES = isTouchDevice ? FONT_SIZES_MOBILE : FONT_SIZES_DESKTOP;
  const MAX_DISPLAY_WORDS = isTouchDevice ? MAX_DISPLAY_WORDS_MOBILE : MAX_DISPLAY_WORDS_DESKTOP;

  // ========================================
  // DEFINITION MODAL STATE
  // ========================================

  const [selectedWord, setSelectedWord] = useState(null);
  const [definition, setDefinition] = useState(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const [definitionError, setDefinitionError] = useState(false);
  const [showFooterHint, setShowFooterHint] = useState(false);

  // ========================================
  // WORD SELECTION & SIZING
  // ========================================

  // Select which words to display and assign font sizes
  // This recalculates whenever filteredWords changes (useMemo for performance)
  //
  // TWO MODES:
  // 1. Stable Mode (≤40 words): Hash-based ordering, deterministic sizes, dramatic scaling
  // 2. Dynamic Mode (>40 words): Random selection, random sizes
  const { wordsWithSizes, isStableMode } = useMemo(() => {
    const isStableMode = filteredWords.length <= MAX_DISPLAY_WORDS;

    // STEP 1: Select which words to display
    const wordsToShow = isStableMode
      ? [...filteredWords].sort((a, b) => hashWord(a) - hashWord(b))  // Stable: hash-based "random" order
      : shuffleArray(filteredWords).slice(0, MAX_DISPLAY_WORDS);      // Dynamic: true random selection

    // STEP 2: Determine available font sizes (dramatic scaling in stable mode)
    const availableSizes = isStableMode
      ? getFontSizeRange(filteredWords.length, FONT_SIZES)  // Fewer words = larger fonts
      : FONT_SIZES;                                           // All sizes available

    // STEP 3: Assign sizes and create display objects
    const wordsWithSizes = wordsToShow.map((word, index) => ({
      word,
      size: isStableMode
        ? availableSizes[hashWord(word) % availableSizes.length]        // Deterministic size
        : availableSizes[Math.floor(Math.random() * availableSizes.length)],  // Random size
      id: isStableMode ? word : `${word}-${index}`  // Stable keys prevent re-animation
    }));

    return { wordsWithSizes, isStableMode };
  }, [filteredWords, FONT_SIZES, MAX_DISPLAY_WORDS]);

  // ========================================
  // FOOTER HINT TIMER
  // ========================================

  // Show footer hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFooterHint(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ========================================
  // DICTIONARY API FUNCTIONS
  // ========================================

  /**
   * Fetches word definition from Free Dictionary API
   * Uses cache to avoid repeated requests for the same word
   */
  const fetchDefinition = async (word) => {
    const wordLower = word.toLowerCase();

    // Check cache first
    if (definitionCache[wordLower]) {
      setDefinition(definitionCache[wordLower]);
      setDefinitionError(false);

      // Track cached definition fetch
      getRUM().addEvent('definition.fetched', {
        word: wordLower,
        cached: true,
        success: true,
        timestamp: Date.now()
      });

      return;
    }

    // Fetch from API
    setIsLoadingDefinition(true);
    setDefinitionError(false);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${wordLower}`
      );

      if (!response.ok) {
        throw new Error('Definition not found');
      }

      const data = await response.json();

      // Cache the result
      definitionCache[wordLower] = data;

      setDefinition(data);
      setDefinitionError(false);

      // Track successful definition fetch
      getRUM().addEvent('definition.fetched', {
        word: wordLower,
        cached: false,
        success: true,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching definition:', error);
      setDefinitionError(true);
      setDefinition(null);

      // Track failed definition fetch
      getRUM().addEvent('definition.fetched', {
        word: wordLower,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setIsLoadingDefinition(false);
    }
  };

  /**
   * Handles word click - opens modal and fetches definition
   */
  const handleWordClick = (word) => {
    // Track word click event in Splunk
    getRUM().addEvent('word.clicked', {
      word: word,
      totalWords: filteredWords.length,
      cloudMode: isStableMode ? 'stable' : 'dynamic',
      timestamp: Date.now()
    });

    setSelectedWord(word);
    setDefinition(null);
    fetchDefinition(word);
  };

  /**
   * Closes the definition modal
   */
  const handleCloseModal = () => {
    // Track modal close
    getRUM().addEvent('modal.closed', {
      word: selectedWord,
      hadDefinition: definition !== null,
      timestamp: Date.now()
    });

    setSelectedWord(null);
    setDefinition(null);
    setDefinitionError(false);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-start mt-2 md:mt-24 lg:mt-48">
      {/* Title: "Wordle Fun" with gradient text (responsive sizing) */}
      <motion.div
        className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 dark:from-pink-400 dark:via-purple-400 dark:to-blue-400 text-transparent bg-clip-text mb-1 md:mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Wordle Fun
      </motion.div>

      {/* Word count: Shows how many words match the constraints (responsive sizing) */}
      {filteredWords.length > 0 && (
        <motion.div
          className="text-center mb-2 md:mb-8 text-xl sm:text-2xl md:text-4xl lg:text-5xl bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400 text-transparent bg-clip-text font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {filteredWords.length.toLocaleString()} words
        </motion.div>
      )}

      {/* FLUFFY CLOUD CONTAINER */}
      {/* Outer container: Initial scale/fade-in animation */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={{ y: -20, scale: 0.9, opacity: 0 }}
        animate={{
          y: 0,
          scale: 1,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          duration: 1
        }}
      >
        {/* Floating animation: Cloud gently bobs up and down infinitely (desktop only) */}
        <motion.div
          className="relative"
          animate={isTouchDevice ? {} : {
            y: [0, -15, 0], // Move up 15px, then back down
          }}
          transition={isTouchDevice ? {} : {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Cloud shape: Made of multiple overlapping gradient circles with blur (responsive sizing) */}
          <div className="relative w-[90vw] max-w-[700px] h-[60vw] max-h-[500px] sm:w-[85vw] sm:h-[58vw] md:w-[85vw] md:h-[61vw] lg:w-[990px] lg:h-[715px]">
            {/* Main cloud body: 13 overlapping circles create the fluffy shape */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 10px rgba(128, 90, 213, 0.3))' }}>
              {/* Left puff */}
              <div className="absolute left-4 top-1/4 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-95"></div>

              {/* Center large puff - the main body */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-80 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 rounded-full blur-lg"></div>

              {/* Right puff */}
              <div className="absolute right-4 top-1/3 w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-95"></div>

              {/* Top left puff */}
              <div className="absolute left-28 top-8 w-60 h-60 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full blur-lg"></div>

              {/* Top center puff */}
              <div className="absolute left-1/2 -translate-x-1/2 top-12 w-56 h-56 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full blur-lg"></div>

              {/* Top right puff */}
              <div className="absolute right-28 top-12 w-52 h-52 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full blur-lg"></div>

              {/* Additional puffs to fill gaps */}
              {/* Upper left fill */}
              <div className="absolute left-48 top-20 w-56 h-56 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full blur-lg opacity-90"></div>

              {/* Upper right fill */}
              <div className="absolute right-48 top-24 w-52 h-52 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-purple-900 dark:to-purple-800 rounded-full blur-lg opacity-90"></div>

              {/* Middle left fill */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-85"></div>

              {/* Middle right fill */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-85"></div>

              {/* Bottom puffs for fullness */}
              <div className="absolute left-36 bottom-12 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-85"></div>
              <div className="absolute right-36 bottom-16 w-60 h-60 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-85"></div>

              {/* Middle bottom puff for cloud shape */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-20 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-purple-800 dark:to-purple-900 rounded-full blur-lg opacity-90"></div>
            </div>

            {/* Soft drop shadow underneath cloud for depth */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[500px] h-16 bg-blue-300/40 dark:bg-purple-900/40 rounded-full blur-3xl"></div>

            {/* CONTENT: Words displayed inside the cloud (responsive padding) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-2 py-4 sm:px-8 sm:py-10 md:px-12 md:py-12 lg:px-20 lg:py-16">
              {filteredWords.length === 0 ? (
                // Empty state: Show placeholder text when no constraints are set (responsive sizing)
                <motion.div
                  className="text-slate-700 dark:text-gray-300 text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No Winning Words...
                </motion.div>
              ) : (
                // Word grid: Flex wrap layout with animated words
                <div className="flex flex-wrap gap-3 justify-center items-center max-w-3xl">
                  {/* AnimatePresence handles smooth transitions when words change */}
                  <AnimatePresence mode="popLayout">
                    {wordsWithSizes.map(({ word, size, id }, index) => (
                      <motion.div
                        key={id}
                        layout  // Layout animation for smooth position tracking
                        layoutId={isStableMode ? word : undefined}  // Stable position tracking in stable mode
                        onClick={() => handleWordClick(word)}  // Click to show definition
                        // CONDITIONAL ANIMATIONS:
                        // Stable mode: Smooth fades with slow layout transitions
                        // Dynamic mode: Fun bouncy animations with stagger
                        initial={
                          isStableMode
                            ? { opacity: 0 }  // Stable: just fade in
                            : { opacity: 0, scale: 0.8, y: 20 }  // Dynamic: bounce in from below
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                          isStableMode
                            ? { opacity: 0 }  // Stable: just fade out
                            : { opacity: 0, scale: 0.8, y: -20 }  // Dynamic: bounce out upward
                        }
                        transition={
                          isStableMode
                            ? {
                                duration: 0.4,
                                layout: { type: "spring", duration: 0.6, bounce: 0 }  // Slow, smooth spring with no bounce
                              }
                            : {
                                duration: 0.4,
                                delay: index * 0.01,  // Stagger effect
                                layout: { duration: 0.3 },
                                type: "spring",
                                stiffness: 300,
                                damping: 24
                              }
                        }
                        whileHover={{
                          opacity: 1,
                          scale: 1.2,  // Slightly bigger for more emphasis
                          rotate: [-2, 2, -2, 0],
                          filter: "brightness(1.2) drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))",  // Purple glow
                          transition: { duration: 0.3 }
                        }}
                        className={`${size} font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 dark:from-gray-100 dark:via-purple-200 dark:to-gray-100 cursor-pointer select-none transition-all uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] drop-shadow-md`}
                      >
                        {word}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Definition Modal */}
      {selectedWord && (
        <DefinitionModal
          word={selectedWord}
          definition={definition}
          isLoading={isLoadingDefinition}
          error={definitionError}
          onClose={handleCloseModal}
        />
      )}

      {/* Subtle Footer Hint - appears after 3 seconds (desktop only) */}
      {!isTouchDevice && (
        <AnimatePresence>
          {showFooterHint && (
            <motion.div
              className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg border border-purple-200 dark:border-purple-600 max-w-[90vw]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium text-center">
                💡 Tip: Hover and Click words for definitions
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
