import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureException } from '../utils/errorReporting';

const { width } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 20;
const CARD_WIDTH = width - CARD_HORIZONTAL_PADDING * 2;
const CARD_ASPECT = 1.25; // visually close to design
const CARD_HEIGHT = Math.min(CARD_WIDTH * CARD_ASPECT, 520);
const COMPASS_SIZE = Math.min(CARD_WIDTH * 0.62, 280);
const CARDINAL_INSET = 10; // place letters on the shorter ticks, slightly inside the ring
const KABAA_EDGE_INSET = 26; // bring Kaaba much closer, overlapping the ring noticeably

// Kaaba coordinates (Mecca)
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

// Calculate Qibla direction (bearing) from user's location
function calculateQiblaBearing(userLat, userLon) {
  const lat1 = userLat * Math.PI / 180;
  const lat2 = KAABA_LAT * Math.PI / 180;
  const deltaLon = (KAABA_LON - userLon) * Math.PI / 180;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  const bearing = Math.atan2(y, x);
  return (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees and normalize
}

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const headingSubRef = useRef(null);
  const alignAnim = useRef(new Animated.Value(0)).current; // 0 = not aligned, 1 = aligned

  // Local assets
  const mapImg = require('../ui/assets/map.png');
  const compassImg = require('../ui/assets/compass.png');
  const kabaaImg = require('../ui/assets/kabaa.png');

  useEffect(() => {
    // Request location permission and get coordinates
    const getLocation = async () => {
      try {
        // Check permission status first
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
        let finalStatus = existingStatus;
        
        // Only request if not already granted or denied
        if (existingStatus !== 'granted') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          setError('Location permission is required for Qibla direction');
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        const loc = lastKnown || await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        if (!loc) {
          setError('Unable to get location');
          return;
        }

        const { latitude, longitude } = loc.coords;
        setLocation({ latitude, longitude });
        const bearing = calculateQiblaBearing(latitude, longitude);
        setQiblaBearing(bearing);
        setError(null);
      } catch (e) {
        setError('Unable to get location');
        captureException(e, { context: 'getLocation' });
      }
    };

    getLocation();

    let isMounted = true;
    
    const startHeadingUpdates = async () => {
      try {
        const subscription = await Location.watchHeadingAsync((data) => {
          // Guard against state updates after unmount
          if (!isMounted) return;
          const nextHeading = (typeof data.trueHeading === 'number' && data.trueHeading >= 0)
            ? data.trueHeading
            : data.magHeading;
          if (typeof nextHeading === 'number' && !Number.isNaN(nextHeading)) {
            setHeading(nextHeading);
          }
        });
        
        // Check if component unmounted during the await
        if (isMounted) {
          headingSubRef.current = subscription;
        } else {
          // Unmounted during await - clean up immediately
          subscription?.remove();
        }
      } catch (e) {
        captureException(e, { context: 'watchHeading' });
      }
    };

    startHeadingUpdates();

    return () => {
      isMounted = false;
      headingSubRef.current?.remove();
      headingSubRef.current = null;
    };
  }, []);

  // Calculate rotation needed to point to Qibla
  const qiblaRotation = qiblaBearing !== null ? (qiblaBearing - heading + 360) % 360 : 0;
  const alignmentDelta = qiblaBearing !== null ? Math.min(Math.abs(qiblaRotation), 360 - Math.abs(qiblaRotation)) : 180;

  // Animate background tint when aligned within threshold
  useEffect(() => {
    const threshold = 10; // degrees
    const target = alignmentDelta <= threshold ? 1 : 0;
    Animated.timing(alignAnim, {
      toValue: target,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [alignmentDelta, alignAnim]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 16, 48) }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: alignAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        {/* Green alignment tint overlay */}
        <View style={styles.alignmentOverlay} />
      </Animated.View>
      <Text style={styles.title}>Qibla</Text>
      <View style={styles.card}>
        <View style={styles.cardInner}>
          {/* Background map */}
          <Image source={mapImg} style={styles.map} resizeMode="contain" />
          {/* Compass group rotates opposite of heading so N stays up.
              N/E/S/W labels and compass image rotate together. */}
          <View style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}>
            <View style={{ position: 'absolute', left: 0, top: 0, width: COMPASS_SIZE, height: COMPASS_SIZE, transform: [{ rotate: `${-heading}deg` }] }}>
              <Image
                source={compassImg}
                style={styles.compassImage}
                resizeMode="contain"
              />
              {/* Cardinal letters */}
              <Text style={[styles.cardinal, styles.north]}>N</Text>
              <Text style={[styles.cardinal, styles.south]}>S</Text>
              <Text style={[styles.cardinal, styles.west]}>W</Text>
              <Text style={[styles.cardinal, styles.east]}>E</Text>
            </View>
            {/* Kaaba marker:
                Because the group above rotates by -heading, rotate the marker by the absolute qibla bearing */}
            {qiblaBearing !== null && (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
                <View
                  style={[
                    styles.kabaaCarrier,
                    { transform: [{ rotate: `${qiblaRotation}deg` }] },
                  ]}
                >
                  <Image
                    source={kabaaImg}
                    style={[
                      styles.kabaa,
                      {
                        transform: [
                          // push outward so the bottom of the Kaaba icon touches the rim
                          { translateY: -(COMPASS_SIZE / 2 - (KABAA_EDGE_INSET + 13)) }, // 13 = half of icon height (26)
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        {/* Information text */}
        <View style={styles.footer}>
          {error ? (
            <Text style={styles.meta}>{error}</Text>
          ) : qiblaBearing === null ? (
            <Text style={styles.meta}>Getting your location...</Text>
          ) : (
            <Text style={styles.meta}>Bearing: {Math.round(qiblaBearing)}°</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    alignItems: 'center',
  },
  title: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  map: {
    position: 'absolute',
    width: CARD_WIDTH - 60,
    height: (CARD_WIDTH - 60) * 0.55,
    opacity: 0.55,
  },
  compassImage: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    left: 0,
    top: 0,
  },
  cardinal: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  north: {
    top: CARDINAL_INSET,
    left: COMPASS_SIZE / 2 - 8,
  },
  south: {
    bottom: CARDINAL_INSET,
    left: COMPASS_SIZE / 2 - 8,
  },
  west: {
    left: CARDINAL_INSET,
    top: COMPASS_SIZE / 2 - 14,
  },
  east: {
    right: CARDINAL_INSET,
    top: COMPASS_SIZE / 2 - 14,
  },
  kabaaCarrier: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
  },
  kabaa: {
    width: 26,
    height: 26,
    // dynamic translateY applied inline to hug the compass rim
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  meta: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  alignmentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(101, 198, 103, 0.18)', // match PrayerGlowBackground green family
  },
});
