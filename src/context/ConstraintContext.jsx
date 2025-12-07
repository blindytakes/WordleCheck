import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { SOLUTIONS_LIST } from '../data/solutions';
import { filterWordList } from '../utils/filterLogic';

const ConstraintContext = createContext();

export function ConstraintProvider({ children }) {
  // State for constraints
  const [green, setGreen] = useState({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null
  });

  const [yellow, setYellow] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: []
  });

  const [gray, setGray] = useState([]);

  // History for undo functionality (keep last 20 states)
  const [history, setHistory] = useState([]);

  // Filtered words based on constraints (all words initially)
  const [filteredWords, setFilteredWords] = useState(SOLUTIONS_LIST);

  // Check if any constraints are set
  const hasConstraints = useMemo(() => {
    const hasGreen = Object.values(green).some(v => v !== null);
    const hasYellow = Object.values(yellow).some(arr => arr.length > 0);
    const hasGray = gray.length > 0;
    return hasGreen || hasYellow || hasGray;
  }, [green, yellow, gray]);

  // Update filtered words whenever constraints change
  useEffect(() => {
    if (!hasConstraints) {
      setFilteredWords(SOLUTIONS_LIST);
      return;
    }

    const constraints = { green, yellow, gray };
    const filtered = filterWordList(constraints, SOLUTIONS_LIST);
    setFilteredWords(filtered);
  }, [green, yellow, gray, hasConstraints]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev, { green, yellow, gray }];
      // Keep only last 20 states
      return newHistory.slice(-20);
    });
  }, [green, yellow, gray]);

  // Green letter actions
  const addGreen = useCallback((position, letter) => {
    const upperLetter = letter.toUpperCase();

    // Don't save history if letter is already the same
    if (green[position] === upperLetter) {
      return;
    }

    saveToHistory();
    setGreen(prev => ({
      ...prev,
      [position]: upperLetter
    }));

    // Automatically remove from gray if it's there
    setGray(prev => prev.filter(l => l !== upperLetter));
  }, [green, saveToHistory]);

  const removeGreen = useCallback((position) => {
    // Don't save history if position is already empty
    if (green[position] === null) {
      return;
    }

    saveToHistory();
    setGreen(prev => ({
      ...prev,
      [position]: null
    }));
  }, [green, saveToHistory]);

  // Yellow letter actions
  const addYellow = useCallback((position, letter) => {
    const upperLetter = letter.toUpperCase();

    // Check if this letter is already green at this position
    if (green[position] === upperLetter) {
      return { success: false, error: 'This letter is already green at this position' };
    }

    // Check for duplicates in the same position
    if (yellow[position].includes(upperLetter)) {
      return { success: false };
    }

    saveToHistory();
    setYellow(prev => ({
      ...prev,
      [position]: [...prev[position], upperLetter]
    }));

    // Automatically remove from gray if it's there
    setGray(prev => prev.filter(l => l !== upperLetter));

    return { success: true };
  }, [green, yellow, saveToHistory]);

  const removeYellow = useCallback((position, letter) => {
    // Don't save history if letter is not at this position
    if (!yellow[position].includes(letter)) {
      return;
    }

    saveToHistory();
    setYellow(prev => ({
      ...prev,
      [position]: prev[position].filter(l => l !== letter)
    }));
  }, [yellow, saveToHistory]);

  // Gray letter actions - returns validation result
  const addGray = useCallback((letter) => {
    const upperLetter = letter.toUpperCase();

    // Check if letter is in green or yellow
    const inGreen = Object.values(green).some(l => l === upperLetter);
    const inYellow = Object.values(yellow).some(arr => arr.includes(upperLetter));

    if (inGreen || inYellow) {
      return { success: false, error: 'This letter is already in the word' };
    }

    // Don't save history if letter is already in gray
    if (gray.includes(upperLetter)) {
      return { success: false };
    }

    saveToHistory();
    setGray(prev => [...prev, upperLetter]);

    return { success: true };
  }, [green, yellow, gray, saveToHistory]);

  const removeGray = useCallback((letter) => {
    // Don't save history if letter is not in gray
    if (!gray.includes(letter)) {
      return;
    }

    saveToHistory();
    setGray(prev => prev.filter(l => l !== letter));
  }, [gray, saveToHistory]);

  // Undo last action
  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    setGreen(previousState.green);
    setYellow(previousState.yellow);
    setGray(previousState.gray);

    // Remove the last history entry
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  // Clear all constraints
  const clearAll = useCallback(() => {
    saveToHistory();
    setGreen({
      0: null,
      1: null,
      2: null,
      3: null,
      4: null
    });
    setYellow({
      0: [],
      1: [],
      2: [],
      3: [],
      4: []
    });
    setGray([]);
  }, [saveToHistory]);

  const value = {
    green,
    yellow,
    gray,
    filteredWords,
    addGreen,
    removeGreen,
    addYellow,
    removeYellow,
    addGray,
    removeGray,
    clearAll,
    undo
  };

  return (
    <ConstraintContext.Provider value={value}>
      {children}
    </ConstraintContext.Provider>
  );
}

export function useConstraints() {
  const context = useContext(ConstraintContext);
  if (!context) {
    throw new Error('useConstraints must be used within a ConstraintProvider');
  }
  return context;
}
