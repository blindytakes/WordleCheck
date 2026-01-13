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
 * - Tab navigation (move to next position on desktop, move to next row on mobile)
 * - Only listens when row is focused
 *
 * @param {object} config - Configuration object
 * @param {boolean} config.isFocused - Whether this row has keyboard focus
 * @param {function} config.onLetterInput - Called when a letter is typed (letter)
 * @param {function} config.onBackspace - Called when backspace is pressed
 * @param {function} config.onTabPress - Called when tab is pressed (row change)
 * @param {function} config.onTabNavigate - Called when tab moves to next position (desktop only)
 * @param {function} config.onTabNavigateReverse - Called when shift+tab moves to previous position (desktop only)
 * @param {function} config.onEscape - Called when escape key is pressed (to unfocus)
 * @param {boolean} config.hasPositions - Whether this row has positions (enables arrow keys)
 * @param {number} config.selectedPosition - Current selected position (for positioned rows)
 * @param {function} config.onPositionChange - Called when position changes via arrows
 * @param {number} config.maxPosition - Maximum position index (default: 4)
 * @param {boolean} config.isDesktopTabNavigation - Enable per-position tab navigation (desktop only)
 *
 * @example
 * // Green Row (positioned, desktop tab navigation)
 * useKeyboardInput({
 *   isFocused,
 *   hasPositions: true,
 *   selectedPosition,
 *   onPositionChange: setSelectedPosition,
 *   onLetterInput: (letter) => addGreen(selectedPosition, letter),
 *   onBackspace: () => removeGreen(selectedPosition),
 *   onTabPress: () => onFocusChange('yellow', 0),
 *   onTabNavigate: handleTabNavigate,
 *   isDesktopTabNavigation: !isTouchDevice
 * });
 *
 * @example
 * // Gray Row (non-positioned)
 * useKeyboardInput({
 *   isFocused,
 *   hasPositions: false,
 *   onLetterInput: (letter) => addGray(letter),
 *   onBackspace: () => removeGray(lastLetter),
 *   onTabPress: () => onFocusChange('green', 0)
 * });
 */

import { useEffect } from 'react';

export default function useKeyboardInput({
  isFocused,
  onLetterInput,
  onBackspace,
  onTabPress,
  onTabNavigate = null,
  onTabNavigateReverse = null,
  onEscape = null,
  hasPositions = false,
  selectedPosition = 0,
  onPositionChange = null,
  maxPosition = 4,
  isDesktopTabNavigation = false,
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

      // Handle Tab (forward and reverse)
      if (e.key === 'Tab') {
        e.preventDefault();

        if (e.shiftKey) {
          // Shift+Tab: Reverse navigation
          if (isDesktopTabNavigation && onTabNavigateReverse) {
            onTabNavigateReverse();
          } else {
            // Mobile: Move to previous row immediately (implement later if needed)
            onTabPress();
          }
        } else {
          // Tab: Forward navigation
          if (isDesktopTabNavigation && onTabNavigate) {
            onTabNavigate();
          } else {
            // Mobile: Move to next row immediately
            onTabPress();
          }
        }
      }

      // Handle Escape (unfocus)
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
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
    onTabNavigate,
    onTabNavigateReverse,
    onEscape,
    hasPositions,
    selectedPosition,
    onPositionChange,
    maxPosition,
    isDesktopTabNavigation,
  ]);
}
