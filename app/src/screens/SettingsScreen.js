import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Bridge from '../native/LockedIslamBridge';
import BlockedAppsStrip from '../native/BlockedAppsStrip';
import { captureException } from '../utils/errorReporting';
import { 
  areNotificationsEnabled, 
  setNotificationsEnabled, 
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  openNotificationSettings,
} from '../services/notificationService';
import {
  checkPremiumStatus,
  presentPaywall,
  presentCustomerCenter,
} from '../services/PurchaseService';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedAppCount, setSelectedAppCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('undetermined');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadSelectedApps();
    loadNotificationSettings();
    loadPremiumStatus();
    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadSelectedApps();
      loadNotificationSettings();
      loadPremiumStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSelectedApps = async () => {
    try {
      const shared = await Bridge.getSharedState();
      if (shared?.selectedAppsCount) {
        setSelectedAppCount(shared.selectedAppsCount);
      }
    } catch (error) {
      captureException(error, { context: 'loadSelectedApps' });
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const enabled = await areNotificationsEnabled();
      const status = await getNotificationPermissionStatus();
      setNotificationsEnabledState(enabled);
      setPermissionStatus(status);
    } catch (error) {
      captureException(error, { context: 'loadNotificationSettings' });
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const premium = await checkPremiumStatus();
      setIsPremium(premium);
    } catch (error) {
      captureException(error, { context: 'loadPremiumStatus' });
    }
  };

  const handleUpgrade = useCallback(async () => {
    try {
      await presentPaywall();
      // Re-check after paywall closes
      await loadPremiumStatus();
    } catch (error) {
      captureException(error, { context: 'handleUpgrade' });
    }
  }, []);

  const handleManageSubscription = useCallback(async () => {
    try {
      await presentCustomerCenter();
      // Re-check after customer center closes
      await loadPremiumStatus();
    } catch (error) {
      captureException(error, { context: 'handleManageSubscription' });
    }
  }, []);

  const handlePickApps = () => {
    navigation.navigate('AppPicker');
  };

  const handleNotificationToggle = useCallback(async (value) => {
    if (value && permissionStatus !== 'granted') {
      // Need to request permission first
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'To receive prayer time notifications, please enable notifications in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openNotificationSettings },
          ]
        );
        return;
      }
      setPermissionStatus('granted');
    }
    
    setNotificationsEnabledState(value);
    await setNotificationsEnabled(value);
  }, [permissionStatus]);

  const handleOpenSystemSettings = useCallback(() => {
    openNotificationSettings();
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: Math.max(insets.top + 16, 48) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Settings</Text>

      {/* Apps to Block Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>BLOCKING</Text>
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={handlePickApps}
          activeOpacity={0.7}
        >
          <View style={styles.settingRowContent}>
            <Text style={styles.settingLabel}>Choose Apps to Block</Text>
            <View style={styles.settingRight}>
              {selectedAppCount > 0 && (
                <Text style={styles.settingValue}>{selectedAppCount} selected</Text>
              )}
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>

          {selectedAppCount > 0 && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <BlockedAppsStrip style={{ height: 36, width: '100%' }} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        
        {/* Permission denied banner */}
        {permissionStatus === 'denied' && (
          <TouchableOpacity 
            style={styles.permissionBanner}
            onPress={handleOpenSystemSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionBannerText}>
              Notifications are disabled in system settings. Tap to open Settings.
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.settingRow}>
          <View style={styles.settingRowContent}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Prayer Time Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified at each prayer time
              </Text>
            </View>
            <Switch
              value={notificationsEnabled && permissionStatus !== 'denied'}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#3A3A3A', true: '#66BB6A' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#3A3A3A"
              disabled={permissionStatus === 'denied'}
            />
          </View>
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>SUBSCRIPTION</Text>
        
        {isPremium ? (
          <>
            <View style={styles.settingRow}>
              <View style={styles.settingRowContent}>
                <View style={styles.settingLabelContainer}>
                  <Text style={styles.settingLabel}>Deen Shield Pro</Text>
                  <Text style={[styles.settingDescription, { color: '#66BB6A' }]}>
                    Active
                  </Text>
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.settingRow, { marginTop: 1 }]}
              onPress={handleManageSubscription}
              activeOpacity={0.7}
            >
              <View style={styles.settingRowContent}>
                <Text style={styles.settingLabel}>Manage Subscription</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleUpgrade}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowContent}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Upgrade to Pro</Text>
                <Text style={styles.settingDescription}>
                  Unlimited prayer tracking & all features
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    color: '#707070',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
    textTransform: 'uppercase',
  },
  settingRow: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 1,
    overflow: 'hidden',
  },
  settingRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '400',
  },
  settingDescription: {
    color: '#707070',
    fontSize: 13,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    color: '#66BB6A',
    fontSize: 15,
    fontWeight: '500',
  },
  chevron: {
    color: '#707070',
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 4,
  },
  permissionBanner: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.4)',
  },
  permissionBannerText: {
    color: '#EF5350',
    fontSize: 13,
    textAlign: 'center',
  },
  proBadge: {
    backgroundColor: 'rgba(102, 187, 106, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(102, 187, 106, 0.4)',
  },
  proBadgeText: {
    color: '#66BB6A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
