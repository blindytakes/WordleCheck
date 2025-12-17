/**
 * APPLICATION CONSTANTS
 *
 * Centralized configuration for magic numbers and repeated values.
 * All hardcoded values should be defined here for easy maintenance.
 */

// ========================================
// WORDLE GAME CONSTANTS
// ========================================

/**
 * Number of letters in a Wordle word
 */
export const WORD_LENGTH = 5;

/**
 * Position indices for word slots (0-indexed for internal use)
 */
export const POSITION_INDICES = [0, 1, 2, 3, 4];

/**
 * Position labels for display (1-indexed for user-facing UI)
 */
export const POSITION_LABELS = [1, 2, 3, 4, 5];

// ========================================
// WORD CLOUD CONFIGURATION
// ========================================

/**
 * Maximum number of words to display in cloud on desktop
 */
export const MAX_DISPLAY_WORDS_DESKTOP = 40;

/**
 * Maximum number of words to display in cloud on mobile/tablet
 */
export const MAX_DISPLAY_WORDS_MOBILE = 10;

/**
 * Maximum number of cached word definitions (LRU-style limit)
 */
export const MAX_DEFINITION_CACHE_SIZE = 100;

/**
 * Delay before showing footer hint (in milliseconds)
 */
export const FOOTER_HINT_DELAY_MS = 3000;

/**
 * Available font sizes for words in cloud (desktop)
 * Ordered from smallest to largest
 */
export const FONT_SIZES_DESKTOP = [
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl'
];

/**
 * Available font sizes for words in cloud (mobile/tablet)
 * Ordered from smallest to largest - all larger for better mobile readability
 */
export const FONT_SIZES_MOBILE = [
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl'
];

/**
 * Word count thresholds for progressive font scaling
 * Used by getFontSizeRange() in WordCloud
 */
export const FONT_SCALE_THRESHOLDS = {
  /** All words at maximum size */
  LARGEST_ONLY: 10,
  /** Two largest sizes only */
  LARGE_SIZES: 20,
  /** Three largest sizes */
  MEDIUM_LARGE: 30,
  /** Four largest sizes */
  MIXED_SIZES: 40
};

// ========================================
// SPLUNK RUM CONFIGURATION
// ========================================

/**
 * Time window for rate limiting console events (in milliseconds)
 */
export const RUM_RATE_LIMIT_WINDOW_MS = 5000;

/**
 * Maximum console events allowed per rate limit window
 */
export const RUM_MAX_CONSOLE_EVENTS_PER_WINDOW = 10;

// ========================================
// RESPONSIVE BREAKPOINTS
// ========================================

/**
 * Screen width breakpoints (matches Tailwind defaults)
 */
export const BREAKPOINTS = {
  /** Small screens (tablets) */
  SM: 640,
  /** Medium screens */
  MD: 768,
  /** Large screens (desktops) */
  LG: 1024,
  /** Extra large screens */
  XL: 1280,
  /** 2XL screens */
  '2XL': 1536
};

// ========================================
// MOBILE INPUT CONFIGURATION
// ========================================

/**
 * Standard props for mobile text input elements
 * Used across GreenRow, YellowRow, and GrayRow components
 * Ensures consistent mobile keyboard behavior
 */
export const MOBILE_INPUT_PROPS = {
  type: 'text',
  inputMode: 'text',
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'characters',
  spellCheck: 'false',
  maxLength: 1
};
