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

import { useState, useRef } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';
import useTouchDevice from '../hooks/useTouchDevice';
import useKeyboardInput from '../hooks/useKeyboardInput';
import { MOBILE_INPUT_PROPS } from '../constants';
import { validateLetter } from '../utils/validateLetter';

export default function GrayRow({ isFocused, onFocusChange }) {
  const { gray, addGray, removeGray } = useConstraints();
  const isTouchDevice = useTouchDevice();
  const inputRef = useRef(null);

  // Error message shown when validation fails (e.g., letter is already green/yellow)
  const [errorMessage, setErrorMessage] = useState(null);

  // ========================================
  // KEYBOARD INPUT HANDLING (using custom hook)
  // ========================================

  // Handle letter input: add to gray list with validation
  const handleLetterInput = (letter) => {
    const result = addGray(letter);

    // Show error if validation failed (letter is already green/yellow)
    if (result && !result.success) {
      setErrorMessage(result.error);
    } else {
      setErrorMessage(null);
    }
  };

  // Handle backspace: remove last letter from list
  const handleBackspace = () => {
    if (gray.length > 0) {
      const lastLetter = gray[gray.length - 1];
      removeGray(lastLetter);
    }
  };

  // Use consolidated keyboard handling hook (no positions for gray row)
  useKeyboardInput({
    isFocused,
    hasPositions: false,
    onLetterInput: handleLetterInput,
    onBackspace: handleBackspace,
    onTabPress: () => onFocusChange('green'), // Cycle back to green
  });

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
      className={`bg-white dark:bg-gray-800 rounded-2xl cursor-pointer transition-all relative shadow-lg border-4 ${
        isFocused
          ? 'border-gray-900 dark:border-gray-400 shadow-gray-200/50 dark:shadow-gray-900/50'
          : 'border-gray-500 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400 hover:shadow-xl'
      }`}
    >
      {/* Error message (shown at top when validation fails) */}
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div className="p-6 pb-8">
        {/* Row title */}
        <div className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-3 text-center">
          Incorrect Letters
        </div>
        {/* Letter list container (flex wrap for dynamic layout) */}
        <div
          className="min-h-24 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 flex flex-wrap gap-2 justify-center items-center relative"
          onClick={() => {
            onFocusChange('gray');
            if (isTouchDevice && inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          {/* Hidden input for mobile keyboard trigger */}
          {isTouchDevice && (
            <input
              ref={inputRef}
              {...MOBILE_INPUT_PROPS}
              value=""
              onChange={(e) => {
                const letter = validateLetter(e.target.value);
                if (letter) {
                  const result = addGray(letter);
                  if (result && !result.success) {
                    setErrorMessage(result.error);
                  } else {
                    setErrorMessage(null);
                  }
                  e.target.value = ''; // Clear input for next letter
                }
              }}
              onFocus={() => {
                onFocusChange('gray');
              }}
              className="absolute opacity-0 pointer-events-none w-0 h-0"
              aria-label="Type letters to add"
            />
          )}
          {gray.length === 0 ? (
            <div className="text-gray-400 dark:text-gray-500 text-base">
              {isTouchDevice ? 'Tap to add letters' : 'Enter Incorrect Letters Here'}
            </div>
          ) : (
            gray.map((letter, idx) => (
              <div
                key={`${letter}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLetterRemove(letter);
                }}
                className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-500 dark:to-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-8 py-6 text-4xl font-bold text-gray-700 dark:text-gray-100 flex items-center justify-center cursor-pointer hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-400 dark:hover:to-gray-500 transition-all group shadow-md hover:shadow-lg relative"
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
