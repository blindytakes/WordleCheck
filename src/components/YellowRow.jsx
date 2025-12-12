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

import { useState, useRef } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';
import useTouchDevice from '../hooks/useTouchDevice';
import useKeyboardInput from '../hooks/useKeyboardInput';
import { POSITION_INDICES, POSITION_LABELS } from '../constants';

export default function YellowRow({ isFocused, onFocusChange }) {
  const { yellow, addYellow, removeYellow } = useConstraints();
  const isTouchDevice = useTouchDevice();
  const inputRefs = useRef([]);

  // Track which position (0-4) is currently selected
  const [selectedPosition, setSelectedPosition] = useState(0);

  // Error message shown when validation fails (e.g., letter is already green)
  const [errorMessage, setErrorMessage] = useState(null);

  // ========================================
  // KEYBOARD INPUT HANDLING (using custom hook)
  // ========================================

  // Handle letter input: add to current position with validation
  const handleLetterInput = (letter) => {
    const result = addYellow(selectedPosition, letter);

    if (result.success) {
      setErrorMessage(null);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  // Handle backspace: remove last letter from current position
  const handleBackspace = () => {
    if (yellow[selectedPosition] && yellow[selectedPosition].length > 0) {
      const lastLetter = yellow[selectedPosition][yellow[selectedPosition].length - 1];
      removeYellow(selectedPosition, lastLetter);
    }
  };

  // Use consolidated keyboard handling hook
  useKeyboardInput({
    isFocused,
    hasPositions: true,
    selectedPosition,
    onPositionChange: setSelectedPosition,
    onLetterInput: handleLetterInput,
    onBackspace: handleBackspace,
    onTabPress: () => onFocusChange('gray'),
  });

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
      className={`bg-white dark:bg-gray-800 rounded-2xl cursor-pointer transition-all relative shadow-lg border-4 ${
        isFocused
          ? 'border-yellow-400 dark:border-yellow-500 shadow-yellow-200/50 dark:shadow-yellow-900/50'
          : 'border-yellow-300 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-500 hover:shadow-xl'
      }`}
      style={{ padding: '20px' }}
    >
      {/* Error message (shown at top when validation fails) */}
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div>
        {/* Row title */}
        <div className="text-base font-semibold text-yellow-600 dark:text-yellow-400 mb-3 text-center">
          Correct Letters, Wrong Position (Yellow)
        </div>
        <div className="pb-8">
          {/* Position labels (1-5) */}
          <div className="grid grid-cols-5 gap-3 mb-2">
          {POSITION_LABELS.map((num) => (
            <div key={num} className="text-center text-sm font-bold text-gray-500 dark:text-gray-400">
              {num}
            </div>
          ))}
        </div>
        {/* Cell grid: 5 cells that can hold multiple letters each */}
        <div className="grid grid-cols-5 gap-3">
          {POSITION_INDICES.map((position) => (
            <div
              key={position}
              onClick={(e) => {
                e.stopPropagation();
                handleCellClick(position);
                if (isTouchDevice && inputRefs.current[position]) {
                  inputRefs.current[position].focus();
                }
              }}
              className={`min-h-[80px] h-auto bg-gray-50 dark:bg-gray-700 rounded-xl border-2 p-2 flex flex-col gap-1 items-center justify-start hover:border-yellow-300 dark:hover:border-yellow-500 transition-all cursor-pointer shadow-md hover:shadow-lg ${
                isFocused && selectedPosition === position
                  ? 'border-yellow-500 dark:border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 shadow-yellow-200 dark:shadow-yellow-900'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              {isTouchDevice && (
                // Mobile: Input field at top of cell
                <input
                  ref={(el) => (inputRefs.current[position] = el)}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  maxLength={1}
                  value=""
                  onChange={(e) => {
                    const letter = e.target.value.toUpperCase();
                    if (/^[A-Z]$/.test(letter)) {
                      const result = addYellow(position, letter);
                      if (result.success) {
                        setErrorMessage(null);
                        e.target.value = ''; // Clear input for next letter
                      } else if (result.error) {
                        setErrorMessage(result.error);
                      }
                    }
                  }}
                  onFocus={() => {
                    setSelectedPosition(position);
                    onFocusChange('yellow');
                  }}
                  placeholder="+"
                  className="w-full h-8 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-center text-lg font-bold outline-none focus:border-yellow-400"
                />
              )}
              {yellow[position] && yellow[position].length > 0 ? (
                yellow[position].map((letter, idx) => (
                  <div
                    key={`${letter}-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLetterRemove(position, letter);
                    }}
                    className="bg-gradient-to-br from-amber-200 to-amber-300 border border-amber-400 rounded px-2 py-1 text-base font-bold text-amber-800 flex items-center justify-center gap-1 cursor-pointer hover:from-amber-300 hover:to-amber-400 active:from-amber-400 active:to-amber-500 transition-all shadow-sm hover:shadow-md relative w-full group"
                  >
                    <span>{letter}</span>
                    <span className={`text-red-600 font-bold text-base ${isTouchDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>✕</span>
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
