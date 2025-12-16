/**
 * TYPING METRICS HOOK
 *
 * Tracks typing behavior for fun observability metrics.
 * Currently supports desktop keyboard events only.
 *
 * Counts:
 * - Total letters typed (additive input only, excludes deletions)
 * - Backspaces/deletions
 * - Final constraint state
 *
 * Emits to Faro when user leaves the page or after meaningful activity.
 *
 * TODO: Add mobile input tracking via onInputChange integration
 */

import { useRef, useCallback } from 'react';

export function useTypingMetrics() {
  const metrics = useRef({
    lettersTyped: 0,
    backspaces: 0,
    constraintsAdded: 0,
    constraintsRemoved: 0,
    sessionStart: Date.now(),
  });

  // Track keyboard input (desktop)
  // Stable reference - prevents effect re-registration
  const onKeyDown = useCallback((e) => {
    // Only count actual typing, not shortcuts or navigation
    if (e.metaKey || e.ctrlKey || e.altKey) {
      return; // Skip keyboard shortcuts
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      metrics.current.backspaces += 1;
      return; // Don't double-count as letters_typed
    }

    // Only count letter keys (A-Z)
    if (e.key.length === 1 && /^[a-zA-Z]$/i.test(e.key)) {
      metrics.current.lettersTyped += 1;
    }
  }, []);

  // Track input changes (mobile)
  // TODO: Wire this up to actual mobile input handlers
  const onInputChange = useCallback((oldValue, newValue) => {
    const oldLen = oldValue?.length || 0;
    const newLen = newValue?.length || 0;

    if (newLen > oldLen) {
      // Letters added
      metrics.current.lettersTyped += (newLen - oldLen);
    } else if (newLen < oldLen) {
      // Letters removed
      metrics.current.backspaces += (oldLen - newLen);
    }
  }, []);

  // Track when constraints are added/removed
  const onConstraintAdded = useCallback(() => {
    metrics.current.constraintsAdded += 1;
  }, []);

  const onConstraintRemoved = useCallback(() => {
    metrics.current.constraintsRemoved += 1;
  }, []);

  // Reset all metrics
  const reset = useCallback(() => {
    metrics.current = {
      lettersTyped: 0,
      backspaces: 0,
      constraintsAdded: 0,
      constraintsRemoved: 0,
      sessionStart: Date.now(),
    };
  }, []);

  // Get current metrics snapshot
  const getMetrics = useCallback(() => ({
    lettersTyped: metrics.current.lettersTyped,
    backspaces: metrics.current.backspaces,
    constraintsAdded: metrics.current.constraintsAdded,
    constraintsRemoved: metrics.current.constraintsRemoved,
    sessionDurationMs: Date.now() - metrics.current.sessionStart,
    editingRatio: metrics.current.lettersTyped > 0
      ? (metrics.current.backspaces / metrics.current.lettersTyped)
      : 0,
  }), []);

  return {
    onKeyDown,
    onInputChange,
    onConstraintAdded,
    onConstraintRemoved,
    reset,
    getMetrics,
  };
}
