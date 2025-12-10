/**
 * VERCEL GEOLOCATION API ROUTE (EDGE RUNTIME)
 *
 * Returns user location from Vercel's automatic geo headers.
 * These headers are added by Vercel's Edge Network to every request.
 *
 * OPTIMIZATIONS:
 * 1. Edge Runtime: No cold starts, instant response, globally distributed
 * 2. Cache-Control: Browser caches for 24 hours, reduces API calls
 *
 * Available headers:
 * - x-vercel-ip-city: City name
 * - x-vercel-ip-country-region: State/Region code
 * - x-vercel-ip-country: Country code (2-letter, e.g., "US")
 * - x-vercel-ip-latitude: Latitude
 * - x-vercel-ip-longitude: Longitude
 * - x-forwarded-for: User's IP address
 *
 * Note: These headers only exist on Vercel (not localhost).
 */

// Use Edge Runtime for instant response (no cold starts)
export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  // Edge functions use Web API (request.headers.get instead of request.headers)
  const headers = request.headers;

  // Extract location data from Vercel headers
  const location = {
    city: headers.get('x-vercel-ip-city') || null,
    region: headers.get('x-vercel-ip-country-region') || null,
    country: headers.get('x-vercel-ip-country') || null,
    latitude: headers.get('x-vercel-ip-latitude') || null,
    longitude: headers.get('x-vercel-ip-longitude') || null,
    ip: headers.get('x-forwarded-for')?.split(',')[0] || null
  };

  // Return response with caching
  return new Response(
    JSON.stringify(location),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache for 24 hours (86400 seconds)
        // User's location rarely changes within a day
        // Saves API quota and improves performance
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        // CORS headers (if needed for local testing)
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      }
    }
  );
}
