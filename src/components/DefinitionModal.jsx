/**
 * DEFINITION MODAL COMPONENT
 *
 * Displays word definitions fetched from the Free Dictionary API
 * Shows when user clicks on a word in the word cloud
 *
 * Features:
 * - Animated modal with backdrop
 * - Word pronunciation (phonetic)
 * - Multiple definitions with parts of speech
 * - Example sentences
 * - Loading and error states
 * - Click outside or ESC to close
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function DefinitionModal({ word, definition, isLoading, error, onClose }) {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!word) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-t-3xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black uppercase">{word}</h2>
                {definition?.[0]?.phonetic && (
                  <p className="text-purple-100 text-lg mt-1">{definition[0].phonetic}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-slate-600 mt-4">Loading definition...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600 font-semibold text-lg">Definition not found</p>
                <p className="text-red-500 mt-2">Sorry, we couldn't find a definition for "{word}"</p>
              </div>
            )}

            {/* Definition Content */}
            {!isLoading && !error && definition && (
              <div className="space-y-6">
                {definition[0]?.meanings?.map((meaning, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 shadow-md">
                    {/* Part of Speech */}
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-3">
                      {meaning.partOfSpeech}
                    </div>

                    {/* Definitions */}
                    <div className="space-y-3">
                      {meaning.definitions.slice(0, 3).map((def, defIdx) => (
                        <div key={defIdx} className="border-l-4 border-purple-300 pl-4">
                          <p className="text-slate-800 font-medium">
                            {defIdx + 1}. {def.definition}
                          </p>
                          {def.example && (
                            <p className="text-slate-600 italic mt-1 text-sm">
                              Example: "{def.example}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Synonyms */}
                    {meaning.synonyms?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-slate-600 text-sm font-semibold mb-2">Synonyms:</p>
                        <div className="flex flex-wrap gap-2">
                          {meaning.synonyms.slice(0, 5).map((synonym, synIdx) => (
                            <span
                              key={synIdx}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                            >
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
