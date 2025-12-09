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

/**
 * AppContent - The main app UI
 * Separated from App so it can use the useConstraints hook
 */
function AppContent() {
  // Track which row is currently focused (for keyboard input)
  const [focusedRow, setFocusedRow] = useState('green');

  // Get global actions from context
  const { undo } = useConstraints();

  // Called by rows when they receive focus
  const handleFocusChange = (row) => {
    setFocusedRow(row);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50">
      {/* Main container with fade-in animation */}
      <motion.div
        className="w-full mx-auto h-screen pt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Header />

        {/* Two-column layout: Input panel (left) + Word cloud (right) */}
        <div className="flex justify-center items-center gap-12 h-[calc(100%-120px)] max-w-[1700px] mx-auto px-4">
          {/* Left Panel - Input rows and keyboard (580px fixed width) */}
          <motion.div
            className="flex-shrink-0 w-[580px] flex flex-col gap-4"
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
            <Keyboard />
          </motion.div>

          {/* Right Panel - Word cloud display (990px fixed width) */}
          <motion.div
            className="flex-shrink-0 w-[990px] h-full"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <WordCloud />
          </motion.div>
        </div>
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
