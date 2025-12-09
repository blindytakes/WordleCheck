import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConstraintProvider, useConstraints } from './context/ConstraintContext';
import Header from './components/Header';
import GreenRow from './components/GreenRow';
import YellowRow from './components/YellowRow';
import GrayRow from './components/GrayRow';
import Keyboard from './components/Keyboard';
import WordCloud from './components/WordCloud';

function AppContent() {
  const [focusedRow, setFocusedRow] = useState('green');
  const { clearAll, undo } = useConstraints();

  const handleFocusChange = (row) => {
    setFocusedRow(row);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // ESC to clear all
      if (e.key === 'Escape') {
        e.preventDefault();
        clearAll();
      }

      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [clearAll, undo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50">
      <motion.div
        className="w-full mx-auto h-screen pt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Header />

        <div className="flex justify-center gap-12 h-[calc(100%-120px)] max-w-[1600px] mx-auto px-4">
          {/* Left Panel - fixed max width */}
          <motion.div
            className="flex-shrink-0 w-[500px] flex flex-col gap-6"
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

          {/* Right Panel - takes remaining space */}
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

function App() {
  return (
    <ConstraintProvider>
      <AppContent />
    </ConstraintProvider>
  );
}

export default App;
