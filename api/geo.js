/**
 * VERCEL GEOLOCATION API ROUTE
 *
 * Returns user location from Vercel's automatic geo headers.
 * These headers are added by Vercel's Edge Network to every request.
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

export default function handler(request, response) {
  const { headers } = request;

  // Extract location data from Vercel headers
  const location = {
    city: headers['x-vercel-ip-city'] || null,
    region: headers['x-vercel-ip-country-region'] || null,
    country: headers['x-vercel-ip-country'] || null,
    latitude: headers['x-vercel-ip-latitude'] || null,
    longitude: headers['x-vercel-ip-longitude'] || null,
    ip: headers['x-forwarded-for']?.split(',')[0] || null
  };

  // CORS headers (if needed for local testing)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');

  // Return location data
  response.status(200).json(location);
}
