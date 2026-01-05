/**
 * WORD GRID COMPONENT
 *
 * Displays words inside the cloud with animations.
 * Handles empty state and word animations (stable vs dynamic modes).
 *
 * Features:
 * - Empty state with placeholder text
 * - Animated word grid with hover effects
 * - Conditional animations (stable mode: smooth fades, dynamic mode: bouncy)
 * - Click handler for opening word definitions
 */

import { motion, AnimatePresence } from 'framer-motion';

export default function WordGrid({
  filteredWords,
  wordsWithSizes,
  isStableMode,
  isTouchDevice,
  onWordClick
}) {
  if (filteredWords.length === 0) {
    // Empty state: Show placeholder text when no words match
    return (
      <motion.div
        className="text-slate-700 dark:text-gray-300 text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No Winning Words...
      </motion.div>
    );
  }

  // Word grid: Flex wrap layout with animated words
  return (
    <div className="flex flex-wrap gap-5 sm:gap-3 justify-center items-center w-full max-w-full sm:max-w-3xl lg:max-w-5xl px-2 overflow-visible">
      {/* MOBILE: No AnimatePresence for instant updates and zero layout recalculations */}
      {/* DESKTOP: AnimatePresence for smooth word transitions */}
      {isTouchDevice ? (
        // Mobile: Static rendering, no animations
        wordsWithSizes.map(({ word, size, id }) => (
          <div
            key={id}
            onClick={() => onWordClick(word)}
            className={`${size} font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 dark:from-gray-100 dark:via-purple-200 dark:to-gray-100 cursor-pointer select-none uppercase`}
          >
            {word}
          </div>
        ))
      ) : (
        // Desktop: Full animations with AnimatePresence
        <AnimatePresence mode="popLayout">
          {wordsWithSizes.map(({ word, size, id }, index) => (
            <motion.div
              key={id}
              layout={true}
              layoutId={isStableMode ? word : undefined}
              onClick={() => onWordClick(word)}
              initial={
                isStableMode
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.8, y: 20 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                isStableMode
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.8, y: -20 }
              }
              transition={
                isStableMode
                  ? {
                      duration: 0.4,
                      layout: { type: "spring", duration: 0.6, bounce: 0 }
                    }
                  : {
                      duration: 0.4,
                      delay: index * 0.01,
                      layout: { duration: 0.3 },
                      type: "spring",
                      stiffness: 300,
                      damping: 24
                    }
              }
              whileHover={{
                opacity: 1,
                scale: 1.2,
                rotate: [-2, 2, -2, 0],
                filter: "brightness(1.2) drop-shadow(0 0 12px rgba(168, 85, 247, 0.7))",
                transition: { duration: 0.3 }
              }}
              className={`${size} font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 dark:from-gray-100 dark:via-purple-200 dark:to-gray-100 cursor-pointer select-none transition-all uppercase drop-shadow-md`}
            >
              {word}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
