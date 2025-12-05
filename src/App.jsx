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
  const [theme, setTheme] = useState('light');
  const { clearAll, undo } = useConstraints();

  const handleFocusChange = (row) => {
    setFocusedRow(row);
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Header theme={theme} onThemeToggle={handleThemeToggle} />

        <div className="flex gap-6">
          {/* Left Panel - 40% width */}
          <motion.div
            className="w-2/5 flex flex-col gap-4"
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

          {/* Right Panel - 60% width */}
          <motion.div
            className="w-3/5"
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
