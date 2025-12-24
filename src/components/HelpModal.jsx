/**
 * HELP MODAL COMPONENT
 *
 * Floating info button that opens a modal with app instructions.
 * Keeps UI clean while making help content accessible on demand.
 * Original content preserved in DOM for SEO (visually hidden).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when modal is open (mobile fix)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Floating Info Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="absolute lg:fixed z-40 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group bottom-[9rem] lg:bottom-[3rem] right-[1rem]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="How to use Wordle Cloud"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 sm:h-12 sm:w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          How to use
        </span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-purple-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-t-3xl px-8 py-6 flex items-center justify-center relative">
                  <h2 className="text-3xl font-bold text-white">
                    How to Use Wordle Cloud
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-8 text-white/80 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="px-8 py-8">
                  {/* Value proposition */}
                  <p className="text-lg text-gray-800 dark:text-gray-200 mb-8 leading-relaxed">
                    <strong className="text-purple-700 dark:text-purple-300">Wordle Cloud</strong> helps you visualize
                    every possible word in real-time as you filter.
                  </p>

                  {/* Feature bullets */}
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">A</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Enter Your Letters
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Type <strong className="text-green-600 dark:text-green-400">green letters</strong> (correct position) in the green row, <strong className="text-yellow-600 dark:text-yellow-400">yellow letters</strong> (wrong position) in the yellow row, and <strong className="text-gray-600 dark:text-gray-400">gray letters</strong> (not in word) in the gray row.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Watch the Cloud Update
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          As you enter letters, the word cloud instantly filters to show only valid possibilities, making it easy to spot patterns and find your answer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          View Definitions
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          Click on any word in the cloud to see its definition and learn new words!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pro tip */}
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl px-6 py-4 border-2 border-purple-300 dark:border-purple-600">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <strong className="text-purple-800 dark:text-purple-200">Pro tip:</strong>
                        <span className="text-purple-700 dark:text-purple-300 ml-2">
                          The word cloud shows more common words in larger text, helping you prioritize likely solutions.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
