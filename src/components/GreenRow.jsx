import { useEffect, useRef } from 'react';
import { useConstraints } from '../context/ConstraintContext';

export default function GreenRow({ isFocused, onFocusChange }) {
  const { green, addGreen, removeGreen } = useConstraints();
  const rowRef = useRef(null);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      // Only handle keyboard input when focused
      if (!isFocused) return;

      // Handle letter keys (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();

        // Find first empty slot
        for (let i = 0; i < 5; i++) {
          if (!green[i]) {
            addGreen(i, letter);
            break;
          }
        }
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        // Find rightmost non-empty position and clear it
        for (let i = 4; i >= 0; i--) {
          if (green[i]) {
            removeGreen(i);
            break;
          }
        }
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onFocusChange('yellow');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, green, addGreen, removeGreen, onFocusChange]);

  const handleClick = () => {
    onFocusChange('green');
  };

  const handleTileClick = (position) => {
    if (green[position]) {
      removeGreen(position);
    }
  };

  return (
    <div
      ref={rowRef}
      onClick={handleClick}
      className={`bg-white rounded-2xl p-4 cursor-pointer transition-all ${
        isFocused
          ? 'border-2 border-green-400'
          : 'border-2 border-transparent hover:border-green-200'
      }`}
    >
      <div className="text-sm font-medium text-gray-600 mb-2">
        Correct Letters (Green)
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((position) => (
          <div
            key={position}
            onClick={(e) => {
              e.stopPropagation();
              handleTileClick(position);
            }}
            className="aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center text-2xl font-bold relative group hover:border-green-300 transition-all"
          >
            {green[position] && (
              <>
                <span className="text-green-600">{green[position]}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGreen(position);
                  }}
                  className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
