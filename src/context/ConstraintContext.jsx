/**
 * CONSTRAINT CONTEXT - Global State Management
 *
 * This is the "brain" of the app - it manages all the letter constraints
 * and keeps track of which words are still possible.
 *
 * What it does:
 * - Stores green, yellow, and gray letter constraints
 * - Automatically filters the word list when constraints change
 * - Provides functions to add/remove letters from each category
 * - Implements undo functionality (stores last 20 states)
 * - Validates constraints (e.g., can't add a green letter to gray)
 *
 * React Context Pattern:
 * - ConstraintProvider wraps the app and provides the state
 * - useConstraints() hook lets any component access the state
 * - This avoids "prop drilling" (passing props through many components)
 */

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { SOLUTIONS_LIST } from '../data/solutions';
import { filterWordList } from '../utils/filterLogic';

const ConstraintContext = createContext();

export function ConstraintProvider({ children }) {
  // ========================================
  // STATE: Store all constraint data
  // ========================================

  // Green letters: { 0: 'A', 1: null, 2: 'T', ... }
  // Position -> Letter (single letter per position)
  const [green, setGreen] = useState({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null
  });

  // Yellow letters: { 0: ['A', 'E'], 1: [], 2: ['T'], ... }
  // Position -> Array of letters (multiple letters can be wrong at the same position)
  const [yellow, setYellow] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: []
  });

  // Gray letters: ['A', 'B', 'C']
  // Simple array of letters that are NOT in the word
  const [gray, setGray] = useState([]);

  // History for undo functionality (keeps last 20 states)
  // Each entry is a snapshot: { green: {...}, yellow: {...}, gray: [...] }
  const [history, setHistory] = useState([]);

  // Filtered words based on current constraints
  // Starts with all ~2,300 words, gets smaller as you add constraints
  const [filteredWords, setFilteredWords] = useState(SOLUTIONS_LIST);

  // ========================================
  // COMPUTED VALUES: Automatically recalculate when state changes
  // ========================================

  // Check if any constraints are set (used to show all words vs filtered words)
  const hasConstraints = useMemo(() => {
    const hasGreen = Object.values(green).some(v => v !== null);
    const hasYellow = Object.values(yellow).some(arr => arr.length > 0);
    const hasGray = gray.length > 0;
    return hasGreen || hasYellow || hasGray;
  }, [green, yellow, gray]);

  // ========================================
  // SIDE EFFECTS: React to state changes
  // ========================================

  // Update filtered words whenever constraints change
  // This runs automatically every time green, yellow, or gray changes
  useEffect(() => {
    if (!hasConstraints) {
      setFilteredWords(SOLUTIONS_LIST);
      return;
    }

    const constraints = { green, yellow, gray };
    const filtered = filterWordList(constraints, SOLUTIONS_LIST);
    setFilteredWords(filtered);
  }, [green, yellow, gray, hasConstraints]);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  // Save current state to history (for undo functionality)
  // Called before any state change so we can undo back to this point
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev, { green, yellow, gray }];
      // Keep only last 20 states
      return newHistory.slice(-20);
    });
  }, [green, yellow, gray]);

  // ========================================
  // GREEN LETTER ACTIONS
  // ========================================

  // Add a green letter at a specific position (0-4)
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

  // ========================================
  // YELLOW LETTER ACTIONS
  // ========================================

  // Add a yellow letter at a position (means: letter is in word, but NOT at this position)
  // Returns { success: true/false, error?: string } for validation feedback
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

  // ========================================
  // GRAY LETTER ACTIONS
  // ========================================

  // Add a gray letter (means: letter is NOT in the word at all)
  // Returns { success: true/false, error?: string } for validation feedback
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

  // ========================================
  // UTILITY ACTIONS
  // ========================================

  // Undo last action - restores previous state from history
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

  // ========================================
  // CONTEXT VALUE: Everything we want to share with components
  // ========================================

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

/**
 * Custom Hook: useConstraints()
 *
 * Use this in any component to access the constraint state and actions.
 * Example: const { green, addGreen, filteredWords } = useConstraints();
 *
 * NOTE: This hook must be used inside a component that's wrapped by ConstraintProvider,
 * otherwise it will throw an error.
 */
export function useConstraints() {
  const context = useContext(ConstraintContext);
  if (!context) {
    throw new Error('useConstraints must be used within a ConstraintProvider');
  }
  return context;
}
