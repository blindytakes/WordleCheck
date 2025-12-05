import { useEffect, useRef, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';

export default function GreenRow({ isFocused, onFocusChange }) {
  const { green, addGreen, removeGreen } = useConstraints();
  const rowRef = useRef(null);
  const [selectedPosition, setSelectedPosition] = useState(0);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      // Only handle keyboard input when focused
      if (!isFocused) return;

      // Handle letter keys (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();

        // Add to the selected position
        addGreen(selectedPosition, letter);

        // Move to next position if not at the end
        if (selectedPosition < 4) {
          setSelectedPosition(selectedPosition + 1);
        }
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        // Clear the selected position
        if (green[selectedPosition]) {
          removeGreen(selectedPosition);
        } else if (selectedPosition > 0) {
          // If current position is empty, go back and clear previous
          setSelectedPosition(selectedPosition - 1);
          removeGreen(selectedPosition - 1);
        }
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onFocusChange('yellow');
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
  }, [isFocused, green, addGreen, removeGreen, onFocusChange, selectedPosition]);

  const handleClick = () => {
    onFocusChange('green');
  };

  const handleTileClick = (position) => {
    setSelectedPosition(position);
    onFocusChange('green');
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
            className={`aspect-square bg-gray-50 rounded-lg border-2 flex items-center justify-center text-2xl font-bold relative group hover:border-green-300 transition-all cursor-pointer ${
              isFocused && selectedPosition === position
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
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
