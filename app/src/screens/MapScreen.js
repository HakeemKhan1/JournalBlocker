import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../ui/tokens';
import PermissionBanner from '../ui/components/PermissionBanner';
import { searchAllKeywords, geocodeQuery } from '../native/MapSearch';
import { sanitizeSearchQuery } from '../utils/validation';
import { captureException } from '../utils/errorReporting';

const DEFAULT_REGION = {
  latitude: 45.2790,     // Barrhaven center-ish
  longitude: -75.7400,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

const DEFAULT_QUERY = '';
const SEARCH_RADIUS_MIN = 8000; // 8km minimum radius
const CAMERA_MOVEMENT_THRESHOLD_METERS = 2000; // Increased threshold for auto-search (2km)
const AUTO_SEARCH_DEBOUNCE_MS = 2000; // Increased debounce to 2s to prevent rate limiting
const MIN_SEARCH_INTERVAL_MS = 3000; // Minimum time between searches (3s)

export default function MapScreen() {
  const mapRef = useRef(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchHereVisible, setSearchHereVisible] = useState(false);
  const [places, setPlaces] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [userCoordinate, setUserCoordinate] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const lastSearchedRegion = useRef(null);
  const lastSearchQuery = useRef(DEFAULT_QUERY);
  const autoSearchTimeoutRef = useRef(null);
  const lastSearchTimeRef = useRef(0);
  const isSearchInProgressRef = useRef(false);
  const connectivityIntervalRef = useRef(null);
  
  // Bottom sheet state
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const screenHeight = useMemo(() => Dimensions.get('window').height, []);
  const collapsedHeight = 60; // Height when collapsed (just header) - reduced
  const expandedHeight = useMemo(() => Math.floor(screenHeight * 0.5), [screenHeight]); // Half screen height
  const maxTranslateY = useMemo(() => expandedHeight - collapsedHeight, [expandedHeight, collapsedHeight]);
  const sheetAnimation = useRef(new Animated.Value(maxTranslateY)).current; // Start collapsed
  const sheetHeight = useRef(0);
  
  // Track animated value safely via listener (avoids private _value/_offset access)
  const sheetValueRef = useRef(maxTranslateY);
  const sheetOffsetRef = useRef(0);
  
  useEffect(() => {
    const listenerId = sheetAnimation.addListener(({ value }) => {
      sheetValueRef.current = value;
    });
    return () => sheetAnimation.removeListener(listenerId);
  }, [sheetAnimation]);

  const mapRegion = useMemo(
    () => currentRegion || initialRegion || DEFAULT_REGION,
    [currentRegion, initialRegion]
  );

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (!isMounted) return;

        setPermissionStatus(permission.status);

        if (permission.status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          if (!isMounted) return;
          const region = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setUserCoordinate({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setInitialRegion(region);
          setCurrentRegion(region);
        } else {
          setCurrentRegion(DEFAULT_REGION);
        }
      } catch (error) {
        captureException(error, { context: 'MapScreen permission check' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrate();

    return () => {
      isMounted = false;
      // Clear any pending auto-search timeout on unmount
      if (autoSearchTimeoutRef.current) {
        clearTimeout(autoSearchTimeoutRef.current);
        autoSearchTimeoutRef.current = null;
      }
    };
  }, []);

  // Network connectivity check with proper cleanup to prevent state updates after unmount
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const checkConnectivity = async () => {
      // Create fresh controller for each check (previous may be aborted)
      abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);
      
      try {
        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          signal: abortController.signal,
        });
        clearTimeout(timeoutId);
        if (isMounted) setIsOnline(true);
      } catch {
        // Only set offline if not aborted (component still mounted)
        if (isMounted && !abortController.signal.aborted) {
          setIsOnline(false);
        }
      }
    };
    
    checkConnectivity();
    connectivityIntervalRef.current = setInterval(checkConnectivity, 30000);
    
    return () => {
      isMounted = false;
      abortController.abort();
      if (connectivityIntervalRef.current) {
        clearInterval(connectivityIntervalRef.current);
        connectivityIntervalRef.current = null;
      }
    };
  }, []);

  const runSearch = useCallback(
    async (region, queryOverride, options = {}) => {
      if (!region) return;
      
      // Show cached results if offline
      if (!isOnline) {
        setSearchError('You appear to be offline. Showing cached results.');
        return;
      }
      
      // Rate limiting: prevent searches if one is in progress or too soon since last search
      const now = Date.now();
      const timeSinceLastSearch = now - lastSearchTimeRef.current;
      if (isSearchInProgressRef.current || timeSinceLastSearch < MIN_SEARCH_INTERVAL_MS) {
        return;
      }
      
      const { skipLoading = false, useMultiKeyword = true } = options;
      if (!skipLoading) {
        setIsSearching(true);
      }
      setSearchError(null);
      isSearchInProgressRef.current = true;
      lastSearchTimeRef.current = now;

      try {
        const query = queryOverride && queryOverride.trim().length
          ? queryOverride.trim()
          : DEFAULT_QUERY;
        const radiusMeters = regionToRadius(region);

        // Always use multi-keyword search with explicit non-empty keywords array
        const keywords = query && query !== DEFAULT_QUERY
          ? [query] // User-provided search term
          : [
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
            ]; // Default keywords for comprehensive search
        
        const results = await searchAllKeywords({
          center: { latitude: region.latitude, longitude: region.longitude },
          radiusMeters,
          keywords, // Always non-empty array
        });

        const origin = userCoordinate ?? {
          latitude: region.latitude,
          longitude: region.longitude,
        };

        // Category deny-list: exclude non-mosque POI categories
        const excludedCategories = [
          'restaurant', 'food', 'hotel', 'shop', 'store', 'retail',
          'gas', 'parking', 'atm', 'bank', 'hospital', 'school',
          'gym', 'fitness', 'entertainment', 'theater', 'cinema'
        ];
        
        // Include only specific Islamic keywords
        const islamicKeywords = ['mosque', 'masjid', 'islamic', 'muslim', 'musalla'];
        
        // Exclude non-Islamic religious terms
        const nonIslamicTerms = [
          'church', 'chapel', 'cathedral', 'basilica', 'parish',
          'synagogue', 'temple', 'hindu', 'buddhist', 'sikh',
          'gurdwara', 'mandir', 'pagoda', 'shrine', 'monastery'
        ];
        
        const filtered = results.filter((place) => {
          // First, check category deny-list
          if (place.category) {
            const categoryLower = place.category.toLowerCase();
            if (excludedCategories.some((excluded) => categoryLower.includes(excluded))) {
              return false;
            }
          }
          
          const name = (place.name || '').toLowerCase();
          const subtitle = (place.subtitle || '').toLowerCase();
          const searchText = `${name} ${subtitle}`;
          
          // Exclude if it contains non-Islamic religious terms
          if (nonIslamicTerms.some((term) => searchText.includes(term))) {
            return false;
          }
          
          // Include if it contains Islamic keywords
          if (islamicKeywords.some((keyword) => searchText.includes(keyword))) {
            return true;
          }
          
          return false;
        });

        const enriched = filtered
          .map((place) => ({
            ...place,
            distanceMeters: haversine(origin, {
              latitude: place.lat,
              longitude: place.lng,
            }),
          }))
          .sort((a, b) => {
            if (typeof a.distanceMeters !== 'number') return 1;
            if (typeof b.distanceMeters !== 'number') return -1;
            return a.distanceMeters - b.distanceMeters;
          });

        // Debug logging removed for production
        setPlaces(enriched);
        setSelectedPlaceId((previous) => {
          if (!enriched.length) return null;
          const stillExists = enriched.some((place) => place.id === previous);
          return stillExists ? previous : enriched[0].id;
        });
        lastSearchedRegion.current = region;
        lastSearchQuery.current = query;
        setSearchHereVisible(false);
      } catch (error) {
        captureException(error, { context: 'MapScreen search' });
        // Check if it's a rate limiting error
        if (error?.message?.includes('MKErrorDomain error 3') || 
            error?.code === 'MKErrorLoadingThrottled') {
          setSearchError('Too many searches. Please wait a moment.');
          // Wait longer before allowing next search
          lastSearchTimeRef.current = Date.now() + 5000;
        } else {
          setSearchError('Unable to load mosques here. Try again.');
        }
      } finally {
        isSearchInProgressRef.current = false;
        if (!skipLoading) {
          setIsSearching(false);
        }
      }
    },
    [userCoordinate, isOnline]
  );

  const handleSearchHere = useCallback(() => {
    runSearch(mapRegion, lastSearchQuery.current);
  }, [mapRegion, runSearch]);

  const handleSearchSubmit = useCallback(async () => {
    const trimmed = sanitizeSearchQuery(searchText);

    if (!trimmed.length) {
      await runSearch(mapRegion, DEFAULT_QUERY);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);

      const coordinate = await geocodeQuery(trimmed);
      if (!coordinate) {
        setIsSearching(false);
        setSearchError('Could not find that location.');
        return;
      }

      const nextRegion = {
        latitude: coordinate.lat,
        longitude: coordinate.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setCurrentRegion(nextRegion);
      if (!initialRegion) {
        setInitialRegion(nextRegion);
      }

      if (mapRef.current) {
        mapRef.current.animateToRegion(nextRegion, 350);
      }

      await runSearch(nextRegion, trimmed, { skipLoading: true });
    } catch (error) {
      captureException(error, { context: 'MapScreen geocode' });
      setSearchError('Unable to search that location.');
    } finally {
      setIsSearching(false);
    }
  }, [geocodeQuery, initialRegion, mapRegion, runSearch, searchText]);

  // Initial search on mount
  useEffect(() => {
    if (
      permissionStatus === 'granted' &&
      initialRegion &&
      userCoordinate &&
      !lastSearchedRegion.current
    ) {
      runSearch(initialRegion, DEFAULT_QUERY);
    }
  }, [permissionStatus, initialRegion, userCoordinate, runSearch]);

  // Don't auto-expand - let user manually swipe up to view results

  // Auto-search when region changes significantly (debounced and rate-limited)
  useEffect(() => {
    if (permissionStatus !== 'granted' || !currentRegion || !lastSearchedRegion.current) {
      return;
    }

    const moved = distanceBetweenCenters(currentRegion, lastSearchedRegion.current);
    if (moved > CAMERA_MOVEMENT_THRESHOLD_METERS) {
      // Clear existing timeout
      if (autoSearchTimeoutRef.current) {
        clearTimeout(autoSearchTimeoutRef.current);
      }

      // Debounce auto-search with longer delay to prevent rate limiting
      autoSearchTimeoutRef.current = setTimeout(() => {
        // Double-check we're not rate-limited before searching
        const now = Date.now();
        const timeSinceLastSearch = now - lastSearchTimeRef.current;
        if (!isSearchInProgressRef.current && timeSinceLastSearch >= MIN_SEARCH_INTERVAL_MS) {
          runSearch(currentRegion, lastSearchQuery.current, { skipLoading: true });
        }
      }, AUTO_SEARCH_DEBOUNCE_MS);
    }

    return () => {
      if (autoSearchTimeoutRef.current) {
        clearTimeout(autoSearchTimeoutRef.current);
      }
    };
  }, [currentRegion, permissionStatus, runSearch]);

  const handleOpenSettings = () => {
    Linking.openSettings().catch((error) => {
      captureException(error, { context: 'openSettings' });
    });
  };

  // Bottom sheet gesture handler (uses refs to avoid private Animated.Value property access)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderGrant: () => {
          // Store current value as offset using our tracked ref (not private _value)
          sheetOffsetRef.current = sheetValueRef.current;
          sheetAnimation.setOffset(sheetOffsetRef.current);
          sheetAnimation.setValue(0);
        },
        onPanResponderMove: (_, gestureState) => {
          const currentValue = sheetOffsetRef.current + gestureState.dy;
          const maxValue = maxTranslateY;
          const minValue = 0;
          const clampedValue = Math.max(minValue, Math.min(maxValue, currentValue));
          sheetAnimation.setValue(clampedValue - sheetOffsetRef.current);
        },
        onPanResponderRelease: (_, gestureState) => {
          sheetAnimation.flattenOffset();
          const velocity = gestureState.vy;
          // Use tracked ref value (not private _value)
          const currentValue = sheetValueRef.current;
          const threshold = maxTranslateY / 2;

          let toValue;
          if (Math.abs(velocity) > 0.5) {
            // Fast swipe - follow velocity
            toValue = velocity > 0 ? 0 : maxTranslateY;
          } else {
            // Slow drag - snap to nearest position
            toValue = currentValue > threshold ? maxTranslateY : 0;
          }

          Animated.spring(sheetAnimation, {
            toValue,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start(() => {
            sheetOffsetRef.current = 0; // Reset offset after animation
            setIsSheetExpanded(toValue > threshold);
          });
        },
      }),
    [maxTranslateY, sheetAnimation]
  );

  const toggleSheet = useCallback(() => {
    const toValue = isSheetExpanded ? 0 : maxTranslateY;
    setIsSheetExpanded(!isSheetExpanded);
    Animated.spring(sheetAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [isSheetExpanded, maxTranslateY, sheetAnimation]);

  const renderPermissionGate = () => (
    <View style={styles.permissionContainer}>
      <Text style={styles.title}>Nearby Mosques</Text>
      <PermissionBanner
        message="Location access is required to show nearby mosques. Enable it in Settings to continue."
        ctaText="Open Settings"
        onPress={handleOpenSettings}
      />
    </View>
  );

  const renderMapContent = () => (
    <View style={styles.mapWrapper}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={(region) => {
          // Shallow copy to prevent native-side mutation of state object
          setCurrentRegion({ ...region });
          // Show "Search Here" button if moved significantly from last search
          if (lastSearchedRegion.current) {
            const moved = distanceBetweenCenters(region, lastSearchedRegion.current);
            setSearchHereVisible(moved > CAMERA_MOVEMENT_THRESHOLD_METERS);
          }
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => setSelectedPlaceId(place.id)}
            pinColor={
              place.id === selectedPlaceId
                ? colors.accent.interactive
                : Platform.OS === 'ios'
                ? '#7A4BFF'
                : colors.accent.interactive
            }
            title={place.name}
            description={place.subtitle}
          />
        ))}
      </MapView>

      <View style={styles.searchBarContainer}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search for a mosque, or a city"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
      </View>

      {searchHereVisible && (
        <TouchableOpacity style={styles.searchHereButton} onPress={handleSearchHere}>
          <Text style={styles.searchHereText}>Search Here</Text>
        </TouchableOpacity>
      )}

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Offline - Showing cached results</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.locateButton}
        onPress={() => {
          if (initialRegion && mapRef.current) {
            mapRef.current.animateToRegion(initialRegion, 250);
          }
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.locateIcon}>◎</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: expandedHeight,
            transform: [
              {
                translateY: sheetAnimation.interpolate({
                  inputRange: [0, maxTranslateY],
                  outputRange: [maxTranslateY, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
        onLayout={(event) => {
          sheetHeight.current = event.nativeEvent.layout.height;
        }}
      >
        <View
          {...panResponder.panHandlers}
          style={styles.bottomSheetDragArea}
        >
          <View style={styles.bottomSheetHandle} />
          <TouchableOpacity
            style={styles.bottomSheetHeader}
            onPress={toggleSheet}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomSheetTitle}>Mosques around you</Text>
            {isSearching && <ActivityIndicator color={colors.textSecondary} size="small" />}
            {places.length > 0 && (
              <Text style={styles.bottomSheetCount}>{places.length} found</Text>
            )}
          </TouchableOpacity>
        </View>

        {isSheetExpanded && (
          <View style={styles.bottomSheetContent}>
            {searchError ? (
              <Text style={styles.bottomSheetError}>{searchError}</Text>
            ) : places.length === 0 ? (
              <Text style={styles.bottomSheetSubtitle}>Search to discover masjids nearby.</Text>
            ) : (
              <FlatList
                data={places}
                keyExtractor={(item) => item.id}
                style={styles.placeList}
                contentContainerStyle={styles.placeListContent}
                getItemLayout={(data, index) => ({
                  length: 120, // Approximate height of each placeCard
                  offset: 120 * index,
                  index,
                })}
                renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.placeCard,
                    item.id === selectedPlaceId && styles.placeCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedPlaceId(item.id);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion(
                        {
                          latitude: item.lat,
                          longitude: item.lng,
                          latitudeDelta: mapRegion.latitudeDelta,
                          longitudeDelta: mapRegion.longitudeDelta,
                        },
                        300
                      );
                    }
                  }}
                >
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{item.name || 'Unnamed mosque'}</Text>
                    {item.subtitle ? (
                      <Text style={styles.placeSubtitle}>{item.subtitle}</Text>
                    ) : null}
                    {typeof item.distanceMeters === 'number' ? (
                      <Text style={styles.placeMeta}>{formatDistance(item.distanceMeters)}</Text>
                    ) : null}
                  </View>
                  <View style={styles.placeActions}>
                    {item.phone ? (
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => Linking.openURL(`tel:${item.phone}`)}
                      >
                        <Text style={styles.secondaryButtonText}>Call</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() =>
                        Linking.openURL(`http://maps.apple.com/?daddr=${item.lat},${item.lng}`)
                      }
                    >
                      <Text style={styles.primaryButtonText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={<View style={{ height: spacing.lg }} />}
            />
          )}
          </View>
        )}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.textSecondary} size="small" />
        </View>
      ) : permissionStatus === 'granted' ? (
        renderMapContent()
      ) : (
        renderPermissionGate()
      )}
    </SafeAreaView>
  );
}

function distanceBetweenCenters(a, b) {
  return haversine(
    { latitude: a.latitude, longitude: a.longitude },
    { latitude: b.latitude, longitude: b.longitude }
  );
}

function haversine(a, b) {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const aa = sinLat * sinLat + sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function formatDistance(meters) {
  if (typeof meters !== 'number') return '';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

function regionToRadius(region) {
  if (!region) return SEARCH_RADIUS_MIN;
  const latitudeRadius = (region.latitudeDelta * 111000) / 2;
  const longitudeRadius =
    (region.longitudeDelta * 111000 * Math.cos(toRad(region.latitude))) / 2;
  const radius = Math.max(latitudeRadius, Math.abs(longitudeRadius));
  return Math.max(radius, SEARCH_RADIUS_MIN);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.titleL.fontSize,
    fontWeight: typography.titleL.fontWeight,
    marginBottom: spacing.base,
  },
  mapWrapper: {
    flex: 1,
  },
  searchBarContainer: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.base,
    right: spacing.base,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    color: '#1A1A1A',
    fontSize: typography.bodyM.fontSize,
    fontWeight: typography.bodyM.fontWeight,
  },
  searchHereButton: {
    position: 'absolute',
    top: spacing.xl + 64,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  searchHereText: {
    color: '#1A1A1A',
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  offlineBanner: {
    position: 'absolute',
    top: spacing.xl + 56,
    left: spacing.base,
    right: spacing.base,
    backgroundColor: '#EF5350',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  locateButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.base,
    marginTop: 64,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  locateIcon: {
    fontSize: 20,
    color: colors.accent.interactive,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    flexDirection: 'column',
  },
  bottomSheetDragArea: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    minHeight: 0, // Important for FlatList scrolling
  },
  placeList: {
    flex: 1,
  },
  placeListContent: {
    paddingBottom: spacing.lg,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    marginBottom: 4,
  },
  bottomSheetTitle: {
    color: colors.textPrimary,
    fontSize: typography.titleM.fontSize,
    fontWeight: typography.titleM.fontWeight,
  },
  bottomSheetSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bottomSheetCount: {
    color: colors.textSecondary,
    fontSize: typography.metaS.fontSize,
    fontWeight: typography.metaS.fontWeight,
    marginLeft: spacing.sm,
  },
  bottomSheetError: {
    color: '#EF5350',
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
  },
  placeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  placeCardSelected: {
    borderColor: colors.accent.interactive,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  placeInfo: {
    marginBottom: spacing.sm,
  },
  placeName: {
    color: colors.textPrimary,
    fontSize: typography.titleM.fontSize,
    fontWeight: typography.titleM.fontWeight,
  },
  placeSubtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
  },
  placeMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: typography.metaS.fontSize,
    fontWeight: typography.metaS.fontWeight,
  },
  placeActions: {
    flexDirection: 'row',
    columnGap: spacing.sm,
  },
  primaryButton: {
    flexGrow: 1,
    backgroundColor: colors.accent.interactive,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: typography.bodyM.fontSize,
  },
  secondaryButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '500',
  },
});
