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

export default function WordCloud() {
  const { filteredWords } = useConstraints();

  // Assign random font sizes to words
  const wordsWithSizes = useMemo(() => {
    return filteredWords.map((word, index) => ({
      word,
      size: FONT_SIZES[Math.floor(Math.random() * FONT_SIZES.length)],
      id: `${word}-${index}`
    }));
  }, [filteredWords]);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 h-full overflow-auto">
      {filteredWords.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-2xl font-medium text-center">
            No available words
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <AnimatePresence mode="popLayout">
            {wordsWithSizes.map(({ word, size, id }) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.75, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  layout: { duration: 0.3 }
                }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className={`${size} font-semibold text-gray-700 cursor-default select-none transition-all uppercase`}
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
