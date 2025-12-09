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
import { useMemo } from 'react';

// Available font sizes for words (from small to large)
const FONT_SIZES = [
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl'
];

// Maximum words to show (prevents cloud from getting too crowded)
const MAX_DISPLAY_WORDS = 40;

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

export default function WordCloud() {
  const { filteredWords } = useConstraints();

  // ========================================
  // WORD SELECTION & SIZING
  // ========================================

  // Select which words to display and assign random font sizes
  // This recalculates whenever filteredWords changes (useMemo for performance)
  const wordsWithSizes = useMemo(() => {
    // If 40 or fewer words, show all of them
    // If more than 40, randomly pick 40 to prevent overcrowding
    const wordsToShow = filteredWords.length <= MAX_DISPLAY_WORDS
      ? filteredWords
      : shuffleArray(filteredWords).slice(0, MAX_DISPLAY_WORDS);

    // Assign each word a random font size and a unique ID (for animation keys)
    return wordsToShow.map((word, index) => ({
      word,
      size: FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)],
      id: `${word}-${index}` // Unique key for React/Framer Motion
    }));
  }, [filteredWords]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center mt-16">
      {/* Title: "Wordle Fun" with gradient text */}
      <motion.div
        className="text-8xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-transparent bg-clip-text mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Wordle Fun
      </motion.div>

      {/* Word count: Shows how many words match the constraints */}
      {filteredWords.length > 0 && (
        <motion.div
          className="text-center mb-0 text-5xl text-blue-600 font-bold"
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
        {/* Floating animation: Cloud gently bobs up and down infinitely */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -15, 0], // Move up 15px, then back down
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Cloud shape: Made of multiple overlapping gradient circles with blur */}
          <div className="relative w-[990px] h-[715px]">
            {/* Main cloud body: 9 overlapping circles create the fluffy shape */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Left puff */}
              <div className="absolute left-4 top-1/4 w-72 h-72 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-md opacity-95"></div>

              {/* Center large puff - the main body */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-80 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-full blur-md"></div>

              {/* Right puff */}
              <div className="absolute right-4 top-1/3 w-80 h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-md opacity-95"></div>

              {/* Top left puff */}
              <div className="absolute left-28 top-8 w-60 h-60 bg-gradient-to-br from-white to-blue-50 rounded-full blur-md"></div>

              {/* Top center puff */}
              <div className="absolute left-1/2 -translate-x-1/2 top-12 w-56 h-56 bg-gradient-to-br from-white to-blue-50 rounded-full blur-md"></div>

              {/* Top right puff */}
              <div className="absolute right-28 top-12 w-52 h-52 bg-gradient-to-br from-white to-blue-50 rounded-full blur-md"></div>

              {/* Bottom puffs for fullness */}
              <div className="absolute left-36 bottom-12 w-64 h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-md opacity-85"></div>
              <div className="absolute right-36 bottom-16 w-60 h-60 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-md opacity-85"></div>

              {/* Middle bottom puff for cloud shape */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-20 w-72 h-72 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-md opacity-90"></div>
            </div>

            {/* Soft drop shadow underneath cloud for depth */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[500px] h-16 bg-blue-200/40 rounded-full blur-3xl"></div>

            {/* CONTENT: Words displayed inside the cloud */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-20 py-16">
              {filteredWords.length === 0 ? (
                // Empty state: Show placeholder text when no constraints are set
                <motion.div
                  className="text-blue-300 text-3xl font-medium text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No words yet...
                </motion.div>
              ) : (
                // Word grid: Flex wrap layout with animated words
                <div className="flex flex-wrap gap-3 justify-center items-center max-w-3xl">
                  {/* AnimatePresence handles smooth transitions when words change */}
                  <AnimatePresence mode="popLayout">
                    {wordsWithSizes.map(({ word, size, id }, index) => (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.01,
                          layout: { duration: 0.3 },
                          type: "spring",
                          stiffness: 300,
                          damping: 24
                        }}
                        whileHover={{
                          opacity: 1,
                          scale: 1.15,
                          rotate: [-2, 2, -2, 0],
                          transition: { duration: 0.3 }
                        }}
                        className={`${size} font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 cursor-default select-none transition-all uppercase drop-shadow-sm`}
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
    </div>
  );
}
