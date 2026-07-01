import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../tokens';
import ProgressRing from './ProgressRing';
import MosqueSilhouette from './MosqueSilhouette';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * CurrentPrayerCard component showing the current/next prayer with progress ring
 * Matches Figma design with backdrop blur and mosque silhouette background
 * 
 * @param {Object} props
 * @param {string} props.prayer - Prayer name (e.g., "Isha'a")
 * @param {string} props.time - Prayer time (e.g., "6:06 pm")
 * @param {string} props.timeRemaining - Time until next prayer (e.g., "Fajr in 1h 39m")
 * @param {number} props.completed - Number of completed prayers
 * @param {number} props.total - Total number of prayers to track
 */
export default function CurrentPrayerCard({ 
  prayer, 
  time, 
  timeRemaining, 
  completed = 0, 
  total = 3 
}) {
  return (
    <View style={styles.cardContainer}>
      <BlurView
        intensity={20}
        tint="dark"
        style={styles.blurView}
      >
        {/* Semi-transparent overlay */}
        <View style={styles.overlay} />
        
        {/* Mosque silhouette background - positioned behind content */}
        <View style={styles.mosqueBackground}>
          <MosqueSilhouette 
            width={390} 
            height={200}
            opacity={0.4}
            color="#2E492F"
          />
        </View>
        
        {/* Card content */}
        <View style={styles.cardContent}>
          {/* Left section - Prayer info (2/3 width) */}
          <View style={styles.cardLeft}>
            {/* NEXT tag */}
            <View style={styles.newTag}>
              <Text style={styles.newTagText}>NEXT</Text>
            </View>
            
            {/* Prayer name with moon icon */}
            <View style={styles.prayerNameRow}>
              <Text style={styles.prayerName}>{prayer}</Text>
              <Ionicons 
                name="moon-outline" 
                size={18} 
                color={colors.textPrimary} 
                style={styles.moonIcon}
              />
            </View>
            
            {/* Prayer time */}
            <Text style={styles.prayerTime}>{time}</Text>
            
            {/* Horizontal separator line between prayer time and time remaining */}
            <View style={styles.horizontalDivider} />
            
            {/* Time remaining */}
            <Text style={styles.timeRemaining}>{timeRemaining}</Text>
          </View>
          
          {/* Vertical separator line - centered exactly in the middle */}
          <View style={styles.verticalSeparatorContainer}>
            <View style={styles.verticalSeparatorLine} />
          </View>
          
          {/* Right section - Progress ring (1/3 width) */}
          <View style={styles.cardRight}>
            <ProgressRing 
              completed={completed} 
              total={total} 
              size={118}
              strokeWidth={15}
            />
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blurView: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  mosqueBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.xl + 4,
    minHeight: 140,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  cardLeft: {
    flex: 1,
    paddingRight: spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  verticalSeparatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: spacing.xl + 4,
    bottom: spacing.xl + 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    pointerEvents: 'none', // Allow touches to pass through
  },
  verticalSeparatorLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing.base,
  },
  newTag: {
    backgroundColor: '#3f6242', // Dark green from Figma
    borderWidth: 1,
    borderColor: '#555555',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100, // Pill shape
    marginBottom: spacing.sm,
  },
  newTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  prayerName: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    opacity: 0.8,
    marginRight: 6,
  },
  moonIcon: {
    opacity: 0.8,
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  timeRemaining: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textPrimary,
    opacity: 0.8,
  },
});
