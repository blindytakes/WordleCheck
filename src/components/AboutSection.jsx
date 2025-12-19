/**
 * ABOUT SECTION COMPONENT
 *
 * SEO-friendly description of what makes Wordle Cloud unique.
 * Always visible for search engine crawlers, positioned at bottom of page.
 * Explains the visual filtering approach in natural language.
 */

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-6 py-8 mt-8"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-purple-200 dark:border-purple-700">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100 mb-4">
          Master Wordle with Visual Filtering
        </h1>

        {/* Value proposition */}
        <p className="text-lg text-gray-800 dark:text-gray-200 mb-6 leading-relaxed">
          Stop scrolling through long lists of words. <strong>Wordle Cloud</strong> helps you visualize
          every possibility in real-time.
        </p>

        {/* Feature bullets */}
        <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
          <li className="flex items-start gap-3">
            <span className="text-purple-500 dark:text-purple-400 font-bold mt-0.5">•</span>
            <div>
              <strong>Filter Instantly:</strong> Enter your green, yellow, and gray letters to watch
              the cloud update dynamically.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500 dark:text-purple-400 font-bold mt-0.5">•</span>
            <div>
              <strong>Find the Best Path:</strong> Spot letter patterns and common word structures
              at a glance to save your streak.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500 dark:text-purple-400 font-bold mt-0.5">•</span>
            <div>
              <strong>Strategic Starting Words:</strong> Use our visual aid to test popular openers
              like STARE or CRANE and see how many options they leave behind.
            </div>
          </li>
        </ul>

        {/* Pro tip */}
        <p className="text-sm text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-lg px-4 py-3">
          <strong>💡 Pro tip:</strong> Hover over any word to see its definition and make a more strategic choice.
        </p>
      </div>
    </motion.section>
  );
}
