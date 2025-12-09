/**
 * KEYBOARD COMPONENT
 *
 * Visual QWERTY keyboard that displays the status of each letter.
 * This is a read-only display component - you can't click the keys to type.
 *
 * Color coding matches Wordle:
 * - Green: Letter is in the word AND in the correct position
 * - Yellow: Letter is in the word but in the wrong position
 * - Gray: Letter is NOT in the word
 * - Default (light gray): Letter hasn't been used yet
 *
 * Priority order: If a letter is both green and yellow (e.g., multiple
 * instances of the same letter), green takes priority in the display.
 *
 * Features:
 * - Standard QWERTY layout (3 rows)
 * - Auto-updates colors as you add constraints
 * - Clear All button with trash icon
 * - Keyboard shortcut hints at the bottom
 */

import { useMemo } from 'react';
import { useConstraints } from '../context/ConstraintContext';

// Standard QWERTY keyboard layout (3 rows)
const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function Keyboard() {
  const { green, yellow, gray, clearAll } = useConstraints();

  // ========================================
  // COLOR LOGIC
  // ========================================

  // Build a map of letter -> color based on constraints
  // This recalculates whenever constraints change (useMemo for performance)
  const getLetterColor = useMemo(() => {
    const colorMap = {};

    // Green letters (highest priority)
    // If a letter is green anywhere, show it as green on the keyboard
    Object.values(green).forEach(letter => {
      if (letter) {
        colorMap[letter] = 'green';
      }
    });

    // Yellow letters (medium priority)
    // Only set to yellow if not already green
    Object.values(yellow).forEach(arr => {
      arr.forEach(letter => {
        if (!colorMap[letter]) {
          colorMap[letter] = 'yellow';
        }
      });
    });

    // Gray letters (lowest priority)
    // Only set to gray if not already green or yellow
    gray.forEach(letter => {
      if (!colorMap[letter]) {
        colorMap[letter] = 'gray';
      }
    });

    // Return a function that looks up the color for any letter
    return (letter) => colorMap[letter] || 'default';
  }, [green, yellow, gray]);

  // ========================================
  // STYLING
  // ========================================

  // Returns Tailwind classes for a key based on its color
  const getKeyClasses = (letter) => {
    const color = getLetterColor(letter);

    const baseClasses = 'px-4 py-3 rounded-lg font-bold text-base transition-all shadow-md hover:shadow-lg transform hover:scale-105';

    switch (color) {
      case 'green':
        return `${baseClasses} bg-gradient-to-br from-green-400 to-green-600 text-white`;
      case 'yellow':
        return `${baseClasses} bg-gradient-to-br from-yellow-300 to-yellow-500 text-white`;
      case 'gray':
        return `${baseClasses} bg-gradient-to-br from-gray-400 to-gray-600 text-white`;
      default:
        return `${baseClasses} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300`;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="bg-white rounded-2xl px-8 py-16 shadow-lg border-4 border-pink-300 hover:border-pink-400 transition-all">
      {/* Keyboard layout: 3 rows in QWERTY format */}
      <div className="flex flex-col gap-4 pt-12">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2.5">
            {row.map((letter) => (
              <div
                key={letter}
                className={getKeyClasses(letter)}
                style={{ minWidth: '40px', textAlign: 'center' }}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Clear All button and keyboard shortcut hints */}
      <div className="mt-16 space-y-6">
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="px-12 py-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-lg"
          >
            🗑️ Clear All
          </button>
        </div>
        <div className="text-base text-gray-400 text-center flex justify-center gap-8">
          <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs">ESC</kbd> to clear all</div>
          <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs">Ctrl+Z</kbd> to undo</div>
        </div>
      </div>
    </div>
  );
}
