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

  // Helper to check if letter is in green
  const isLetterInGreen = useCallback((letter) => {
    return Object.values(green).some(l => l === letter.toUpperCase());
  }, [green]);

  // Helper to check if letter is in yellow
  const isLetterInYellow = useCallback((letter) => {
    return Object.values(yellow).some(arr => arr.includes(letter.toUpperCase()));
  }, [yellow]);

  // Green letter actions
  const addGreen = useCallback((position, letter) => {
    const upperLetter = letter.toUpperCase();

    setGreen(prev => ({
      ...prev,
      [position]: upperLetter
    }));

    // Automatically remove from gray if it's there
    setGray(prev => prev.filter(l => l !== upperLetter));
  }, []);

  const removeGreen = useCallback((position) => {
    setGreen(prev => ({
      ...prev,
      [position]: null
    }));
  }, []);

  // Yellow letter actions
  const addYellow = useCallback((position, letter) => {
    setYellow(prev => {
      const current = prev[position];
      const upperLetter = letter.toUpperCase();

      // Prevent duplicates in the same position
      if (current.includes(upperLetter)) {
        return prev;
      }

      return {
        ...prev,
        [position]: [...current, upperLetter]
      };
    });

    // Automatically remove from gray if it's there
    const upperLetter = letter.toUpperCase();
    setGray(prev => prev.filter(l => l !== upperLetter));
  }, []);

  const removeYellow = useCallback((position, letter) => {
    setYellow(prev => ({
      ...prev,
      [position]: prev[position].filter(l => l !== letter)
    }));
  }, []);

  // Gray letter actions - returns validation result
  const addGray = useCallback((letter) => {
    const upperLetter = letter.toUpperCase();

    // Check if letter is in green or yellow
    const inGreen = Object.values(green).some(l => l === upperLetter);
    const inYellow = Object.values(yellow).some(arr => arr.includes(upperLetter));

    if (inGreen || inYellow) {
      return { success: false, error: 'This letter is already in the word' };
    }

    setGray(prev => {
      // Prevent duplicates
      if (prev.includes(upperLetter)) {
        return prev;
      }
      return [...prev, upperLetter];
    });

    return { success: true };
  }, [green, yellow]);

  const removeGray = useCallback((letter) => {
    setGray(prev => prev.filter(l => l !== letter));
  }, []);

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
    removeGray
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
