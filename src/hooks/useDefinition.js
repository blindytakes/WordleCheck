/**
 * DEFINITION HOOK
 *
 * Custom hook for fetching and managing word definitions.
 * Handles API calls, caching, error states, and modal state.
 *
 * Features:
 * - Fetches definitions from Free Dictionary API (primary)
 * - Falls back to Wiktionary API for obscure words
 * - Component-scoped LRU cache (prevents memory leaks)
 * - Loading and error states
 * - Automatic frontend observability via Grafana Faro
 * - Modal open/close management
 */

import { useState, useRef } from 'react';
import { MAX_DEFINITION_CACHE_SIZE } from '../constants';

/**
 * Strips HTML tags from a string
 * Used to clean Wiktionary API responses which contain HTML markup
 */
function stripHtml(html) {
  if (!html) return '';

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  };

  Object.entries(entities).forEach(([entity, char]) => {
    text = text.replace(new RegExp(entity, 'g'), char);
  });

  return text.trim();
}

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
   * Transforms Wiktionary API response to match Free Dictionary API format
   * This allows the UI to consume both APIs with the same interface
   */
  const transformWiktionaryResponse = (wiktionaryData) => {
    if (!wiktionaryData.en || wiktionaryData.en.length === 0) {
      return null;
    }

    // Transform to Free Dictionary API format
    return [{
      word: wiktionaryData.en[0].language || '',
      phonetic: '', // Wiktionary doesn't always provide phonetics in this endpoint
      meanings: wiktionaryData.en.map(entry => ({
        partOfSpeech: entry.partOfSpeech || 'unknown',
        definitions: entry.definitions.map(def => ({
          definition: stripHtml(def.definition),
          example: def.parsedExamples?.[0]?.example
            ? stripHtml(def.parsedExamples[0].example)
            : undefined
        }))
      }))
    }];
  };

  /**
   * Fetches word definition from Free Dictionary API with Wiktionary fallback
   * Uses cache to avoid repeated requests for the same word
   */
  const fetchDefinition = async (word) => {
    const wordLower = word.toLowerCase();

    // Check cache first
    if (definitionCache[wordLower]) {
      setDefinition(definitionCache[wordLower]);
      setDefinitionError(false);
      return;
    }

    // Fetch from API
    setIsLoadingDefinition(true);
    setDefinitionError(false);

    try {
      // Try primary API first (Free Dictionary)
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${wordLower}`
      );

      if (!response.ok) {
        // Primary API failed, try Wiktionary fallback
        console.log(`Primary API failed for "${wordLower}", trying Wiktionary...`);

        const wiktionaryResponse = await fetch(
          `https://en.wiktionary.org/api/rest_v1/page/definition/${wordLower}`
        );

        if (!wiktionaryResponse.ok) {
          throw new Error('Definition not found in both APIs');
        }

        const wiktionaryData = await wiktionaryResponse.json();
        const transformedData = transformWiktionaryResponse(wiktionaryData);

        if (!transformedData) {
          throw new Error('No English definition found in Wiktionary');
        }

        // Cache the transformed result
        const cacheKeys = Object.keys(definitionCache);
        if (cacheKeys.length >= MAX_DEFINITION_CACHE_SIZE) {
          delete definitionCache[cacheKeys[0]];
        }
        definitionCache[wordLower] = transformedData;

        setDefinition(transformedData);
        setDefinitionError(false);
        return;
      }

      // Primary API succeeded
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
    } catch (error) {
      console.error('Error fetching definition:', error);
      setDefinitionError(true);
      setDefinition(null);
    } finally {
      setIsLoadingDefinition(false);
    }
  };

  /**
   * Opens definition modal for a word
   */
  const openDefinition = (word) => {
    setSelectedWord(word);
    setDefinition(null);
    fetchDefinition(word);
  };

  /**
   * Closes the definition modal
   */
  const closeDefinition = () => {
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
    closeDefinition,
  };
}
