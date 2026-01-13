/**
 * GREEN ROW COMPONENT
 *
 * Input row for green letters (correct letters in correct positions).
 * This is like filling in the exact spots you know from Wordle's green squares.
 *
 * Features:
 * - 5 tiles representing positions 0-4
 * - Only one letter per position allowed
 * - Keyboard navigation (arrow keys, tab to move to next row)
 * - Auto-advance to next position after typing
 * - Click any tile to select it
 * - Backspace deletes current or previous letter
 *
 * Keyboard shortcuts:
 * - A-Z: Type a letter at the selected position
 * - Backspace: Delete current or previous letter
 * - Arrow Left/Right: Navigate between positions
 * - Tab: Move focus to YellowRow
 *
 * Props:
 * - isFocused: Whether this row has keyboard focus
 * - onFocusChange: Callback to change which row is focused
 */

import { useState, useRef, useCallback } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import useTouchDevice from '../hooks/useTouchDevice';
import useKeyboardInput from '../hooks/useKeyboardInput';
import { POSITION_INDICES, POSITION_LABELS, MOBILE_INPUT_PROPS, MAX_POSITION_INDEX } from '../constants';
import { validateLetter } from '../utils/validateLetter';

export default function GreenRow({ isFocused, focusedPosition, onFocusChange }) {
  const { green, addGreen, removeGreen } = useConstraints();
  const isTouchDevice = useTouchDevice();
  const inputRefs = useRef([]);

  // Track which position (0-4) is currently selected
  // On desktop, use focusedPosition from parent; on mobile, use local state
  const [localPosition, setLocalPosition] = useState(0);
  const selectedPosition = !isTouchDevice && focusedPosition !== null ? focusedPosition : localPosition;

  // Helper to update position (desktop updates parent, mobile updates local state)
  // Wrapped in useCallback to prevent stale closures
  const updatePosition = useCallback((newPosition) => {
    if (!isTouchDevice) {
      onFocusChange('green', newPosition);
    } else {
      setLocalPosition(newPosition);
    }
  }, [isTouchDevice, onFocusChange]);

  // ========================================
  // KEYBOARD INPUT HANDLING (using custom hook)
  // ========================================

  // Handle letter input: add to current position and auto-advance
  const handleLetterInput = (letter) => {
    addGreen(selectedPosition, letter);
    // Move to next position if not at the end
    if (selectedPosition < MAX_POSITION_INDEX) {
      updatePosition(selectedPosition + 1);
    }
  };

  // Handle backspace: clear current or go back and clear previous
  const handleBackspace = () => {
    if (green[selectedPosition]) {
      removeGreen(selectedPosition);
    } else if (selectedPosition > 0) {
      // If current position is empty, go back and clear previous
      updatePosition(selectedPosition - 1);
      removeGreen(selectedPosition - 1);
    }
  };

  // Handle Tab navigation (desktop only: move to next position or next row)
  const handleTabNavigate = useCallback(() => {
    if (selectedPosition < MAX_POSITION_INDEX) {
      // Move to next position within green row
      onFocusChange('green', selectedPosition + 1);
    } else {
      // Move to first position of yellow row
      onFocusChange('yellow', 0);
    }
  }, [selectedPosition, onFocusChange]);

  // Handle Shift+Tab reverse navigation (desktop only: move to previous position or previous row)
  const handleTabNavigateReverse = useCallback(() => {
    if (selectedPosition > 0) {
      // Move to previous position within green row
      onFocusChange('green', selectedPosition - 1);
    } else {
      // Move to last position of gray row (wrap around)
      onFocusChange('gray', 0);
    }
  }, [selectedPosition, onFocusChange]);

  // Handle Escape key (unfocus the row)
  const handleEscape = useCallback(() => {
    // Blur by setting focus to null (requires App.jsx update to handle)
    // For now, just move to green position 0 as a "reset"
    onFocusChange('green', 0);
  }, [onFocusChange]);

  // Use consolidated keyboard handling hook
  useKeyboardInput({
    isFocused,
    hasPositions: true,
    selectedPosition,
    onPositionChange: (pos) => updatePosition(pos),
    onLetterInput: handleLetterInput,
    onBackspace: handleBackspace,
    onTabPress: () => onFocusChange('yellow', 0),
    onTabNavigate: handleTabNavigate,
    onTabNavigateReverse: handleTabNavigateReverse,
    onEscape: handleEscape,
    isDesktopTabNavigation: !isTouchDevice,
  });

  // ========================================
  // MOUSE CLICK HANDLERS
  // ========================================

  // When clicking anywhere in the row, focus it
  const handleClick = () => {
    onFocusChange('green', selectedPosition);
  };

  // When clicking a specific tile, select that position and focus the row
  const handleTileClick = (position) => {
    updatePosition(position);
    onFocusChange('green', position);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    // Outer container: Changes border color when focused
    <div
      onClick={handleClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl cursor-pointer transition-all shadow-lg border-4 ${
        isFocused
          ? 'border-green-400 dark:border-green-500 shadow-green-200/50 dark:shadow-green-900/50'
          : 'border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 hover:shadow-xl'
      }`}
      style={{ padding: '20px' }}
    >
      <div>
        {/* Row title */}
        <div className="text-base font-semibold text-green-600 dark:text-green-400 mb-3 text-center">
          Correct Letters (Green)
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
        {/* Tile grid: 5 letter tiles */}
        <div className="grid grid-cols-5 gap-3">
          {POSITION_INDICES.map((position) => {
            const baseClasses = `aspect-square rounded-xl border-2 flex items-center justify-center text-5xl font-bold relative group transition-all shadow-md hover:shadow-lg ${
              green[position]
                ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-600 text-white'
                : isFocused && selectedPosition === position
                ? 'border-green-500 dark:border-green-400 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-green-200 dark:shadow-green-900'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
            }`;

            return (
              <div
                key={position}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTileClick(position);
                }}
                className={`${baseClasses} cursor-pointer`}
              >
                {/*
                  MOBILE vs DESKTOP INPUT STRATEGY:

                  Mobile (isTouchDevice):
                  - Uses native <input> elements to trigger mobile keyboard
                  - Each tile has its own focusable input
                  - onChange handles validation and auto-advance
                  - Better UX on touchscreens (native keyboard, autocorrect disabled)

                  Desktop (!isTouchDevice):
                  - Uses <div> display-only elements
                  - Keyboard input handled globally via useKeyboardInput hook
                  - Allows arrow key navigation and custom keyboard shortcuts
                  - Cleaner UI without input fields (just letters + delete buttons)

                  Why separate implementations?
                  - Mobile keyboards don't support arrow key navigation
                  - Desktop benefits from global keyboard listener (Tab, arrows, etc.)
                  - Native inputs on mobile provide better accessibility (screen readers, autocomplete)
                */}
                {isTouchDevice ? (
                  // Mobile: Native input element for mobile keyboard support
                  <input
                    ref={(el) => (inputRefs.current[position] = el)}
                    {...MOBILE_INPUT_PROPS}
                    value={green[position] || ''}
                    onChange={(e) => {
                      const letter = validateLetter(e.target.value, true);
                      if (letter !== null) {
                        if (letter) {
                          addGreen(position, letter);
                          // Auto-advance to next input
                          if (position < MAX_POSITION_INDEX && inputRefs.current[position + 1]) {
                            inputRefs.current[position + 1].focus();
                          }
                        } else {
                          removeGreen(position);
                        }
                      }
                    }}
                    onFocus={(e) => {
                      updatePosition(position);
                      onFocusChange('green', position);
                      // Scroll input into view when keyboard appears (with delay for keyboard animation)
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                    className="w-full h-full bg-transparent border-0 outline-none text-center text-5xl font-bold text-white caret-transparent"
                    style={{ caretColor: 'transparent' }}
                  />
                ) : (
                  // Desktop: Display only (keyboard controlled via useKeyboardInput hook)
                  <>
                    {green[position] ? (
                      <>
                        <span>{green[position]}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGreen(position);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-red opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ✕
                        </button>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
