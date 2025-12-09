/**
 * ERROR MESSAGE COMPONENT
 *
 * Displays temporary error messages at the top of its container.
 * Used by GrayRow and YellowRow to show validation errors.
 *
 * Features:
 * - Auto-dismisses after 2 seconds
 * - Smooth fade-in/fade-out animation
 * - Red background with white text
 * - Positioned absolutely at the top center
 *
 * Props:
 * - message: The error text to display (or null/empty to hide)
 * - onClose: Callback function to clear the error
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ErrorMessage({ message, onClose }) {
  // Auto-dismiss timer: Clear the error after 2 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      // Clean up the timer if component unmounts or message changes
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
