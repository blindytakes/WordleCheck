/**
 * FOOTER HINT COMPONENT
 *
 * Displays a helpful tip at the bottom of the screen after a delay.
 * Hidden on touch devices (mobile/tablet) since hover doesn't apply.
 *
 * Features:
 * - Appears after configurable delay (default 3 seconds)
 * - Smooth fade-in/out animations
 * - Responsive text sizing
 * - Auto-hides on touch devices
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FOOTER_HINT_DELAY_MS } from '../constants';

export default function FooterHint({ isTouchDevice, delay = FOOTER_HINT_DELAY_MS }) {
  const [showHint, setShowHint] = useState(false);

  // Show hint after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Don't render on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <AnimatePresence>
      {showHint && (
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
  );
}
