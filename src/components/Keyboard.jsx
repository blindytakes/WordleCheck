import { useMemo } from 'react';
import { useConstraints } from '../context/ConstraintContext';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function Keyboard() {
  const { green, yellow, gray } = useConstraints();

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

    const baseClasses = 'px-2 py-3 rounded font-semibold text-sm transition-all';

    switch (color) {
      case 'green':
        return `${baseClasses} bg-green-500 text-white`;
      case 'yellow':
        return `${baseClasses} bg-yellow-400 text-white`;
      case 'gray':
        return `${baseClasses} bg-gray-400 text-white`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800`;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4">
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
    </div>
  );
}
