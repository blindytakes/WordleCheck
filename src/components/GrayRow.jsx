/**
 * GRAY ROW COMPONENT
 *
 * Input row for gray letters (letters NOT in the word at all).
 * This is the simplest of the three rows - just a flat list of excluded letters.
 *
 * Key difference from other rows: No position tracking needed.
 * Just type letters to add them to the "not in word" list.
 *
 * Features:
 * - Simple list of gray letters (no positions)
 * - Letters displayed as large badges in a flex container
 * - Click any letter to remove it
 * - Backspace removes the most recently added letter
 * - Error validation (can't add a letter that's already green/yellow)
 *
 * Keyboard shortcuts:
 * - A-Z: Add a letter to the gray list
 * - Backspace: Remove last letter from the list
 * - Tab: Cycle back to GreenRow
 *
 * Props:
 * - isFocused: Whether this row has keyboard focus
 * - onFocusChange: Callback to change which row is focused
 */

import { useEffect, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';

export default function GrayRow({ isFocused, onFocusChange }) {
  const { gray, addGray, removeGray } = useConstraints();

  // Error message shown when validation fails (e.g., letter is already green/yellow)
  const [errorMessage, setErrorMessage] = useState(null);

  // ========================================
  // KEYBOARD INPUT HANDLING
  // ========================================

  // Listen for keyboard input when this row is focused
  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      // Handle letter keys (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        const result = addGray(letter);

        // Show error if validation failed (letter is already green/yellow)
        if (result && !result.success) {
          setErrorMessage(result.error);
        }
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        // Remove last letter from list
        if (gray.length > 0) {
          const lastLetter = gray[gray.length - 1];
          removeGray(lastLetter);
        }
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onFocusChange('green'); // Cycle back to green
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, gray, addGray, removeGray, onFocusChange]);

  // ========================================
  // MOUSE CLICK HANDLERS
  // ========================================

  // When clicking anywhere in the row, focus it
  const handleClick = () => {
    onFocusChange('gray');
  };

  // When clicking a letter badge, remove that letter
  const handleLetterRemove = (letter) => {
    removeGray(letter);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    // Outer container: Changes border color when focused
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl cursor-pointer transition-all relative shadow-lg border-4 ${
        isFocused
          ? 'border-gray-900 shadow-gray-200/50' // <<< Focused border is now gray-900
          : 'border-gray-500 hover:border-gray-900 hover:shadow-xl' // <<< Default/Hover borders are a dark gray/gray-900
      }`}
    >
      {/* Error message (shown at top when validation fails) */}
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div className="p-6 pb-8">
        {/* Row title */}
        <div className="text-base font-semibold text-gray-600 mb-3 text-center">
          Incorrect Letters 
        </div>
        {/* Letter list container (flex wrap for dynamic layout) */}
        <div className="min-h-24 bg-gray-50 rounded-xl border-2 border-gray-200 p-4 flex flex-wrap gap-2 justify-center items-center">
          {gray.length === 0 ? (
            <div className="text-gray-400 text-base">Enter Incorrect Letters Here</div>
          ) : (
            gray.map((letter, idx) => (
              <div
                key={`${letter}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLetterRemove(letter);
                }}
                className="bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-300 rounded-lg px-8 py-6 text-4xl font-bold text-gray-700 flex items-center justify-center cursor-pointer hover:from-gray-300 hover:to-gray-400 transition-all group shadow-md hover:shadow-lg relative"
              >
                <span>{letter}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLetterRemove(letter);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
