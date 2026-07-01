// Real prayer time computation using adhan-js when available.
// Falls back to null if the library is not installed yet.

import { isValidCoordinates } from '../utils/validation';

let adhanLib = null;
try {
  // eslint-disable-next-line global-require
  adhanLib = require('adhan');
} catch (e) {
  adhanLib = null;
}

let ExpoLocation = null;
try {
  // eslint-disable-next-line global-require
  ExpoLocation = require('expo-location');
} catch (e) {
  ExpoLocation = null;
}


const DEFAULT_COORDS = { latitude: 40.7128, longitude: -74.0060 }; // NYC as default

export function adhanAvailable() {
  return !!adhanLib;
}

export function getDefaultParams() {
  if (!adhanLib) return null;
  const { CalculationMethod } = adhanLib;
  const params = CalculationMethod.MoonsightingCommittee();
  // You can tweak params here if needed, e.g., madhab, highLatitudeRule
  return params;
}

export function computeTimesAdhanForDate(baseDate = new Date(), coords = DEFAULT_COORDS, params = getDefaultParams()) {
  if (!adhanLib || !params) return null;
  
  // Validate coordinates - fall back to default if invalid
  const validCoords = isValidCoordinates(coords) ? coords : DEFAULT_COORDS;
  
  const { Coordinates, PrayerTimes } = adhanLib;
  const c = new Coordinates(validCoords.latitude, validCoords.longitude);
  const targetDate = new Date(baseDate);
  const pt = new PrayerTimes(c, targetDate, params);
  const toIso = (d) => new Date(d).toISOString();
  return {
    fajr: toIso(pt.fajr),
    dhuhr: toIso(pt.dhuhr),
    asr: toIso(pt.asr),
    maghrib: toIso(pt.maghrib),
    isha: toIso(pt.isha),
  };
}

export async function getCurrentCoordinates() {
  if (!ExpoLocation) return null;
  try {
    // Check permission status first
    const { status: existingStatus } = await ExpoLocation.getForegroundPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Only request if not already granted or denied
    if (existingStatus !== 'granted') {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return null;
    
    const loc = await ExpoLocation.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords || {};
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { latitude, longitude };
    }
  } catch (e) {
    // ignore, fallback will be used
  }
  return null;
}

export function computeTodayTimesAdhan(coords = DEFAULT_COORDS, params = getDefaultParams()) {
  return computeTimesAdhanForDate(new Date(), coords, params);
}

export async function computeTimesAdhanForDateAsync(baseDate = new Date()) {
  if (!adhanLib) return { times: null, usedDefaultLocation: true };
  const coords = await getCurrentCoordinates();
  const usedDefaultLocation = !coords;
  const finalCoords = coords || DEFAULT_COORDS;
  return {
    times: computeTimesAdhanForDate(baseDate, finalCoords, getDefaultParams()),
    usedDefaultLocation,
  };
}

export async function computeTodayTimesAdhanAsync() {
  return computeTimesAdhanForDateAsync(new Date());
}


