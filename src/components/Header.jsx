import { useConstraints } from '../context/ConstraintContext';

export default function Header({ theme, onThemeToggle }) {
  const { filteredWords } = useConstraints();

  return (
    <header className="w-full flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-transparent bg-clip-text">
          WordleViz
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-lg font-medium text-gray-600 bg-white px-4 py-2 rounded-xl shadow-md border border-purple-100">
          <span className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 text-transparent bg-clip-text">
            {filteredWords.length.toLocaleString()}
          </span>
          {' '}
          <span className="text-gray-500">
            {filteredWords.length === 1 ? 'word' : 'words'}
          </span>
        </div>

        <button
          onClick={onThemeToggle}
          className="p-3 rounded-lg bg-white border-2 border-gray-200 hover:border-purple-300 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
