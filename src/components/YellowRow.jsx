import { useEffect, useRef, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';

export default function YellowRow({ isFocused, onFocusChange }) {
  const { yellow, addYellow, removeYellow } = useConstraints();
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
        addYellow(selectedPosition, letter);
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        // Remove last letter from the selected position
        if (yellow[selectedPosition] && yellow[selectedPosition].length > 0) {
          const lastLetter = yellow[selectedPosition][yellow[selectedPosition].length - 1];
          removeYellow(selectedPosition, lastLetter);
        }
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onFocusChange('gray');
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
  }, [isFocused, yellow, addYellow, removeYellow, onFocusChange, selectedPosition]);

  const handleClick = () => {
    onFocusChange('yellow');
  };

  const handleCellClick = (position) => {
    setSelectedPosition(position);
    onFocusChange('yellow');
  };

  const handleLetterRemove = (position, letter) => {
    removeYellow(position, letter);
  };

  return (
    <div
      ref={rowRef}
      onClick={handleClick}
      className={`bg-white rounded-2xl p-4 cursor-pointer transition-all ${
        isFocused
          ? 'border-2 border-yellow-400'
          : 'border-2 border-transparent hover:border-yellow-200'
      }`}
    >
      <div className="text-sm font-medium text-gray-600 mb-2">
        Wrong Position Letters (Yellow)
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((position) => (
          <div
            key={position}
            onClick={(e) => {
              e.stopPropagation();
              handleCellClick(position);
            }}
            className={`min-h-12 bg-gray-50 rounded-lg border-2 p-1 flex flex-col gap-1 hover:border-yellow-300 transition-all cursor-pointer ${
              isFocused && selectedPosition === position
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200'
            }`}
          >
            {yellow[position] && yellow[position].length > 0 ? (
              yellow[position].map((letter, idx) => (
                <div
                  key={`${letter}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLetterRemove(position, letter);
                  }}
                  className="bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-sm font-semibold text-yellow-800 flex items-center justify-between cursor-pointer hover:bg-yellow-200 transition-all group"
                >
                  <span>{letter}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLetterRemove(position, letter);
                    }}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
