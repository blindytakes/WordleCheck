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
    <div className="flex flex-wrap gap-4 sm:gap-3 justify-center items-center w-full max-w-full sm:max-w-3xl lg:max-w-5xl px-2">
      {/* AnimatePresence handles smooth transitions when words change */}
      <AnimatePresence mode="popLayout">
        {wordsWithSizes.map(({ word, size, id }, index) => (
          <motion.div
            key={id}
            layout  // Layout animation for smooth position tracking
            layoutId={isStableMode ? word : undefined}  // Stable position tracking in stable mode
            onClick={() => onWordClick(word)}  // Click to show definition
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
  );
}
