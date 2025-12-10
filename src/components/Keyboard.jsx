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
  const { green, yellow, gray } = useConstraints();

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

    const baseClasses = 'px-10 py-8 rounded-lg font-bold text-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105';

    switch (color) {
      case 'green':
        return `${baseClasses} bg-gradient-to-br from-green-400 to-green-600 text-white`;
      case 'yellow':
        return `${baseClasses} bg-gradient-to-br from-yellow-300 to-yellow-500 text-white`;
      case 'gray':
        return `${baseClasses} bg-gradient-to-br from-gray-400 to-gray-600 text-white`;
      default:
        return `${baseClasses} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-500 dark:hover:to-gray-600`;
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-4 border-pink-300 dark:border-purple-600 hover:border-pink-400 dark:hover:border-purple-500 transition-all"
      style={{ padding: '24px' }}
    >
      {/* Keyboard layout: 3 rows in QWERTY format */}
      <div className="flex flex-col gap-4">
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
    </div>
  );
}
