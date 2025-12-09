import { useEffect, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';

export default function GreenRow({ isFocused, onFocusChange }) {
  const { green, addGreen, removeGreen } = useConstraints();
  const [selectedPosition, setSelectedPosition] = useState(0);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
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
      onClick={handleClick}
      className={`bg-white rounded-2xl cursor-pointer transition-all shadow-lg border-4 ${
        isFocused
          ? 'border-green-400 shadow-green-200/50'
          : 'border-green-300 hover:border-green-400 hover:shadow-xl'
      }`}
    >
      <div className="p-6">
        <div className="text-base font-semibold text-gray-600 mb-3">
          Correct Letters (Green)
        </div>
        <div className="pb-8">
          {/* Position labels */}
          <div className="grid grid-cols-5 gap-3 mb-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="text-center text-sm font-bold text-gray-500">
              {num}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[0, 1, 2, 3, 4].map((position) => (
            <div
              key={position}
              onClick={(e) => {
                e.stopPropagation();
                handleTileClick(position);
              }}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center text-5xl font-bold relative group transition-all cursor-pointer shadow-md hover:shadow-lg ${
                green[position]
                  ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-600 text-white'
                  : isFocused && selectedPosition === position
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-green-300'
              }`}
            >
              {green[position] ? (
                <>
                  <span>{green[position]}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGreen(position);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ✕
                  </button>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
