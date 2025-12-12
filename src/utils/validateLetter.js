/**
 * LETTER VALIDATION UTILITY
 *
 * Validates and transforms user input for letter entry.
 * Used across GreenRow, YellowRow, and GrayRow components.
 *
 * This ensures consistent validation logic and prevents duplicate regex patterns.
 */

/**
 * Validates that input is a single letter A-Z
 *
 * @param {string} input - Raw input from user (e.g., from e.target.value)
 * @param {boolean} allowEmpty - Whether to accept empty string as valid (default: false)
 * @returns {string|null} - Uppercase letter if valid, null if invalid
 *
 * @example
 * validateLetter('a', false)       // → 'A'
 * validateLetter('z', false)       // → 'Z'
 * validateLetter('', false)        // → null
 * validateLetter('', true)         // → ''
 * validateLetter('ab', false)      // → null
 * validateLetter('1', false)       // → null
 * validateLetter('!', false)       // → null
 */
export function validateLetter(input, allowEmpty = false) {
  const letter = input.toUpperCase();
  const regex = allowEmpty ? /^[A-Z]?$/ : /^[A-Z]$/;

  return regex.test(letter) ? letter : null;
}
