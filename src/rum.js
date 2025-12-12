/**
 * SPLUNK RUM (REAL USER MONITORING) INITIALIZATION
 *
 * This module initializes Splunk's OpenTelemetry-based RUM to capture:
 * - Page loads and navigation
 * - User interactions (clicks, form submissions)
 * - Network requests (fetch, XHR)
 * - Errors and exceptions
 * - Web Vitals (LCP, FID, CLS, etc.)
 *
 * Configuration is loaded from environment variables (see .env file)
 */

import SplunkRum from '@splunk/otel-web';
import { RUM_RATE_LIMIT_WINDOW_MS, RUM_MAX_CONSOLE_EVENTS_PER_WINDOW } from './constants';

/**
 * Initialize Splunk RUM
 * Call this BEFORE rendering your React app for best results
 */
export function initRUM() {
  // Skip initialization if required env vars are missing
  if (!import.meta.env.VITE_SPLUNK_RUM_TOKEN || !import.meta.env.VITE_SPLUNK_REALM) {
    console.warn('Splunk RUM not initialized: missing VITE_SPLUNK_RUM_TOKEN or VITE_SPLUNK_REALM');
    return;
  }

  SplunkRum.init({
    // Your Splunk realm (e.g., 'us1', 'us0', 'eu0')
    realm: import.meta.env.VITE_SPLUNK_REALM,

    // Your RUM access token from Splunk Observability Cloud
    rumAccessToken: import.meta.env.VITE_SPLUNK_RUM_TOKEN,

    // Application name (shows up in Splunk UI)
    applicationName: import.meta.env.VITE_SPLUNK_APP_NAME || 'wordle-wordcloud',

    // Environment name (dev, staging, prod)
    deploymentEnvironment: import.meta.env.VITE_SPLUNK_ENVIRONMENT || import.meta.env.MODE,

    // Application version (useful for tracking releases)
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Enable debug logging (forced on for debugging RUM data collection)
    debug: import.meta.env.VITE_SPLUNK_ENVIRONMENT !== 'production',  
    
    // ⚡ FORCE 100% SAMPLING (ensures all sessions are captured)
    sessionSampleRate: 1,

    // Automatically instrument common interactions
    instrumentations: {
      // Track clicks and form submissions
      interactions: true,

      // Track fetch and XHR requests
      fetch: true,
      xhr: true,

      // Track navigation and route changes
      document: true,

      // Collect Web Vitals (Core Web Vitals + more)
      webvitals: true,

      // Track long tasks (tasks blocking the main thread >50ms)
      longtask: true,

      // Track errors
      errors: true
    },

    // Control what data is sent (privacy/cost optimization)
    ignoreUrls: [
      // Ignore internal APIs and assets
      /\/api\/geo/,           // Our own geolocation API
      /\/favicon\.ico/,       // Favicon requests
      /\/vite\.svg/,          // Vite default icon
      /\/@vite\//,            // Vite dev server assets
      /\/node_modules\//,     // Dev dependencies (HMR)
      /\/analytics/,          // Analytics endpoints
      /googletagmanager/,     // Google Tag Manager
      /google-analytics/      // Google Analytics
    ],

    // Custom context attributes (added to all spans)
    globalAttributes: {
      'app.feature': 'word-cloud',
      // Add any custom attributes you want to track
    }
  });

  // ✅ Mark RUM as initialized (used by safe console tracking)
  window.SplunkRumInitialized = true;

  // Generate and set session ID
  const sessionId = generateSessionId();

  // Get user location metadata
  const locationData = getUserLocationMetadata();

  // Set global attributes (added to all events)
  SplunkRum.setGlobalAttributes({
    'session.id': sessionId,
    'app.version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    'user.timezone': locationData.timezone,
    'user.language': locationData.language,
    'user.locale': locationData.locale
  });

  // Development-only logging
  if (import.meta.env.DEV) {
    console.log('✅ Splunk RUM initialized');
    console.log('📊 Session ID:', sessionId);
    console.log('🌍 Location:', locationData);
  }

  // Fetch IP-based geolocation (async, will update attributes when ready)
  fetchIPGeolocation();

  // Enable console log tracking
  setupConsoleTracking();
}

/**
 * Generate a unique session ID
 * Format: timestamp-random (e.g., 1702234567890-abc123)
 */
function generateSessionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Get user location metadata from browser
 * Returns timezone, language, and locale information
 */
function getUserLocationMetadata() {
  try {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      language: navigator.language || 'unknown',
      locale: navigator.languages ? navigator.languages[0] : navigator.language || 'unknown'
    };
  } catch (error) {
    return {
      timezone: 'unknown',
      language: 'unknown',
      locale: 'unknown'
    };
  }
}

/**
 * Fetch geolocation data from Vercel's built-in headers
 * Uses internal API route that exposes Vercel's geo headers
 * No rate limits, instant, and reliable!
 */
async function fetchIPGeolocation() {
  // Safety check: Don't run if RUM isn't initialized
  if (!window.SplunkRumInitialized) {
    return;
  }

  try {
    const response = await fetch('/api/geo');
    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();

    // Check if we got actual data (Vercel headers only exist in production)
    if (!data.country) {
      if (import.meta.env.DEV) {
        console.log('🌍 Geolocation: Running on localhost (no Vercel headers)');
      }
      return;
    }

    // Decode URL-encoded city name (e.g., "New%20York" -> "New York")
    const city = data.city ? decodeURIComponent(data.city) : 'unknown';

    // Update global attributes with location data
    SplunkRum.setGlobalAttributes({
      'user.city': city,
      'user.region': data.region || 'unknown',
      'user.country': data.country || 'unknown',
      'user.latitude': data.latitude ? parseFloat(data.latitude) : null,
      'user.longitude': data.longitude ? parseFloat(data.longitude) : null,
      'user.ip': data.ip || 'unknown'
    });

    // Development-only logging
    if (import.meta.env.DEV) {
      console.log('🌍 Geolocation updated:', {
        city: city,
        region: data.region,
        country: data.country,
        source: 'Vercel Edge Network'
      });
    }
  } catch (error) {
    // Fail silently - geolocation is optional
    console.warn('⚠️ Could not fetch geolocation:', error.message);
  }
}

/**
 * Safe console tracking with triple protection against infinite loops
 *
 * ONLY tracks console.error and console.warn (not console.log)
 * - Reduces noise by ~90%
 * - Still captures critical errors
 * - Lower risk of infinite loops
 *
 * Triple Protection:
 * 1. Guard Flag: Prevents synchronous recursion
 * 2. Rate Limiting: Max 10 events per 5 seconds
 * 3. String Filtering: Skips RUM's own debug messages
 */
function setupConsoleTracking() {
  // Store original console methods (only error and warn)
  const originalConsole = {
    warn: console.warn,
    error: console.error,
  };

  let isSending = false; // Guard flag to prevent recursion
  let rateLimitWindow = { count: 0, resetTime: Date.now() };

  // Helper to send console logs to Splunk (with safety checks)
  function sendToSplunk(level, args) {
    // 1. GUARD FLAG CHECK - Prevents immediate recursion
    if (isSending) return;

    try {
      const now = Date.now();

      // 2. RATE LIMIT CHECK - Reset counter every rate limit window
      if (now - rateLimitWindow.resetTime > RUM_RATE_LIMIT_WINDOW_MS) {
        rateLimitWindow = { count: 0, resetTime: now };
      }

      // Max console events per window (protects against flooding)
      if (rateLimitWindow.count >= RUM_MAX_CONSOLE_EVENTS_PER_WINDOW) return;

      // Convert arguments to string safely
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      // 3. STRING FILTERING - Prevents semantic loops
      // Skip RUM's own debug messages to avoid circular logging
      if (
        message.includes('🔍 DEBUG') ||           // RUM debug logs
        message.includes('✅ Splunk RUM') ||      // RUM init success
        message.includes('📊 Session ID') ||      // Session logs
        message.includes('🌍 Geolocation') ||     // Geo logs
        message.includes('rum-ingest') ||         // Splunk internal URLs
        message.includes('[vite]') ||              // Vite HMR noise
        message.includes('[HMR]')                  // Hot module reload
      ) return;

      // Set guard flag and increment rate limit counter
      isSending = true;
      rateLimitWindow.count++;

      // Send to Splunk (only if RUM is initialized)
      if (window.SplunkRumInitialized) {
        SplunkRum.addEvent('browser.console', {
          level: level,
          message: message,
          timestamp: now,
          url: window.location.href
        });
      }
    } catch (error) {
      // Fail silently - don't break the app if logging fails
    } finally {
      // Always reset guard flag (even if error occurs)
      isSending = false;
    }
  }

  // Intercept console.warn
  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    sendToSplunk('warn', args);
  };

  // Intercept console.error
  console.error = function(...args) {
    originalConsole.error.apply(console, args);
    sendToSplunk('error', args);
  };

  // NOTE: console.log and console.info are intentionally NOT intercepted
  // This reduces noise by ~90% while still capturing critical errors
}

/**
 * Get the RUM instance for custom instrumentation
 * Use this to add custom spans or events
 *
 * Returns a safe mock object if RUM is not initialized (missing env vars)
 * to prevent errors when calling addEvent() or other RUM methods
 */
export function getRUM() {
  // Check if RUM was properly initialized
  // If initRUM() returned early, SplunkRum might not have these methods
  if (!SplunkRum || typeof SplunkRum.addEvent !== 'function') {
    // Return a safe mock that does nothing
    return {
      addEvent: () => {},
      setGlobalAttributes: () => {},
      setGlobalAttribute: () => {},
      addError: () => {}
    };
  }

  return SplunkRum;
}

/**
 * Safely track a RUM event with automatic error handling
 *
 * This helper wraps getRUM().addEvent() with try-catch to prevent
 * tracking errors from breaking the app. All tracking failures are
 * silently logged to console.
 *
 * @param {string} eventName - The name of the event to track
 * @param {object} eventData - The data object to send with the event
 * @returns {boolean} - True if event was tracked successfully, false otherwise
 *
 * @example
 * safeTrackEvent('word.clicked', {
 *   word: 'hello',
 *   timestamp: Date.now()
 * });
 */
export function safeTrackEvent(eventName, eventData = {}) {
  try {
    getRUM().addEvent(eventName, eventData);
    return true;
  } catch (error) {
    // Silently log errors to avoid breaking the app
    // Only log in development mode to reduce noise in production
    if (import.meta.env.DEV) {
      console.warn(`RUM tracking failed for event "${eventName}":`, error);
    }
    return false;
  }
}
