import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';

// Platform-safe font stack with fallbacks
const FONT_FAMILY = {
  medium: Platform.select({ ios: 'Poppins-Medium', android: 'Poppins-Medium', default: undefined }),
  regular: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins-Regular', default: undefined }),
};
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { getTodayHardcodedTimes, PRAYER_ORDER, formatTimeLocal } from '../logic/prayerTimesHardcoded';
import { adhanAvailable, computeTimesAdhanForDateAsync } from '../logic/prayerTimesAdhan';
import { deriveStatuses, getNextPrayerToDisplay, getRequiredPrayersToClear, areAllRequiredPrayersComplete } from '../logic/prayerState';
import { getItem, setItem } from '../storage/localStorage';
import * as Bridge from '../native/LockedIslamBridge';
import { colors, spacing, typography, TodayHeader, CurrentPrayerCard, SessionControls, StartSessionButton, BellIcon, CheckboxChecked, PrayerGlowBackground } from '../ui';
import { captureException } from '../utils/errorReporting';
import { withRetry, ERROR_MESSAGES } from '../utils/errorHandler';
import { schedulePrayerNotifications } from '../services/notificationService';
import { normalize, isTablet, isLargePhone } from '../utils/normalize';

const LABELS = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const MINUTES_BEFORE_FAJR_CUTOFF = 5;
const emptyPrayedMap = () => ({ fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false });
const STORAGE_KEY = (d) => `prayed:${d}`;
const GRACE_KEY = 'graceSecs';

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Use local date (not UTC) to prevent timezone edge cases where UTC date differs from local date
const dayKeyFromTimes = (times) => {
  const d = new Date(times.fajr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const subtractMinutesFromIso = (iso, minutes) => {
  const dt = new Date(iso);
  dt.setMinutes(dt.getMinutes() - minutes);
  return dt;
};

const buildFallbackTimesSet = (anchor = new Date()) => {
  const base = new Date(anchor);
  return {
    yesterday: getTodayHardcodedTimes(addDays(base, -1)),
    today: getTodayHardcodedTimes(base),
    tomorrow: getTodayHardcodedTimes(addDays(base, 1)),
  };
};

const deriveActiveDayFromSet = (now, timesSet) => {
  const { yesterday, today, tomorrow } = timesSet;
  const boundaryToday = subtractMinutesFromIso(today.fajr, MINUTES_BEFORE_FAJR_CUTOFF);
  const boundaryTomorrow = subtractMinutesFromIso(tomorrow.fajr, MINUTES_BEFORE_FAJR_CUTOFF);
  
  if (now < boundaryToday) {
    return { activeTimes: yesterday, activeDayKey: dayKeyFromTimes(yesterday) };
  }
  
  if (now >= boundaryTomorrow) {
    return { activeTimes: tomorrow, activeDayKey: dayKeyFromTimes(tomorrow) };
  }
  
  return { activeTimes: today, activeDayKey: dayKeyFromTimes(today) };
};

const buildTimesSet = async (anchor = new Date()) => {
  const fallback = buildFallbackTimesSet(anchor);
  if (!adhanAvailable()) {
    return { timesSet: fallback, usedFallback: true, usedDefaultLocation: true };
  }
  
  const base = new Date(anchor);
  const yesterdayDate = addDays(base, -1);
  const tomorrowDate = addDays(base, 1);
  
  // computeTimesAdhanForDateAsync now returns { times, usedDefaultLocation }
  const [yesterdayResult, todayResult, tomorrowResult] = await Promise.all([
    computeTimesAdhanForDateAsync(yesterdayDate),
    computeTimesAdhanForDateAsync(base),
    computeTimesAdhanForDateAsync(tomorrowDate),
  ]);
  
  const timesSet = {
    yesterday: yesterdayResult.times || fallback.yesterday,
    today: todayResult.times || fallback.today,
    tomorrow: tomorrowResult.times || fallback.tomorrow,
  };
  
  const usedFallback = !yesterdayResult.times || !todayResult.times || !tomorrowResult.times;
  // Track if default NYC location was used (show warning to user)
  const usedDefaultLocation = todayResult.usedDefaultLocation;
  return { timesSet, usedFallback, usedDefaultLocation };
};

export default function TodayChecklistScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const initialNow = new Date();
  const fallbackTimesSet = buildFallbackTimesSet(initialNow);
  const { activeTimes: initialActiveTimes, activeDayKey: initialActiveDayKey } = deriveActiveDayFromSet(initialNow, fallbackTimesSet);
  
  const [timesSet, setTimesSet] = useState(fallbackTimesSet);
  const [todayTimes, setTodayTimes] = useState(initialActiveTimes);
  const [prayedMap, setPrayedMap] = useState(emptyPrayedMap());
  const [nowTick, setNowTick] = useState(initialNow.getTime());
  const [activeDayKey, setActiveDayKey] = useState(initialActiveDayKey);
  const [sessionDuration, setSessionDuration] = useState(20);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isUsingDefaultLocation, setIsUsingDefaultLocation] = useState(false); // NYC default location warning
  const [selectedAppCount, setSelectedAppCount] = useState(0);
  const [isLoadingTimes, setIsLoadingTimes] = useState(true); // Loading state for initial prayer times
  
  // Refs for shield state tracking and debouncing (prevents race conditions)
  const lastShieldStateRef = useRef(null);
  const shieldDebounceRef = useRef(null);
  const syncFailureCountRef = useRef(0);
  const hasShownSyncErrorRef = useRef(false);

  // Load saved statuses for the active logical day (prefer App Group shared state)
  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (!activeDayKey) return;
      
      const shared = await Bridge.getSharedState();
      if (!isMounted) return;
      if (shared && shared.prayed && (!shared.dayKey || shared.dayKey === activeDayKey)) {
        setPrayedMap(shared.prayed);
      }
      
      const saved = await getItem(STORAGE_KEY(activeDayKey));
      if (!isMounted) return;
      if (saved) {
        try { setPrayedMap(JSON.parse(saved)); } catch {}
      }
      
      const grace = await getItem(GRACE_KEY);
      if (!isMounted) return;
      if (!grace) await setItem(GRACE_KEY, JSON.stringify(120));
      
      // Load selected app count from shared state
      if (shared?.selectedAppsCount !== undefined) {
        setSelectedAppCount(shared.selectedAppsCount);
      }
    };
    load();
    
    return () => { isMounted = false; };
  }, [activeDayKey]);

  const refreshTimesAround = useCallback(async (anchor = new Date(), isCancelled = () => false) => {
    const { timesSet: nextSet, usedFallback, usedDefaultLocation } = await buildTimesSet(anchor);
    if (isCancelled()) return;
    
    setIsUsingFallback(usedFallback);
    setIsUsingDefaultLocation(usedDefaultLocation);
    setTimesSet(nextSet);
    
    const { activeTimes, activeDayKey: derivedKey } = deriveActiveDayFromSet(anchor, nextSet);
    setTodayTimes(activeTimes);
    setActiveDayKey((prevKey) => {
      if (prevKey !== derivedKey) {
        setPrayedMap(emptyPrayedMap());
      }
      return derivedKey;
    });
    setIsLoadingTimes(false); // Times are now loaded
    
    // Schedule notifications for prayer times (will respect user preference)
    schedulePrayerNotifications(activeTimes).catch(e => 
      captureException(e, { context: 'schedulePrayerNotifications' })
    );
  }, []);

  // Compute prayer times for yesterday/today/tomorrow and pick the active logical day
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await refreshTimesAround(new Date(), () => cancelled);
    };
    run();
    return () => { cancelled = true; };
  }, [refreshTimesAround]);

  // Keep clock ticking to update statuses and detect logical day rollover (5 min before Fajr)
  useEffect(() => {
    const updateTick = () => {
      const now = new Date();
      const { activeTimes, activeDayKey: derivedKey } = deriveActiveDayFromSet(now, timesSet);
      
      if (derivedKey !== activeDayKey) {
        setPrayedMap(emptyPrayedMap());
        setTodayTimes(activeTimes);
        setActiveDayKey(derivedKey);
        refreshTimesAround(now);
      }
      
      setNowTick(now.getTime());
    };
    
    updateTick(); // Initial call
    const t = setInterval(updateTick, 30 * 1000);
    return () => clearInterval(t);
  }, [timesSet, activeDayKey, refreshTimesAround]);

  const { currentPrayer, statuses } = useMemo(() => deriveStatuses(todayTimes, prayedMap, new Date(nowTick)), [todayTimes, prayedMap, nowTick]);

  // Sync shared state with retry logic (extracted for reuse)
  const syncSharedStateWithRetry = useCallback(async (payload) => {
    const { success } = await withRetry(
      () => Bridge.syncSharedState(payload),
      { maxAttempts: 3, baseDelayMs: 200, context: 'syncSharedState', silent: true }
    );
    
    if (success) {
      // Reset failure tracking on success
      syncFailureCountRef.current = 0;
      hasShownSyncErrorRef.current = false;
    } else {
      syncFailureCountRef.current += 1;
      // Only show alert once after 3 consecutive sync failures (avoid spamming user)
      if (syncFailureCountRef.current >= 3 && !hasShownSyncErrorRef.current) {
        hasShownSyncErrorRef.current = true;
        Alert.alert('Sync Issue', ERROR_MESSAGES.SYNC);
      }
    }
  }, []);

  // Apply or clear shields when lock state changes (debounced to prevent race conditions)
  useEffect(() => {
    // Clear any pending debounce
    if (shieldDebounceRef.current) {
      clearTimeout(shieldDebounceRef.current);
    }
    
    const lockActive = currentPrayer && 
      !areAllRequiredPrayersComplete(getRequiredPrayersToClear(currentPrayer), prayedMap);
    
    // Skip if shield state hasn't changed (prevents redundant operations)
    if (lastShieldStateRef.current === lockActive) {
      // Still sync state even if shield state unchanged
      const payload = {
        prayed: prayedMap,
        currentPrayer: currentPrayer || null,
        lockActive: !!lockActive,
        dayKey: activeDayKey,
      };
      syncSharedStateWithRetry(payload);
      return;
    }
    
    // Debounce shield operations by 300ms to prevent rapid toggles
    shieldDebounceRef.current = setTimeout(() => {
      lastShieldStateRef.current = lockActive;
      
      if (lockActive) {
        // Apply shields - user hasn't completed all required prayers yet
        Bridge.authorizeScreenTime().finally(() => {
          Bridge.applyShields();
        });
      } else {
        // Clear shields - all required prayers are complete or no current prayer
        Bridge.clearShields();
      }
      
      // Sync state to App Group so extension can read across reboot
      const payload = {
        prayed: prayedMap,
        currentPrayer: currentPrayer || null,
        lockActive: !!lockActive,
        dayKey: activeDayKey,
      };
      syncSharedStateWithRetry(payload);
    }, 300);
    
    return () => {
      if (shieldDebounceRef.current) {
        clearTimeout(shieldDebounceRef.current);
      }
    };
  // Note: `statuses` removed from deps - it's derived from todayTimes/prayedMap/nowTick via useMemo,
  // and including derived values can cause infinite re-render loops if reference changes.
  // currentPrayer already captures the prayer state we need.
  }, [currentPrayer, prayedMap, activeDayKey, syncSharedStateWithRetry]);

  const data = useMemo(() => PRAYER_ORDER.map((id) => ({
    id,
    label: LABELS[id],
    time: formatTimeLocal(todayTimes[id]),
    status: statuses[id],
  })), [todayTimes, statuses]);

  // Use functional state update to prevent stale closure issues with rapid taps
  const onPrayerToggle = useCallback((prayerId) => {
    if (!activeDayKey) return;
    
    const prayerTime = new Date(todayTimes[prayerId]);
    const now = new Date(nowTick);
    const hasPassed = prayerTime <= now;
    
    // Only allow marking if prayer time has passed
    if (!hasPassed) return;
    
    // Functional update ensures we always have the latest prayedMap
    setPrayedMap(prev => {
      // If already checked, don't update (prevents double-saves)
      if (prev[prayerId]) return prev;
      
      // Haptic feedback on successful prayer check-in
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const newPrayedMap = { ...prev, [prayerId]: true };
      
      // Fire-and-forget storage save (errors handled inside)
      setItem(STORAGE_KEY(activeDayKey), JSON.stringify(newPrayedMap))
        .catch(error => {
          captureException(error, { context: 'savePrayedMap', prayerId, activeDayKey });
          Alert.alert('Save Error', ERROR_MESSAGES.STORAGE);
        });
      
      return newPrayedMap;
    });
    
    // Shield management will be handled by the useEffect automatically
  }, [activeDayKey, todayTimes, nowTick]);

  // Get next prayer to display (always shows next athan, including tomorrow's Fajr)
  const nextPrayerDisplay = useMemo(() => {
    return getNextPrayerToDisplay(todayTimes, new Date(nowTick));
  }, [todayTimes, nowTick]);

  // Calculate time remaining for next prayer after the displayed one
  const timeRemainingText = useMemo(() => {
    // Get the prayer after the next prayer display
    const currentIndex = PRAYER_ORDER.indexOf(nextPrayerDisplay.prayer);
    let nextPrayerIndex = currentIndex + 1;
    let nextPrayerName = 'Fajr'; // Default to Fajr (tomorrow)
    let nextPrayerTime;
    
    if (nextPrayerIndex < PRAYER_ORDER.length) {
      // Still today
      nextPrayerName = LABELS[PRAYER_ORDER[nextPrayerIndex]];
      nextPrayerTime = new Date(todayTimes[PRAYER_ORDER[nextPrayerIndex]]);
    } else {
      // Tomorrow's Fajr
      nextPrayerName = 'Fajr';
      const tomorrowFajr = new Date(todayTimes.fajr);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
      nextPrayerTime = tomorrowFajr;
    }
    
    const now = new Date(nowTick);
    const diff = nextPrayerTime - now;
    
    if (diff <= 0) return '0h 0m';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${nextPrayerName} in ${hours}h ${minutes}m`;
  }, [nextPrayerDisplay.prayer, todayTimes, nowTick]);

  // Count completed prayers for progress ring
  // Show progress for required prayers if there's a current prayer, otherwise show all completed
  const progressData = useMemo(() => {
    if (currentPrayer) {
      const requiredPrayers = getRequiredPrayersToClear(currentPrayer);
      const completed = requiredPrayers.filter(p => prayedMap[p]).length;
      return { completed, total: requiredPrayers.length };
    }
    // No current prayer - show all completed prayers
    const completed = Object.values(prayedMap).filter(Boolean).length;
    return { completed, total: 5 };
  }, [currentPrayer, prayedMap]);

  // Get current prayer display data for card
  // Show the next upcoming prayer (which might be the current one if it hasn't passed yet)
  const currentPrayerDisplay = useMemo(() => {
    // Always show the next prayer to display (next athan)
    return {
      prayer: LABELS[nextPrayerDisplay.prayer],
      time: formatTimeLocal(nextPrayerDisplay.time),
      timeRemaining: timeRemainingText,
    };
  }, [nextPrayerDisplay, timeRemainingText]);

  // Handle session start
  const handleStartSession = useCallback(async () => {
    try {
      // Haptic feedback on session start
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Authorize Screen Time if needed
      await Bridge.authorizeScreenTime();
      
      // Apply shields with selected apps
      await Bridge.applyShields();
      
      // Start session timer (implement as needed)
      // This could trigger a native module to start the blocking session
      
      Alert.alert('Session Started', `Prayer session started for ${sessionDuration} minutes`);
    } catch (error) {
      Alert.alert('Error', 'Failed to start session. Please try again.');
    }
  }, [sessionDuration]);

  // Handle adding apps - navigate to AppPicker screen
  const handleAddApps = useCallback(() => {
    navigation.navigate('AppPicker');
  }, [navigation]);
  
  // Refresh selected app count when screen gains focus (after returning from AppPicker)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const shared = await Bridge.getSharedState();
        if (shared?.selectedAppsCount !== undefined) {
          setSelectedAppCount(shared.selectedAppsCount);
        }
      } catch (error) {
        captureException(error, { context: 'refreshSelectedAppCount' });
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Track if monitoring failure alert has been shown (avoid spamming)
  const hasShownMonitoringErrorRef = useRef(false);

  // Schedule monitoring for today's times (adhān + grace). Minimal for POC.
  useEffect(() => {
    let isMounted = true;
    
    const startMonitoringWithRetry = async () => {
      const isoStarts = PRAYER_ORDER.map((p) => todayTimes[p]);
      
      const { success } = await withRetry(
        () => Bridge.startMonitoring(isoStarts, 120),
        { maxAttempts: 3, baseDelayMs: 300, context: 'startMonitoring' }
      );
      
      if (!isMounted) return;
      
      if (!success && !hasShownMonitoringErrorRef.current) {
        hasShownMonitoringErrorRef.current = true;
        Alert.alert('Monitoring Issue', ERROR_MESSAGES.MONITORING);
      } else if (success) {
        // Reset on success so we can alert again if it fails later
        hasShownMonitoringErrorRef.current = false;
      }
    };
    
    startMonitoringWithRetry();
    
    return () => { isMounted = false; };
  }, [todayTimes]);

  // Render prayer list item
  const tablet = isTablet();
  const renderPrayerItem = useCallback(({ item }) => {
    const isActive = item.id === currentPrayer && statuses[item.id] === 'Due (Locked)';
    const isCompleted = statuses[item.id] === 'Prayed';
    const isMissed = statuses[item.id] === 'Missed';
    
    // Calculate if prayer time has passed
    const prayerTime = new Date(todayTimes[item.id]);
    const now = new Date(nowTick);
    const hasPassed = prayerTime <= now;
    const canBeMarked = hasPassed && !isCompleted;
    
    // Gradient colors based on state
    const gradientColors = isActive
      ? ['#2E492F', '#274C32', '#246440']  // Active row gradient (bright green)
      : ['rgba(50,60,50,0.8)', 'rgba(40,50,40,0.6)'];  // Default gradient (dark)
    
    return (
      <View style={tablet ? styles.prayerColumnItem : undefined}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.prayerRowGradient,
            isCompleted && styles.prayerRowCompleted
          ]}
        >
          <View style={styles.prayerRowBorder}>
            {/* Left: Bell icon */}
            <View style={styles.bellIconContainer}>
              <BellIcon size={32} />
            </View>
            
            {/* Middle: Prayer name and time */}
            <View style={styles.prayerInfo}>
              <Text style={styles.prayerLabel}>
                {item.label}
              </Text>
              <Text style={styles.prayerTimeText}>
                {item.time}
              </Text>
            </View>
            
            {/* Right: Checkbox */}
            <TouchableOpacity 
              onPress={() => onPrayerToggle(item.id)}
              disabled={!canBeMarked}
              activeOpacity={canBeMarked ? 0.7 : 1}
              style={styles.checkboxContainer}
              accessibilityLabel={`Mark ${item.label} as prayed`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isCompleted, disabled: !canBeMarked }}
            >
              {isCompleted ? (
                <CheckboxChecked size={22} />
              ) : (
                <View style={[
                  styles.checkbox,
                  !canBeMarked && styles.checkboxDisabled
                ]} />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }, [currentPrayer, statuses, todayTimes, nowTick, onPrayerToggle, tablet]);

  return (
    <LinearGradient
      colors={colors.gradient.background}
      style={styles.container}
    >
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <TodayHeader 
          onSettingsPress={() => navigation.navigate('Settings')} 
        />
        
        {/* Loading state for initial prayer times */}
        {isLoadingTimes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.primary} />
            <Text style={styles.loadingText}>Calculating prayer times...</Text>
          </View>
        ) : (
          <>
        {/* Warning when using default NYC location */}
        {isUsingDefaultLocation && !isUsingFallback && (
          <View style={styles.locationWarningBanner}>
            <Text style={styles.locationWarningText}>
              ⚠️ Using New York City as default location. Enable location services for accurate prayer times.
            </Text>
          </View>
        )}
        
        {/* Fallback indicator when using hardcoded times */}
        {isUsingFallback && (
          <View style={styles.fallbackBanner}>
            <Text style={styles.fallbackText}>
              Using approximate times. Enable location for accurate prayer times.
            </Text>
          </View>
        )}
        
        {/* Current Prayer Card */}
        <CurrentPrayerCard
          prayer={currentPrayerDisplay.prayer}
          time={currentPrayerDisplay.time}
          timeRemaining={currentPrayerDisplay.timeRemaining}
          completed={progressData.completed}
          total={progressData.total}
        />
        
        {/* Prayer List */}
        <View style={styles.listContainer}>
          <View style={styles.prayerList}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderPrayerItem}
              scrollEnabled={false}
              key={tablet ? 'tablet-2col' : 'phone-1col'}
              numColumns={tablet ? 2 : 1}
              columnWrapperStyle={tablet ? styles.prayerColumnWrapper : undefined}
              getItemLayout={tablet ? undefined : (data, index) => ({
                length: 60, // Height of prayer row including margin
                offset: 60 * index,
                index,
              })}
            />
          </View>
        </View>
        
        {/* Session Controls */}
        <SessionControls
          duration={sessionDuration}
          onIncrement={() => setSessionDuration(prev => Math.min(prev + 5, 120))}
          onDecrement={() => setSessionDuration(prev => Math.max(prev - 5, 5))}
          selectedAppCount={selectedAppCount}
          onAddApps={handleAddApps}
        />
        
        {/* Start Session Button */}
        <StartSessionButton
          onPress={handleStartSession}
        />
          </>
        )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'visible', // Allow glows to extend beyond container bounds
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'visible', // Ensure glows are not clipped
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  listContainer: {
    // marginTop: spacing.lg,
    marginHorizontal: spacing.base,
    borderRadius: 24,          // like the Figma panel radius
    overflow: 'visible',       // so glow can spill out
    position: 'relative',
  },
  prayerList: {
    borderRadius: 24,
    overflow: 'hidden',        // clips rows but NOT the glow canvas
    backgroundColor: 'transparent', // let the Skia glow show behind the rows
    marginBottom: 4,
    paddingTop: 6,
    paddingBottom: 10,          // ensure last row clears the rounded container edge
    position: 'relative',
    zIndex: 1,                  // ensure list paints above following sections if ever overlapping
  },
  prayerRowGradient: {
    marginVertical: 4,
    borderRadius: 14,
    overflow: 'visible', // Changed from 'hidden' to allow glows to extend
  },
  prayerRowCompleted: {
    opacity: 0.8,
  },
  prayerRowBorder: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3C5240', // Muted green border
    paddingVertical: 12,
    paddingLeft: 12, // Bell starts at 12px from card edge
    paddingRight: 18,
    minHeight: isLargePhone() ? 60 : 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIconContainer: {
    marginRight: spacing.md, // 12px spacing between bell and text (54px - 12px - 32px = 10px, but using 12px for better spacing)
  },
  prayerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 1, // Slight offset to match Figma positioning
  },
  prayerLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500', // Medium weight
    color: colors.textPrimary,
    fontFamily: FONT_FAMILY.medium, // Platform-safe font with fallback
    marginRight: spacing.sm, // Space between prayer name and time
  },
  prayerTimeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400', // Regular weight
    color: colors.textPrimary,
    textTransform: 'uppercase',
    fontFamily: FONT_FAMILY.regular, // Platform-safe font with fallback
    marginTop: 5, // Slight vertical offset to match Figma (23px vs 18px)
  },
  checkboxContainer: {
    marginLeft: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: isLargePhone() ? 56 : 44,
    minHeight: isLargePhone() ? 56 : 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white', // White outline for unchecked state
    backgroundColor: 'transparent',
  },
  checkboxDisabled: {
    opacity: 0.4,
  },
  fallbackBanner: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    marginHorizontal: spacing.base,
    borderRadius: 8,
    marginBottom: spacing.base,
  },
  fallbackText: {
    color: '#FFC107',
    fontSize: 12,
    textAlign: 'center',
  },
  locationWarningBanner: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    marginHorizontal: spacing.base,
    borderRadius: 8,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.4)',
  },
  locationWarningText: {
    color: '#EF5350',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  // iPad 2-column prayer grid
  prayerColumnWrapper: {
    justifyContent: 'space-between',
    gap: 8,
  },
  prayerColumnItem: {
    flex: 1,
    maxWidth: '49%',
  },
});
