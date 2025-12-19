/**
 * MAIN APP COMPONENT
 *
 * This is the root of the application that brings everything together.
 * It sets up the layout, handles global keyboard shortcuts, and manages
 * which input row is currently focused.
 *
 * Layout structure:
 * - Left panel (500px): Input rows (Green, Yellow, Gray) + Keyboard
 * - Right panel (990px): WordCloud showing possible words
 *
 * Global keyboard shortcuts:
 * - Cmd+Z / Ctrl+Z: Undo last action
 *
 * The app is split into two components:
 * - AppContent: The actual app UI (needs access to context)
 * - App: Wrapper that provides the ConstraintContext
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConstraintProvider, useConstraints } from './context/ConstraintContext';
import Header from './components/Header';
import GreenRow from './components/GreenRow';
import YellowRow from './components/YellowRow';
import GrayRow from './components/GrayRow';
import Keyboard from './components/Keyboard';
import WordCloud from './components/WordCloud';
import AboutSection from './components/AboutSection';
import useTouchDevice from './hooks/useTouchDevice';
import { useTypingMetrics } from './hooks/useTypingMetrics';
import { getFaro } from './faro';

/**
 * AppContent - The main app UI
 * Separated from App so it can use the useConstraints hook
 */
function AppContent() {
  // Track which row is currently focused (for keyboard input)
  const [focusedRow, setFocusedRow] = useState('green');

  // Detect touch devices to hide visual keyboard on mobile
  const isTouchDevice = useTouchDevice();

  // Get global actions from context
  const { undo } = useConstraints();

  // Initialize typing metrics tracking (for fun!)
  const typingMetrics = useTypingMetrics();

  // Called by rows when they receive focus
  const handleFocusChange = (row) => {
    setFocusedRow(row);
  };

  // Global keyboard shortcuts + typing metrics
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Track typing activity (not shortcuts)
      typingMetrics.onKeyDown(e);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, typingMetrics]);

  // Emit typing metrics to Faro when user leaves
  useEffect(() => {
    const emitMetrics = () => {
      const metrics = typingMetrics.getMetrics();
      const faro = getFaro();

      // Only emit if there was any activity
      if (metrics.lettersTyped > 0 || metrics.constraintsAdded > 0) {
        faro?.api?.pushEvent('typing_session_complete', {
          letters_typed: metrics.lettersTyped,
          backspaces: metrics.backspaces,
          constraints_added: metrics.constraintsAdded,
          constraints_removed: metrics.constraintsRemoved,
          session_duration_ms: metrics.sessionDurationMs,
          editing_ratio: Math.round(metrics.editingRatio * 100) / 100,
        });
      }
    };

    // Handler for visibility change (properly cleanup-able)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        emitMetrics();
      }
    };

    // Emit on page unload
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', emitMetrics);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', emitMetrics);
    };
  }, [typingMetrics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-indigo-200 to-purple-100 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 transition-colors duration-300 overflow-x-hidden">
      <Header />
      {/* Main container with fade-in animation */}
      <motion.div
        className="w-full mx-auto h-screen pt-0 md:pt-16 overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >

        {/* Responsive layout: Stacks vertically on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row justify-center items-start lg:items-center gap-0 lg:gap-20 h-auto lg:h-[calc(100%-120px)] max-w-[1900px] mx-auto px-4 pb-8 overflow-x-hidden">
          {/* Left Panel - Input rows and keyboard (responsive width) */}
          <motion.div
            className="flex-shrink-0 w-full max-w-[580px] lg:w-[580px] lg:mt-12 lg:ml-8 flex flex-col gap-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <GreenRow
              isFocused={focusedRow === 'green'}
              onFocusChange={handleFocusChange}
            />
            <YellowRow
              isFocused={focusedRow === 'yellow'}
              onFocusChange={handleFocusChange}
            />
            <GrayRow
              isFocused={focusedRow === 'gray'}
              onFocusChange={handleFocusChange}
            />
            {/* Only show visual keyboard on desktop (not needed on mobile with native inputs) */}
            {!isTouchDevice && (
              <div className="hidden lg:block">
                <Keyboard />
              </div>
            )}
          </motion.div>

          {/* Right Panel - Word cloud display (responsive width) */}
          <motion.div
            className="flex-shrink-0 w-full max-w-[990px] lg:w-[990px] h-full min-h-[500px]"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <WordCloud />
          </motion.div>
        </div>

        {/* SEO-friendly about section */}
        <AboutSection />
      </motion.div>
    </div>
  );
}

/**
 * App - Root wrapper component
 * Wraps AppContent with ConstraintProvider to give it access to global state
 */
function App() {
  return (
    <ConstraintProvider>
      <AppContent />
    </ConstraintProvider>
  );
}

export default App;
