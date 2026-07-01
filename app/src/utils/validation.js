/**
 * Input validation utilities
 */

// Validate latitude is within valid range
export function isValidLatitude(lat) {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
}

// Validate longitude is within valid range
export function isValidLongitude(lng) {
  return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
}

// Validate coordinates object
export function isValidCoordinates(coords) {
  if (!coords || typeof coords !== 'object') return false;
  return isValidLatitude(coords.latitude) && isValidLongitude(coords.longitude);
}

// Validate ISO date string
export function isValidISODate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

// Validate prayer times object
export function isValidPrayerTimes(times) {
  if (!times || typeof times !== 'object') return false;
  const required = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  return required.every(key => isValidISODate(times[key]));
}

// Sanitize search query (remove potential XSS, limit length)
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  return query
    .trim()
    .slice(0, 200) // Max 200 characters
    .replace(/[<>]/g, ''); // Remove angle brackets
}

// Validate storage key
export function isValidStorageKey(key) {
  if (typeof key !== 'string') return false;
  return key.length > 0 && key.length <= 100 && /^[a-zA-Z0-9_:-]+$/.test(key);
}

