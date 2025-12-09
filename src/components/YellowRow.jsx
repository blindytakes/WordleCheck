/**
 * YELLOW ROW COMPONENT
 *
 * Input row for yellow letters (correct letters but wrong positions).
 * This is for letters you know are in the word, but NOT at specific positions.
 *
 * Key difference from GreenRow: Multiple letters can be added to each position.
 * For example, if you've tried 'A' and 'E' at position 1 and both were yellow,
 * you can add both letters to position 1.
 *
 * Features:
 * - 5 cells representing positions 0-4
 * - Multiple letters per position allowed (stacked vertically)
 * - Keyboard navigation (arrow keys, tab to move to next row)
 * - Click any letter to remove it
 * - Backspace removes the last letter in the selected position
 * - Error validation (can't add a letter that's already green at this position)
 *
 * Keyboard shortcuts:
 * - A-Z: Add a letter to the selected position
 * - Backspace: Remove last letter from selected position
 * - Arrow Left/Right: Navigate between positions
 * - Tab: Move focus to GrayRow
 *
 * Props:
 * - isFocused: Whether this row has keyboard focus
 * - onFocusChange: Callback to change which row is focused
 */

import { useEffect, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';

export default function YellowRow({ isFocused, onFocusChange }) {
  const { yellow, addYellow, removeYellow } = useConstraints();

  // Track which position (0-4) is currently selected
  const [selectedPosition, setSelectedPosition] = useState(0);

  // Error message shown when validation fails (e.g., letter is already green)
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

        // Add to the selected position (may return error if validation fails)
        const result = addYellow(selectedPosition, letter);

        if (result.success) {
          setErrorMessage(null);
        } else if (result.error) {
          setErrorMessage(result.error);
        }
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        // Remove last letter from the selected position
        if (yellow[selectedPosition] && yellow[selectedPosition].length > 0) {
          const lastLetter = yellow[selectedPosition][yellow[selectedPosition].length - 1];
          removeYellow(selectedPosition, lastLetter);
        }
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onFocusChange('gray');
      }

      // Handle Arrow keys for navigation
      if (e.key === 'ArrowLeft' && selectedPosition > 0) {
        e.preventDefault();
        setSelectedPosition(selectedPosition - 1);
      }
      if (e.key === 'ArrowRight' && selectedPosition < 4) {
        e.preventDefault();
        setSelectedPosition(selectedPosition + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, yellow, addYellow, removeYellow, onFocusChange, selectedPosition]);

  // ========================================
  // MOUSE CLICK HANDLERS
  // ========================================

  // When clicking anywhere in the row, focus it
  const handleClick = () => {
    onFocusChange('yellow');
  };

  // When clicking a specific cell, select that position and focus the row
  const handleCellClick = (position) => {
    setSelectedPosition(position);
    onFocusChange('yellow');
  };

  // When clicking a letter badge, remove that letter
  const handleLetterRemove = (position, letter) => {
    removeYellow(position, letter);
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
          ? 'border-yellow-400 shadow-yellow-200/50'
          : 'border-yellow-300 hover:border-yellow-400 hover:shadow-xl'
      }`}
      style={{ padding: '20px' }}
    >
      {/* Error message (shown at top when validation fails) */}
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div>
        {/* Row title */}
        <div className="text-base font-semibold text-gray-600 mb-3 text-center">
          Correct Letters, Wrong Position (Yellow)
        </div>
        <div className="pb-8">
          {/* Position labels (1-5) */}
          <div className="grid grid-cols-5 gap-3 mb-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="text-center text-sm font-bold text-gray-500">
              {num}
            </div>
          ))}
        </div>
        {/* Cell grid: 5 cells that can hold multiple letters each */}
        <div className="grid grid-cols-5 gap-3">
          {[0, 1, 2, 3, 4].map((position) => (
            <div
              key={position}
              onClick={(e) => {
                e.stopPropagation();
                handleCellClick(position);
              }}
              className={`aspect-square bg-gray-50 rounded-xl border-2 p-2 flex flex-col gap-1 items-center justify-center hover:border-yellow-300 transition-all cursor-pointer shadow-md hover:shadow-lg ${
                isFocused && selectedPosition === position
                  ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-200'
                  : 'border-gray-200'
              }`}
            >
              {yellow[position] && yellow[position].length > 0 ? (
                yellow[position].map((letter, idx) => (
                  <div
                    key={`${letter}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLetterRemove(position, letter);
                    }}
                    className="bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300 rounded px-4 py-2 text-lg font-bold text-yellow-800 flex items-center justify-center cursor-pointer hover:from-yellow-200 hover:to-yellow-300 transition-all group shadow-sm hover:shadow-md relative w-full"
                  >
                    <span>{letter}</span>
                    <span className="absolute right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ✕
                    </span>
                  </div>
                ))
              ) : null}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
