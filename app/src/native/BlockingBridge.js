// Bridge to the native BlockingBridge module (custom dev client / Xcode build).
// Degrades to no-ops in Expo Go, where the native module is absent.
import { Platform, Alert, NativeModules } from 'react-native';

const Native = NativeModules?.BlockingBridge;

const notSupported = (method) => {
  if (__DEV__) {
    Alert.alert('Native feature unavailable', `${method} requires a custom dev client`);
  }
};

// ── Serialized shield queue ────────────────────────────────────────────────
// PRD §9: the old single `shieldOperationInProgress` flag was shared between
// apply and clear, so a concurrent op was silently dropped. Lock-in start/stop
// + breaks add far more apply/clear churn, so serialize instead of drop — each
// op waits its turn rather than being swallowed by an in-flight op.
let shieldChain = Promise.resolve();
function enqueueShieldOp(fn) {
  const run = shieldChain.then(fn, fn);
  // Keep the chain alive even if an op rejects.
  shieldChain = run.catch(() => {});
  return run;
}

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
  return { count: 0 };
}

export async function applyShields() {
  return enqueueShieldOp(async () => {
    if (Native && Platform.OS === 'ios') {
      try { return await Native.applyShields(); } catch (e) {}
    }
    if (Platform.OS === 'ios') notSupported('applyShields');
    return { applied: false };
  });
}

export async function clearShields() {
  return enqueueShieldOp(async () => {
    if (Native && Platform.OS === 'ios') {
      try { return await Native.clearShields(); } catch (e) {}
    }
    if (Platform.OS === 'ios') notSupported('clearShields');
    return null;
  });
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

// ── Journal scheduling ─────────────────────────────────────────────────────

/** Schedule the daily morning-gate re-engagement at hour:minute (device local). */
export async function scheduleDayReset(hour, minute) {
  if (Native && Platform.OS === 'ios') {
    try { return await Native.scheduleDayReset(hour, minute); } catch (e) { return false; }
  }
  return false;
}

/** Start a user-initiated lock-in for `durationSeconds`. Returns { lockInUntil } ISO. */
export async function startLockIn(durationSeconds) {
  return enqueueShieldOp(async () => {
    if (Native && Platform.OS === 'ios') {
      try { return await Native.startLockIn(durationSeconds); } catch (e) { return null; }
    }
    if (Platform.OS === 'ios') notSupported('startLockIn');
    return null;
  });
}

/** End a lock-in session early (stops the background window; caller clears shields). */
export async function endLockIn() {
  if (Native && Platform.OS === 'ios') {
    try { return await Native.endLockIn(); } catch (e) {}
  }
  return null;
}

/** Take a break inside a lock-in: clears now, re-locks after `durationSeconds`. */
export async function startBreak(durationSeconds) {
  return enqueueShieldOp(async () => {
    if (Native && Platform.OS === 'ios') {
      try { return await Native.startBreak(durationSeconds); } catch (e) { return null; }
    }
    if (Platform.OS === 'ios') notSupported('startBreak');
    return null;
  });
}

/** Remove all journal DeviceActivity schedules (used when disabling blocking). */
export async function stopAllSchedules() {
  if (Native && Platform.OS === 'ios') {
    try { return await Native.stopAllSchedules(); } catch (e) {}
  }
  return null;
}

/**
 * Get App Group storage information (for monitoring/debugging).
 * @returns {Promise<{totalBytes: number, totalKB: number, status: string, breakdown: Object}>}
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
