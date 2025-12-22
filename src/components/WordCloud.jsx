/**
 * WORD CLOUD COMPONENT
 *
 * Displays possible Wordle words in a beautiful fluffy cloud design.
 * This is the main visual output showing which words still match your constraints.
 *
 * Design features:
 * - Fluffy cloud shape made of overlapping gradient circles with blur
 * - Words displayed inside the cloud with random font sizes
 * - Continuous floating animation (cloud gently bobs up and down)
 * - Individual word animations (fade in, scale, rotate on hover)
 * - Shows up to 40 random words if there are more than 40 matches
 * - Word count display above the cloud
 *
 * Performance:
 * - Uses useMemo to prevent unnecessary recalculations
 * - Fisher-Yates shuffle for efficient randomization
 * - AnimatePresence for smooth word transitions
 *
 * Color scheme:
 * - Blue gradients for cloud (white -> blue-50 -> blue-100)
 * - Blue text gradients for words (blue-500 -> blue-700)
 * - Matches the overall pink/blue theme of the app
 */

import { motion } from 'framer-motion';
import { useConstraints } from '../context/ConstraintContext';
import DefinitionModal from './DefinitionModal';
import useTouchDevice from '../hooks/useTouchDevice';
import useResponsive from '../hooks/useResponsive';
import {
  FONT_SIZES_DESKTOP,
  FONT_SIZES_MOBILE,
  MAX_DISPLAY_WORDS_DESKTOP,
  MAX_DISPLAY_WORDS_MOBILE
} from '../constants';
import FooterHint from './FooterHint';
import useDefinition from '../hooks/useDefinition';
import useWordSelection from '../hooks/useWordSelection';
import CloudShape from './CloudShape';
import WordGrid from './WordGrid';

export default function WordCloud() {
  const { filteredWords } = useConstraints();
  const isTouchDevice = useTouchDevice();

  // Consolidated responsive detection (replaces duplicate screen size logic)
  const { isMobileOrTablet } = useResponsive();

  // Device-specific settings
  const FONT_SIZES = isMobileOrTablet ? FONT_SIZES_MOBILE : FONT_SIZES_DESKTOP;
  const MAX_DISPLAY_WORDS = isMobileOrTablet ? MAX_DISPLAY_WORDS_MOBILE : MAX_DISPLAY_WORDS_DESKTOP;

  // Definition hook
  const {
    selectedWord,
    definition,
    isLoadingDefinition,
    definitionError,
    openDefinition,
    closeDefinition
  } = useDefinition();

  // Word selection and sizing hook
  const { wordsWithSizes, isStableMode } = useWordSelection(
    filteredWords,
    FONT_SIZES,
    MAX_DISPLAY_WORDS
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-start mt-6 md:mt-16 lg:mt-20 overflow-visible">
      {/* FLUFFY CLOUD */}
      <CloudShape isTouchDevice={isTouchDevice}>
        <WordGrid
          filteredWords={filteredWords}
          wordsWithSizes={wordsWithSizes}
          isStableMode={isStableMode}
          isTouchDevice={isTouchDevice}
          onWordClick={(word) => openDefinition(word, filteredWords.length, isStableMode)}
        />
      </CloudShape>

      {/* Title: "Wordle Fun" with gradient text (responsive sizing) */}
      <motion.div
        className="text-4xl sm:text-4xl md:text-6xl lg:text-8xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 dark:from-pink-400 dark:via-purple-400 dark:to-blue-400 text-transparent bg-clip-text"
        style={{ marginTop: '140px' }}
        initial={isTouchDevice ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isTouchDevice ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      >
        Wordle Fun
      </motion.div>

      {/* Word count: Shows how many words match the constraints (responsive sizing) */}
      {filteredWords.length > 0 && (
        <motion.div
          className="text-center mt-2 md:mt-4 text-sm sm:text-2xl md:text-4xl lg:text-5xl bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400 text-transparent bg-clip-text font-bold"
          initial={isTouchDevice ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={isTouchDevice ? { duration: 0 } : { delay: 0.5 }}
        >
          {filteredWords.length.toLocaleString()} words
        </motion.div>
      )}

      {/* Definition Modal */}
      {selectedWord && (
        <DefinitionModal
          word={selectedWord}
          definition={definition}
          isLoading={isLoadingDefinition}
          error={definitionError}
          onClose={closeDefinition}
        />
      )}

      {/* Footer Hint */}
      <FooterHint isTouchDevice={isTouchDevice} />
    </div>
  );
}
