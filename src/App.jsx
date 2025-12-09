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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 p-8">
      <motion.div
        className="max-w-7xl mx-auto h-[calc(100vh-4rem)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Header />

        <div className="flex gap-8 h-[calc(100%-100px)] pl-48 pr-8 mt-16">
          {/* Left Panel - 45% width */}
          <motion.div
            className="w-[45%] flex flex-col gap-6"
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

          {/* Right Panel - 55% width */}
          <motion.div
            className="w-[55%] h-full"
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
