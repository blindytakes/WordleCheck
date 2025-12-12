/**
 * DEFINITION HOOK
 *
 * Custom hook for fetching and managing word definitions.
 * Handles API calls, caching, error states, and modal state.
 *
 * Features:
 * - Fetches definitions from Free Dictionary API
 * - Component-scoped LRU cache (prevents memory leaks)
 * - Loading and error states
 * - Splunk RUM tracking for all events
 * - Modal open/close management
 */

import { useState, useRef } from 'react';
import { safeTrackEvent } from '../rum.js';
import { MAX_DEFINITION_CACHE_SIZE } from '../constants';

export default function useDefinition() {
  // Component-scoped definition cache (prevents memory leaks)
  // Using useRef so cache persists across re-renders but can be cleared
  const definitionCacheRef = useRef({});
  const definitionCache = definitionCacheRef.current;

  // Definition modal state
  const [selectedWord, setSelectedWord] = useState(null);
  const [definition, setDefinition] = useState(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const [definitionError, setDefinitionError] = useState(false);

  /**
   * Fetches word definition from Free Dictionary API
   * Uses cache to avoid repeated requests for the same word
   */
  const fetchDefinition = async (word) => {
    const wordLower = word.toLowerCase();

    // Check cache first
    if (definitionCache[wordLower]) {
      setDefinition(definitionCache[wordLower]);
      setDefinitionError(false);

      // Track cached definition fetch
      safeTrackEvent('definition.fetched', {
        word: wordLower,
        cached: true,
        success: true,
        timestamp: Date.now()
      });

      return;
    }

    // Fetch from API
    setIsLoadingDefinition(true);
    setDefinitionError(false);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${wordLower}`
      );

      if (!response.ok) {
        throw new Error('Definition not found');
      }

      const data = await response.json();

      // Cache the result with size limiting (simple LRU-style)
      const cacheKeys = Object.keys(definitionCache);
      if (cacheKeys.length >= MAX_DEFINITION_CACHE_SIZE) {
        // Remove oldest entry (first key in the object)
        delete definitionCache[cacheKeys[0]];
      }
      definitionCache[wordLower] = data;

      setDefinition(data);
      setDefinitionError(false);

      // Track successful definition fetch
      safeTrackEvent('definition.fetched', {
        word: wordLower,
        cached: false,
        success: true,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching definition:', error);
      setDefinitionError(true);
      setDefinition(null);

      // Track failed definition fetch
      safeTrackEvent('definition.fetched', {
        word: wordLower,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setIsLoadingDefinition(false);
    }
  };

  /**
   * Opens definition modal for a word
   * Tracks word click event and fetches definition
   */
  const openDefinition = (word, totalWords, isStableMode) => {
    // Track word click event in Splunk
    safeTrackEvent('word.clicked', {
      word: word,
      totalWords: totalWords,
      cloudMode: isStableMode ? 'stable' : 'dynamic',
      timestamp: Date.now()
    });

    setSelectedWord(word);
    setDefinition(null);
    fetchDefinition(word);
  };

  /**
   * Closes the definition modal
   */
  const closeDefinition = () => {
    // Track modal close
    safeTrackEvent('modal.closed', {
      word: selectedWord,
      hadDefinition: definition !== null,
      timestamp: Date.now()
    });

    setSelectedWord(null);
    setDefinition(null);
    setDefinitionError(false);
  };

  return {
    selectedWord,
    definition,
    isLoadingDefinition,
    definitionError,
    openDefinition,
    closeDefinition
  };
}
