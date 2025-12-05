import { useEffect, useRef, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';

export default function GrayRow({ isFocused, onFocusChange }) {
  const { gray, addGray, removeGray } = useConstraints();
  const rowRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
      // Only handle keyboard input when focused
      if (!isFocused) return;

      // Handle letter keys (A-Z)
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        const result = addGray(letter);

        // Show error if validation failed
        if (result && !result.success) {
          setErrorMessage(result.error);
        }
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        // Remove last letter from list
        if (gray.length > 0) {
          const lastLetter = gray[gray.length - 1];
          removeGray(lastLetter);
        }
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onFocusChange('green'); // Cycle back to green
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, gray, addGray, removeGray, onFocusChange]);

  const handleClick = () => {
    onFocusChange('gray');
  };

  const handleLetterRemove = (letter) => {
    removeGray(letter);
  };

  return (
    <div
      ref={rowRef}
      onClick={handleClick}
      className={`bg-white rounded-2xl p-4 cursor-pointer transition-all relative ${
        isFocused
          ? 'border-2 border-gray-400'
          : 'border-2 border-transparent hover:border-gray-300'
      }`}
    >
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div className="text-sm font-medium text-gray-600 mb-2">
        Absent Letters (Gray)
      </div>
      <div className="min-h-12 bg-gray-50 rounded-lg border-2 border-gray-200 p-2 flex flex-wrap gap-2">
        {gray.length === 0 ? (
          <div className="text-gray-400 text-sm">No absent letters yet...</div>
        ) : (
          gray.map((letter, idx) => (
            <div
              key={`${letter}-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLetterRemove(letter);
              }}
              className="bg-gray-300 border border-gray-400 rounded px-3 py-1 text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-400 transition-all group"
            >
              <span>{letter}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLetterRemove(letter);
                }}
                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
