import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import { getItem, setItem } from '../storage/localStorage';
import { captureException } from '../utils/errorReporting';

// Storage keys
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

// Prayer display names
const PRAYER_NAMES = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

// Notification identifiers for each prayer (used for cancellation)
const PRAYER_NOTIFICATION_IDS = {
  fajr: 'prayer-fajr',
  dhuhr: 'prayer-dhuhr',
  asr: 'prayer-asr',
  maghrib: 'prayer-maghrib',
  isha: 'prayer-isha',
};

// Configure notification behavior - required for notifications to display
// when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    captureException(error, { context: 'requestNotificationPermissions' });
    return false;
  }
}

/**
 * Check current notification permission status
 * @returns {Promise<'granted' | 'denied' | 'undetermined'>}
 */
export async function getNotificationPermissionStatus() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    captureException(error, { context: 'getNotificationPermissionStatus' });
    return 'undetermined';
  }
}

/**
 * Check if notifications are enabled in app settings
 * @returns {Promise<boolean>}
 */
export async function areNotificationsEnabled() {
  try {
    const enabled = await getItem(NOTIFICATIONS_ENABLED_KEY);
    // Default to true if not set
    return enabled === null ? true : enabled === 'true';
  } catch (error) {
    captureException(error, { context: 'areNotificationsEnabled' });
    return true;
  }
}

/**
 * Set notification preference in app settings
 * @param {boolean} enabled
 */
export async function setNotificationsEnabled(enabled) {
  try {
    await setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    
    if (!enabled) {
      // Cancel all scheduled notifications when disabled
      await cancelAllPrayerNotifications();
    }
  } catch (error) {
    captureException(error, { context: 'setNotificationsEnabled' });
  }
}

/**
 * Cancel all scheduled prayer notifications
 */
export async function cancelAllPrayerNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    captureException(error, { context: 'cancelAllPrayerNotifications' });
  }
}

/**
 * Schedule notifications for all 5 prayers
 * @param {Object} prayerTimes - Object with prayer times as ISO strings { fajr, dhuhr, asr, maghrib, isha }
 * @returns {Promise<boolean>} Whether scheduling was successful
 */
export async function schedulePrayerNotifications(prayerTimes) {
  try {
    // Check if notifications are enabled in app settings
    const enabled = await areNotificationsEnabled();
    if (!enabled) {
      return false;
    }
    
    // Check permission status
    const permissionStatus = await getNotificationPermissionStatus();
    if (permissionStatus !== 'granted') {
      return false;
    }
    
    // Cancel existing notifications before scheduling new ones
    await cancelAllPrayerNotifications();
    
    const now = new Date();
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    for (const prayer of prayers) {
      const prayerTime = new Date(prayerTimes[prayer]);
      const secondsUntil = Math.floor((prayerTime.getTime() - now.getTime()) / 1000);
      
      // Only schedule if prayer time is in the future (at least 1 second away)
      if (secondsUntil > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${PRAYER_NAMES[prayer]}`,
            body: `It's time to pray ${PRAYER_NAMES[prayer]}. May your prayer be accepted.`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            seconds: secondsUntil,
            type: 'timeInterval',
          },
          identifier: PRAYER_NOTIFICATION_IDS[prayer],
        });
      }
    }
    
    return true;
  } catch (error) {
    captureException(error, { context: 'schedulePrayerNotifications' });
    return false;
  }
}

/**
 * Open iOS Settings app to notification settings
 */
export function openNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  }
}

/**
 * Get list of currently scheduled notifications (for debugging)
 * @returns {Promise<Array>}
 */
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    captureException(error, { context: 'getScheduledNotifications' });
    return [];
  }
}
