import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import TodayChecklistScreen from './src/screens/TodayChecklistScreen';
import VerseScreen from './src/screens/VerseScreen';
import QiblaScreen from './src/screens/QiblaScreen';
import MapScreen from './src/screens/MapScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AppPickerScreen from './src/screens/AppPickerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { getItem, setItem, cleanupOldData } from './src/storage/localStorage';
import { runMigrations } from './src/utils/migrations';
import { initErrorReporting } from './src/utils/errorReporting';
import { checkStorageHealth } from './src/utils/storageMonitor';
import {
  initializePurchases,
  checkPremiumStatus,
  onCustomerInfoUpdate,
  presentPaywallIfNeeded,
  ENTITLEMENT_ID,
  PAYWALL_RESULT,
} from './src/services/PurchaseService';
import { colors, PrayerGlowBackground } from './src/ui';

// Initialize error reporting on app load
initErrorReporting();

// ─── Prayer Count Threshold for Paywall ─────────────────────────
const PRAYER_PAYWALL_THRESHOLD = 100;

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

// ─── Helper: Count total prayers logged across all days ─────────
async function getTotalPrayerCount() {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const allKeys = await AsyncStorage.getAllKeys();
    const prayedKeys = allKeys.filter((k) => k.startsWith('prayed:'));
    if (prayedKeys.length === 0) return 0;

    const entries = await AsyncStorage.multiGet(prayedKeys);
    let total = 0;
    for (const [, value] of entries) {
      if (!value) continue;
      try {
        const map = JSON.parse(value);
        total += Object.values(map).filter(Boolean).length;
      } catch {
        // Corrupt entry — skip
      }
    }
    return total;
  } catch {
    return 0;
  }
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom, 4),
            height: 60 + Math.max(insets.bottom, 4),
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: colors.accent.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
        >
        <Tab.Screen 
          name="Prayer" 
          component={TodayChecklistScreen}
          options={{
            tabBarLabel: 'Prayer',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'location' : 'location-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Activity" 
          component={VerseScreen}
          options={{
            tabBarLabel: 'Activity',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'analytics' : 'analytics-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Qibla" 
          component={QiblaScreen}
          options={{
            tabBarLabel: 'Qibla',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'compass' : 'compass-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Mosques" 
          component={MapScreen}
          options={{
            tabBarLabel: 'Mosques',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'business' : 'business-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'settings' : 'settings-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>
  );
}

function MainApp() {
  const [isPremium, setIsPremium] = useState(false);
  const navigationRef = useRef(null);
  const hasShownPaywall = useRef(false);

  // Initialize RevenueCat & check premium + prayer count on mount
  useEffect(() => {
    let mounted = true;
    let unsubscribeCustomerInfo = null;

    const setup = async () => {
      try {
        await initializePurchases();
      } catch {
        // RevenueCat init failed — treat user as free-tier
      }

      if (!mounted) return;

      // Check premium status
      const premium = await checkPremiumStatus();
      if (!mounted) return;
      setIsPremium(premium);

      if (!premium && !hasShownPaywall.current) {
        // Count total prayers and present RevenueCatUI paywall if threshold reached
        const totalPrayers = await getTotalPrayerCount();
        if (!mounted) return;
        if (totalPrayers >= PRAYER_PAYWALL_THRESHOLD) {
          hasShownPaywall.current = true;
          const result = await presentPaywallIfNeeded();
          if (!mounted) return;
          if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
            setIsPremium(true);
          }
        }
      }

      // Listen for subscription changes (renewal, expiry, cross-device)
      unsubscribeCustomerInfo = onCustomerInfoUpdate((info) => {
        const nowPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
        setIsPremium(nowPremium);
      });
    };

    setup();
    return () => {
      mounted = false;
      if (unsubscribeCustomerInfo) unsubscribeCustomerInfo();
    };
  }, []);

  // Re-check prayer count each time navigation state changes
  // (the TodayChecklist screen may have added new prayers)
  const handleNavigationStateChange = useCallback(async () => {
    if (isPremium || hasShownPaywall.current) return;
    const totalPrayers = await getTotalPrayerCount();
    if (totalPrayers >= PRAYER_PAYWALL_THRESHOLD) {
      hasShownPaywall.current = true;
      const result = await presentPaywallIfNeeded();
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        setIsPremium(true);
      }
    }
  }, [isPremium]);

  return (
    <NavigationContainer ref={navigationRef} onStateChange={handleNavigationStateChange}>
      <View style={{ flex: 1, backgroundColor: colors.background, position: 'relative' }}>
        <ErrorBoundary fallbackMessage="Unable to load the app. Please restart.">
          <RootStack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: colors.background },
              presentation: 'card',
            }}
          >
            <RootStack.Screen name="MainTabs" component={TabNavigator} />
            <RootStack.Screen name="AppPicker" component={AppPickerScreen} />
          </RootStack.Navigator>
        </ErrorBoundary>
        {/* Global background glow overlayed across all screens (non-interactive) */}
        <PrayerGlowBackground />
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </NavigationContainer>
  );
}

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // setHasCompletedOnboarding(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Run storage migrations first
        await runMigrations();
        
        // Run storage cleanup (removes data older than 30 days)
        cleanupOldData();
        
        // Check App Group storage health (iOS only)
        checkStorageHealth();
        
        // Check onboarding status
        const completed = await getItem(ONBOARDING_COMPLETE_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        // Silently handle errors - don't crash the app
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      // Still set state to complete even if save fails
      setHasCompletedOnboarding(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary fallbackMessage="Something went wrong. Please restart the app.">
        {hasCompletedOnboarding ? (
          <MainApp />
        ) : (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
