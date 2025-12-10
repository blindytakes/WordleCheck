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

    // Enable debug logging in development
    debug: import.meta.env.DEV,

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
      // Ignore health checks, analytics, etc.
      /\/_next\/static/,
      /\/favicon\.ico/,
      /\/analytics/,
      /googletagmanager/,
      /google-analytics/
    ],

    // Custom context attributes (added to all spans)
    globalAttributes: {
      'app.feature': 'word-cloud',
      // Add any custom attributes you want to track
    }
  });

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

  console.log('✅ Splunk RUM initialized');
  console.log('📊 Session ID:', sessionId);
  console.log('🌍 Location:', locationData);

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
 * Fetch IP-based geolocation data
 * Uses ipapi.co free API (1000 requests/day limit)
 * Updates global attributes when data is available
 */
async function fetchIPGeolocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();

    // Update global attributes with location data
    SplunkRum.setGlobalAttributes({
      'user.city': data.city || 'unknown',
      'user.region': data.region || 'unknown',
      'user.country': data.country_name || 'unknown',
      'user.country_code': data.country_code || 'unknown',
      'user.latitude': data.latitude || null,
      'user.longitude': data.longitude || null,
      'user.ip': data.ip || 'unknown'
    });

    console.log('🌍 Geolocation updated:', {
      city: data.city,
      region: data.region,
      country: data.country_name
    });
  } catch (error) {
    // Fail silently - geolocation is optional
    console.warn('⚠️ Could not fetch geolocation:', error.message);
  }
}

/**
 * Intercept console methods and send logs to Splunk
 * Captures console.log, console.warn, console.error, console.info
 */
function setupConsoleTracking() {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  // Helper to send console logs to Splunk
  function sendToSplunk(level, args) {
    try {
      // Convert arguments to a readable message
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

      // Send as custom event to Splunk
      SplunkRum.addEvent('browser.console', {
        level: level,
        message: message,
        timestamp: Date.now(),
        url: window.location.href
      });
    } catch (error) {
      // Fail silently - don't break the app if logging fails
    }
  }

  // Intercept console.log
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
    sendToSplunk('info', args);
  };

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

  // Intercept console.info
  console.info = function(...args) {
    originalConsole.info.apply(console, args);
    sendToSplunk('info', args);
  };
}

/**
 * Get the RUM instance for custom instrumentation
 * Use this to add custom spans or events
 */
export function getRUM() {
  return SplunkRum;
}
