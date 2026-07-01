/**
 * App Group Storage Monitor
 * 
 * Monitors storage usage to detect abnormal growth (indicates bugs).
 * The App Group should only contain:
 * - familySelection: Blocked apps tokens (~1-50KB)
 * - sharedState: Prayer state (~200 bytes)
 * 
 * Normal usage should be <100KB. If storage exceeds warning thresholds,
 * it indicates a bug in the app, not user-clearable cache.
 */

import { Platform } from 'react-native';
import * as Bridge from '../native/LockedIslamBridge';

/**
 * Check App Group storage health (for debugging/monitoring only)
 * This runs silently - only logs in dev mode if issues detected.
 * @returns {Promise<{status: string, totalKB: number}>}
 */
export async function checkStorageHealth() {
  if (Platform.OS !== 'ios') {
    return { status: 'ok', totalKB: 0 };
  }

  try {
    const info = await Bridge.getStorageInfo();
    
    if (!info || info.status === 'unknown') {
      return { status: 'unknown', totalKB: 0 };
    }

    // Only log in development - this is for debugging, not user-facing
    if (__DEV__) {
      if (info.status === 'critical') {
        console.warn(`[Storage] CRITICAL: ${info.totalKB.toFixed(1)}KB used - this indicates a bug!`);
        console.warn('[Storage] Breakdown:', info.breakdown);
      } else if (info.status === 'warning') {
        console.warn(`[Storage] Warning: ${info.totalKB.toFixed(1)}KB used - investigate if this grows`);
      }
    }

    return {
      status: info.status,
      totalKB: info.totalKB,
    };
  } catch (e) {
    // Silently fail - monitoring shouldn't impact user experience
    return { status: 'unknown', totalKB: 0 };
  }
}

/**
 * Get detailed storage breakdown (for development/debugging only)
 * @returns {Promise<Object|null>}
 */
export async function getStorageDetails() {
  if (Platform.OS !== 'ios' || !__DEV__) {
    return null;
  }

  try {
    return await Bridge.getStorageInfo();
  } catch (e) {
    return null;
  }
}

