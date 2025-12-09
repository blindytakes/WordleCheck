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

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center mt-16">
      {/* Title */}
      <motion.div
        className="text-6xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 text-transparent bg-clip-text mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Wordle Fun
      </motion.div>

      {/* Word count display */}
      {filteredWords.length > 0 && (
        <motion.div
          className="text-center mb-2 text-lg text-blue-600 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {filteredWords.length.toLocaleString()} words
        </motion.div>
      )}

      {/* Fluffy Cloud Container */}
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
        {/* Continuous floating animation */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Cloud shape made of overlapping circles */}
          <div className="relative w-[700px] h-[500px]">
            {/* Main cloud body */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Left puff */}
              <div className="absolute left-8 top-1/4 w-48 h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-sm opacity-90"></div>

              {/* Center large puff */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-64 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-full blur-sm"></div>

              {/* Right puff */}
              <div className="absolute right-8 top-1/3 w-52 h-52 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-sm opacity-90"></div>

              {/* Top left puff */}
              <div className="absolute left-24 top-12 w-40 h-40 bg-gradient-to-br from-white to-blue-50 rounded-full blur-sm"></div>

              {/* Top right puff */}
              <div className="absolute right-24 top-16 w-36 h-36 bg-gradient-to-br from-white to-blue-50 rounded-full blur-sm"></div>

              {/* Bottom puffs for fullness */}
              <div className="absolute left-32 bottom-16 w-44 h-44 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-sm opacity-80"></div>
              <div className="absolute right-32 bottom-20 w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-sm opacity-80"></div>
            </div>

            {/* Soft drop shadow underneath */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-12 bg-blue-200/30 rounded-full blur-2xl"></div>

            {/* Content container - words inside the cloud */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              {filteredWords.length === 0 ? (
                <motion.div
                  className="text-blue-300 text-2xl font-medium text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No words yet...
                </motion.div>
              ) : (
                <div className="flex flex-wrap gap-3 justify-center items-center max-w-lg">
                  <AnimatePresence mode="popLayout">
                    {wordsWithSizes.map(({ word, size, id }, index) => (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 0.8, scale: 1, y: 0 }}
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
                        className={`${size} font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 cursor-default select-none transition-all uppercase drop-shadow-sm`}
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
