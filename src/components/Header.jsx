import { motion } from 'framer-motion';
import useDarkMode from '../hooks/useDarkMode';

export default function Header() {
  const [isDark, toggleDarkMode] = useDarkMode();

  return (
    <div className="absolute lg:fixed z-50 bottom-[12rem] lg:bottom-[3rem] left-[2.5rem]">
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={toggleDarkMode}
          /* Increased padding from p-4 to p-6 */
          className="bg-white dark:bg-gray-800 rounded-full p-6 shadow-xl border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <svg
              /* Increased size from w-6 h-6 to w-8 h-8 */
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              /* Increased size from w-6 h-6 to w-8 h-8 */
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </motion.button>

        {/* Increased text size from text-sm to text-lg and font to bold */}
        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
          Dark Mode
        </span>
      </div>
    </div>
  );
}