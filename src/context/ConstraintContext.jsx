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

  // Initial 40 random words on mount
  const [initialWords] = useState(() => {
    const shuffled = [...SOLUTIONS_LIST].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 40);
  });

  // Filtered words based on constraints
  const [filteredWords, setFilteredWords] = useState(initialWords);

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
      setFilteredWords(initialWords);
      return;
    }

    const constraints = { green, yellow, gray };
    const filtered = filterWordList(constraints, SOLUTIONS_LIST);
    setFilteredWords(filtered.slice(0, 40));
  }, [green, yellow, gray, hasConstraints, initialWords]);

  // Green letter actions
  const addGreen = useCallback((position, letter) => {
    setGreen(prev => ({
      ...prev,
      [position]: letter.toUpperCase()
    }));
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
  }, []);

  const removeYellow = useCallback((position, letter) => {
    setYellow(prev => ({
      ...prev,
      [position]: prev[position].filter(l => l !== letter)
    }));
  }, []);

  // Gray letter actions
  const addGray = useCallback((letter) => {
    setGray(prev => {
      const upperLetter = letter.toUpperCase();
      // Prevent duplicates
      if (prev.includes(upperLetter)) {
        return prev;
      }
      return [...prev, upperLetter];
    });
  }, []);

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
