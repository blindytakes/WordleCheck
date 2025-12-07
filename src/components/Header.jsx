import { useConstraints } from '../context/ConstraintContext';

export default function Header() {
  const { filteredWords } = useConstraints();

  return (
    <header className="w-full flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-transparent bg-clip-text">
          WordleViz
        </div>
      </div>

      <div className="text-lg font-medium text-gray-600 bg-white px-4 py-2 rounded-xl shadow-md border border-purple-100">
        <span className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-pink-500 text-transparent bg-clip-text">
          {filteredWords.length.toLocaleString()}
        </span>
        {' '}
        <span className="text-gray-500">
          {filteredWords.length === 1 ? 'word' : 'words'}
        </span>
      </div>
    </header>
  );
}
