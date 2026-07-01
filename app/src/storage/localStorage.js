let asyncStorage = null;
try {
  // Lazy require to avoid bundling errors if not installed yet
  // eslint-disable-next-line global-require
  asyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  asyncStorage = null;
}

const memory = new Map();
const MAX_MEMORY_ENTRIES = 100; // Prevent unbounded growth

// Keys that should never be cleaned up
const PERMANENT_KEYS = ['onboarding_complete', 'graceSecs', 'selectedApps', 'app_storage_version'];

export async function getItem(key) {
  if (asyncStorage) {
    return asyncStorage.getItem(key);
  }
  return memory.get(key) ?? null;
}

export async function setItem(key, value) {
  if (asyncStorage) {
    return asyncStorage.setItem(key, value);
  }
  
  // Prevent memory Map from growing too large
  if (memory.size >= MAX_MEMORY_ENTRIES) {
    // Remove oldest non-permanent entry
    for (const [existingKey] of memory) {
      if (!PERMANENT_KEYS.includes(existingKey)) {
        memory.delete(existingKey);
        break;
      }
    }
  }
  
  memory.set(key, value);
}

export async function removeItem(key) {
  if (asyncStorage) {
    return asyncStorage.removeItem(key);
  }
  memory.delete(key);
}

// Clean up old prayer data (keep last 30 days)
export async function cleanupOldData() {
  if (!asyncStorage) return;
  
  try {
    const allKeys = await asyncStorage.getAllKeys();
    const prayedKeys = allKeys.filter(key => key.startsWith('prayed:'));
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().slice(0, 10);
    
    const keysToDelete = prayedKeys.filter(key => {
      const dateStr = key.replace('prayed:', '');
      return dateStr < cutoffDate;
    });
    
    if (keysToDelete.length > 0) {
      await asyncStorage.multiRemove(keysToDelete);
    }
  } catch (e) {
    // Silently fail - cleanup is not critical
  }
}

// Clear memory Map (call on app background)
export function clearMemoryCache() {
  memory.clear();
}
