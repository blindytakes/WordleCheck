import { useMemo } from 'react';
import { useConstraints } from '../context/ConstraintContext';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function Keyboard() {
  const { green, yellow, gray, clearAll } = useConstraints();

  // Determine the color for each letter
  const getLetterColor = useMemo(() => {
    const colorMap = {};

    // Green letters (highest priority)
    Object.values(green).forEach(letter => {
      if (letter) {
        colorMap[letter] = 'green';
      }
    });

    // Yellow letters
    Object.values(yellow).forEach(arr => {
      arr.forEach(letter => {
        if (!colorMap[letter]) {
          colorMap[letter] = 'yellow';
        }
      });
    });

    // Gray letters (lowest priority)
    gray.forEach(letter => {
      if (!colorMap[letter]) {
        colorMap[letter] = 'gray';
      }
    });

    return (letter) => colorMap[letter] || 'default';
  }, [green, yellow, gray]);

  const getKeyClasses = (letter) => {
    const color = getLetterColor(letter);

    const baseClasses = 'px-2 py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-105';

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

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="text-sm font-medium text-gray-600 mb-3">
        Keyboard Status
      </div>
      <div className="flex flex-col gap-1">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((letter) => (
              <div
                key={letter}
                className={getKeyClasses(letter)}
                style={{ minWidth: '28px', textAlign: 'center' }}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Clear button and shortcuts */}
      <div className="mt-4 space-y-3">
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            🗑️ Clear All
          </button>
        </div>
        <div className="text-xs text-gray-400 text-center space-y-1">
          <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">ESC</kbd> to clear all</div>
          <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Ctrl+Z</kbd> to undo</div>
        </div>
      </div>
    </div>
  );
}
