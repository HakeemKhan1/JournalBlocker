/**
 * Storage version migration system
 * Handles data migrations between app versions
 */

import { getItem, setItem, removeItem } from '../storage/localStorage';

const CURRENT_VERSION = 1;
const VERSION_KEY = 'app_storage_version';

export async function runMigrations() {
  try {
    const storedVersion = await getItem(VERSION_KEY);
    const currentStoredVersion = storedVersion ? parseInt(storedVersion, 10) : 0;
    
    if (currentStoredVersion >= CURRENT_VERSION) {
      return; // Already up to date
    }
    
    // Run migrations in order
    for (let v = currentStoredVersion + 1; v <= CURRENT_VERSION; v++) {
      await runMigration(v);
    }
    
    await setItem(VERSION_KEY, String(CURRENT_VERSION));
  } catch (e) {
    // Silently fail - migrations should not crash the app
    if (__DEV__) {
      console.error('Migration error:', e);
    }
  }
}

async function runMigration(version) {
  switch (version) {
    case 1:
      // Initial version - no migration needed
      break;
    // Add future migrations here:
    // case 2:
    //   await migrateV1ToV2();
    //   break;
    default:
      break;
  }
}

// Example migration function for future use:
// async function migrateV1ToV2() {
//   // Example: rename a storage key
//   const oldValue = await getItem('old_key');
//   if (oldValue) {
//     await setItem('new_key', oldValue);
//     await removeItem('old_key');
//   }
// }

