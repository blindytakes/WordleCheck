import { motion, AnimatePresence } from 'framer-motion';
import { useConstraints } from '../context/ConstraintContext';
import { useMemo } from 'react';

const FONT_SIZES = [
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl'
];

const MAX_DISPLAY_WORDS = 40;

// Fisher-Yates shuffle for unbiased randomization
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

  // Select random words to display and assign random font sizes
  const wordsWithSizes = useMemo(() => {
    const wordsToShow = filteredWords.length <= MAX_DISPLAY_WORDS
      ? filteredWords
      : shuffleArray(filteredWords).slice(0, MAX_DISPLAY_WORDS);

    return wordsToShow.map((word, index) => ({
      word,
      size: FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)],
      id: `${word}-${index}`
    }));
  }, [filteredWords]);

  const displayCount = Math.min(filteredWords.length, MAX_DISPLAY_WORDS);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-200/50 p-8 h-full overflow-auto border border-purple-100/50">
      {/* Word count display */}
      {filteredWords.length > 0 && (
        <div className="text-center mb-6 text-sm text-gray-500 font-medium">
          Showing {displayCount} of {filteredWords.length.toLocaleString()} words
        </div>
      )}

      {filteredWords.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-2xl font-medium text-center">
            No available words
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <AnimatePresence mode="popLayout">
            {wordsWithSizes.map(({ word, size, id }, index) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 0.75, scale: 1, y: 0 }}
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
                  scale: 1.1,
                  rotate: [-1, 1, -1, 0],
                  transition: { duration: 0.3 }
                }}
                className={`${size} font-semibold text-transparent bg-clip-text bg-gradient-to-br from-gray-700 to-gray-900 cursor-default select-none transition-all uppercase`}
              >
                {word}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
