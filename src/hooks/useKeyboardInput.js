/**
 * KEYBOARD INPUT HOOK
 *
 * Handles keyboard input for row components (GreenRow, YellowRow, GrayRow).
 * Consolidates common keyboard handling logic to avoid duplication.
 *
 * Features:
 * - Letter input (A-Z)
 * - Backspace handling
 * - Arrow navigation (Left/Right for positioned rows)
 * - Tab navigation (move to next row)
 * - Only listens when row is focused
 *
 * @param {object} config - Configuration object
 * @param {boolean} config.isFocused - Whether this row has keyboard focus
 * @param {function} config.onLetterInput - Called when a letter is typed (letter)
 * @param {function} config.onBackspace - Called when backspace is pressed
 * @param {function} config.onTabPress - Called when tab is pressed
 * @param {boolean} config.hasPositions - Whether this row has positions (enables arrow keys)
 * @param {number} config.selectedPosition - Current selected position (for positioned rows)
 * @param {function} config.onPositionChange - Called when position changes via arrows
 * @param {number} config.maxPosition - Maximum position index (default: 4)
 *
 * @example
 * // Green Row (positioned)
 * useKeyboardInput({
 *   isFocused,
 *   hasPositions: true,
 *   selectedPosition,
 *   onPositionChange: setSelectedPosition,
 *   onLetterInput: (letter) => addGreen(selectedPosition, letter),
 *   onBackspace: () => removeGreen(selectedPosition),
 *   onTabPress: () => onFocusChange('yellow')
 * });
 *
 * @example
 * // Gray Row (non-positioned)
 * useKeyboardInput({
 *   isFocused,
 *   hasPositions: false,
 *   onLetterInput: (letter) => addGray(letter),
 *   onBackspace: () => removeGray(lastLetter),
 *   onTabPress: () => onFocusChange('green')
 * });
 */

import { useEffect } from 'react';

export default function useKeyboardInput({
  isFocused,
  onLetterInput,
  onBackspace,
  onTabPress,
  hasPositions = false,
  selectedPosition = 0,
  onPositionChange = null,
  maxPosition = 4,
}) {
  useEffect(() => {
    // Only listen when this row is focused
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      // Handle letter keys (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        onLetterInput(letter);
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onTabPress();
      }

      // Handle Arrow keys (only for positioned rows)
      if (hasPositions && onPositionChange) {
        if (e.key === 'ArrowLeft' && selectedPosition > 0) {
          e.preventDefault();
          onPositionChange(selectedPosition - 1);
        }
        if (e.key === 'ArrowRight' && selectedPosition < maxPosition) {
          e.preventDefault();
          onPositionChange(selectedPosition + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFocused,
    onLetterInput,
    onBackspace,
    onTabPress,
    hasPositions,
    selectedPosition,
    onPositionChange,
    maxPosition,
  ]);
}
