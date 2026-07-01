// Bridge stub for Expo Go. Replace with a Swift native module in a custom dev client.
import { Platform, Alert, NativeModules } from 'react-native';

const Native = NativeModules?.LockedIslamBridge;

// Track in-flight shield operations to prevent race conditions
let shieldOperationInProgress = false;

const notSupported = (method) => {
  if (__DEV__) {
    Alert.alert('Native feature unavailable', `${method} requires a custom dev client`);
  }
};

export async function authorizeScreenTime() {
  if (Native && Platform.OS === 'ios') {
    try {
      return await Native.authorizeScreenTime();
    } catch (e) {
      // fall through to stub alert
    }
  }
  if (Platform.OS === 'ios') {
    notSupported('authorizeScreenTime');
  }
  return { authorized: false };
}

export async function pickApps() {
  if (Native && Platform.OS === 'ios') {
    try {
      return await Native.pickApps();
    } catch (e) {}
  }
  if (Platform.OS === 'ios') {
    notSupported('pickApps');
  }
  return { tokens: [] };
}

export async function applyShields() {
  // Skip if operation already in progress (prevents race conditions)
  if (shieldOperationInProgress) return;
  shieldOperationInProgress = true;
  
  try {
    if (Native && Platform.OS === 'ios') {
      try { await Native.applyShields(); return; } catch (e) {}
    }
    if (Platform.OS === 'ios') notSupported('applyShields');
  } finally {
    shieldOperationInProgress = false;
  }
}

export async function clearShields() {
  // Skip if operation already in progress (prevents race conditions)
  if (shieldOperationInProgress) return;
  shieldOperationInProgress = true;
  
  try {
    if (Native && Platform.OS === 'ios') {
      try { await Native.clearShields(); return; } catch (e) {}
    }
    if (Platform.OS === 'ios') notSupported('clearShields');
  } finally {
    shieldOperationInProgress = false;
  }
}

export async function syncSharedState(payload) {
  if (Native && Platform.OS === 'ios') {
    try { return await Native.syncSharedState(payload); } catch (e) {}
  }
  // Fallback: no-op in Expo Go; real impl writes to App Group
  return payload;
}

export async function getSharedState() {
  if (Native && Platform.OS === 'ios') {
    try { return await Native.getSharedState(); } catch (e) { return null; }
  }
  return null;
}

export async function getSelectedAppsSummary() {
  if (Native && Platform.OS === 'ios') {
    try {
      const apps = await Native.getSelectedAppsSummary();
      return Array.isArray(apps) ? apps : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function startMonitoring(isoStarts, graceSecs) {
  if (Native && Platform.OS === 'ios') {
    try { return await Native.startMonitoring(isoStarts, graceSecs); } catch (e) { return false; }
  }
  return false;
}

/**
 * Get App Group storage information (for monitoring/debugging)
 * @returns {Promise<{totalBytes: number, totalKB: number, status: 'ok'|'warning'|'critical', breakdown: Object}>}
 */
export async function getStorageInfo() {
  if (Native && Platform.OS === 'ios') {
    try { 
      return await Native.getStorageInfo(); 
    } catch (e) { 
      return { totalBytes: 0, totalKB: 0, status: 'unknown', breakdown: {} }; 
    }
  }
  return { totalBytes: 0, totalKB: 0, status: 'ok', breakdown: {} };
}


