import { useEffect, useState } from 'react';
import { useConstraints } from '../context/ConstraintContext';
import ErrorMessage from './ErrorMessage';

export default function GrayRow({ isFocused, onFocusChange }) {
  const { gray, addGray, removeGray } = useConstraints();
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!isFocused) return;

    const handleKeyDown = (e) => {
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
      onClick={handleClick}
      className={`bg-white rounded-2xl cursor-pointer transition-all relative shadow-lg border-4 ${
        isFocused
          ? 'border-gray-500 shadow-gray-200/50'
          : 'border-gray-400 hover:border-gray-500 hover:shadow-xl'
      }`}
    >
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      <div className="p-6 pb-8">
        <div className="text-base font-semibold text-gray-600 mb-3">
          Absent Letters (Gray)
        </div>
        <div className="min-h-24 bg-gray-50 rounded-xl border-2 border-gray-200 p-4 flex flex-wrap gap-2 justify-center items-center">
          {gray.length === 0 ? (
            <div className="text-gray-400 text-base">No absent letters yet...</div>
          ) : (
            gray.map((letter, idx) => (
              <div
                key={`${letter}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLetterRemove(letter);
                }}
                className="bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-300 rounded-lg px-8 py-6 text-3xl font-bold text-gray-700 flex items-center justify-center cursor-pointer hover:from-gray-300 hover:to-gray-400 transition-all group shadow-md hover:shadow-lg relative"
              >
                <span>{letter}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLetterRemove(letter);
                  }}
                  className="absolute right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
