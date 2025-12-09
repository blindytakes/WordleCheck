import { useEffect, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';

export default function YellowRow({ isFocused, onFocusChange }) {
  const { yellow, addYellow, removeYellow } = useConstraints();
  const [selectedPosition, setSelectedPosition] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      // Handle letter keys (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();

        // Add to the selected position
        const result = addYellow(selectedPosition, letter);

        if (result.success) {
          setErrorMessage(null);
        } else if (result.error) {
          setErrorMessage(result.error);
        }
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
      onClick={handleClick}
      className={`bg-white rounded-2xl cursor-pointer transition-all relative shadow-lg border-4 ${
        isFocused
          ? 'border-yellow-400 shadow-yellow-200/50'
          : 'border-yellow-300 hover:border-yellow-400 hover:shadow-xl'
      }`}
    >
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div className="p-6">
        <div className="text-base font-semibold text-gray-600 mb-3">
          Wrong Position Letters (Yellow)
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
                handleCellClick(position);
              }}
              className={`aspect-square bg-gray-50 rounded-xl border-2 p-2 flex flex-col gap-1 items-center justify-center hover:border-yellow-300 transition-all cursor-pointer shadow-md hover:shadow-lg ${
                isFocused && selectedPosition === position
                  ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-yellow-200'
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
                    className="bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300 rounded px-4 py-2 text-lg font-bold text-yellow-800 flex items-center justify-center cursor-pointer hover:from-yellow-200 hover:to-yellow-300 transition-all group shadow-sm hover:shadow-md relative w-full"
                  >
                    <span>{letter}</span>
                    <span className="absolute right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ✕
                    </span>
                  </div>
                ))
              ) : null}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
