import { NativeModules, Platform } from 'react-native';

type NativeMapSearchModule = {
  search: (
    query: string,
    centerLat: number,
    centerLng: number,
    radiusMeters: number
  ) => Promise<NativePlace[]>;
  geocode: (query: string) => Promise<{ lat: number; lng: number } | null>;
};

type NativePlace = {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  phone?: string;
  url?: string;
  category?: string;
};

export type Place = NativePlace & {
  distanceMeters?: number;
};

const nativeModule = NativeModules.MapSearch as NativeMapSearchModule | undefined;

// Cache for search results
const searchCache = new Map<string, { results: Place[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 20;

const warnOnce = (() => {
  let warned = false;
  return (message: string) => {
    if (!warned) {
      warned = true;
      if (__DEV__) {
        console.warn(message);
      }
    }
  };
})();

function ensureModule(): NativeMapSearchModule | undefined {
  if (nativeModule) {
    return nativeModule;
  }
  if (Platform.OS === 'ios') {
    warnOnce('MapSearch native module is not linked. Returning no results.');
  }
  return undefined;
}

function getCacheKey(lat: number, lng: number, radiusMeters: number, keywords: string[]): string {
  // Round coordinates to 3 decimal places (~100m precision) to reduce cache collisions
  // 2 decimal places (1.1km) was too coarse and showed wrong cached results
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const roundedRadius = Math.round(radiusMeters / 1000) * 1000;
  return `${roundedLat},${roundedLng},${roundedRadius},${keywords.sort().join(',')}`;
}

function getFromCache(cacheKey: string): Place[] | null {
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }
  if (cached) {
    searchCache.delete(cacheKey); // Remove stale entry
  }
  return null;
}

function setCache(cacheKey: string, results: Place[]): void {
  // Prevent unbounded cache growth
  if (searchCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(cacheKey, { results, timestamp: Date.now() });
}

export async function searchNearby({
  center,
  radiusMeters,
  query = '',
}: {
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  query?: string;
}): Promise<Place[]> {
  const module = ensureModule();
  if (!module) {
    return [];
  }

  const results = await module.search(
    query || '',
    center.latitude,
    center.longitude,
    radiusMeters
  );

  return results;
}

/**
 * Search for mosques using multiple keyword queries and merge results
 * This works around MKLocalSearch's result limit by making separate queries
 * Each keyword is searched independently, then results are merged and deduplicated
 */
export async function searchAllKeywords({
  center,
  radiusMeters,
  keywords = [
    'mosque',
    'masjid',
    'islamic center',
    'islamic society',
    'musalla',
    'prayer hall',
    'islamic association',
    'islamic cultural center',
    'dar ul islam',
    'jamaat',
  ],
}: {
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  keywords?: string[];
}): Promise<Place[]> {
  const module = ensureModule();
  if (!module) {
    return [];
  }

  // Check cache first
  const cacheKey = getCacheKey(center.latitude, center.longitude, radiusMeters, keywords);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Batch keywords into groups of 3 to reduce API calls
  const BATCH_SIZE = 3;
  const batches: string[][] = [];
  for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
    batches.push(keywords.slice(i, i + BATCH_SIZE));
  }

  const allResults: Place[] = [];
  
  // Process batches sequentially with delay between batches
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    // Add delay between batches (not before first)
    if (batchIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Run searches within batch in parallel
    const batchPromises = batch.map((keyword) =>
      module.search(keyword, center.latitude, center.longitude, radiusMeters)
        .catch(() => [] as Place[])
    );
    
    const batchResults = await Promise.all(batchPromises);
    allResults.push(...batchResults.flat());
  }

  // Deduplicate by ID
  const uniqueMap = new Map<string, Place>();
  allResults.forEach((item) => {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });

  const results = Array.from(uniqueMap.values());
  
  // Cache results
  setCache(cacheKey, results);
  
  return results;
}

export async function geocodeQuery(query: string) {
  const module = ensureModule();
  if (!module) {
    return null;
  }
  return module.geocode(query);
}
