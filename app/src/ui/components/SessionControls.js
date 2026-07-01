import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../tokens';
import BlockedAppsStrip from '../../native/BlockedAppsStrip';

/**
 * SessionControls component for timer and blocked apps
 * 
 * @param {Object} props
 * @param {number} props.duration - Session duration in minutes
 * @param {Function} props.onIncrement - Callback to increment duration
 * @param {Function} props.onDecrement - Callback to decrement duration
 * @param {number} props.selectedAppCount - Number of selected apps to block
 * @param {Function} [props.onAddApps] - Callback to add/manage apps
 */
export default function SessionControls({ 
  duration, 
  onIncrement, 
  onDecrement, 
  selectedAppCount = 0,
  onAddApps 
}) {
  
  return (
    <View style={styles.container}>
      <View style={styles.inlineRow}>
        {/* Plus button (left) */}
        <BlurView intensity={20} tint="dark" style={styles.circleBlurWrapper}>
          <TouchableOpacity 
            onPress={onIncrement} 
            style={styles.circleButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </BlurView>

        {/* Duration pill with green gradient */}
        <LinearGradient
          colors={['#2E492F', '#274C32', '#246440']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.durationPill}
        >
          <Text style={styles.timerText}>{duration}m</Text>
        </LinearGradient>

        {/* Minus button (right) */}
        <BlurView intensity={20} tint="dark" style={styles.circleBlurWrapper}>
          <TouchableOpacity 
            onPress={onDecrement} 
            style={styles.circleButton}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </BlurView>

        {/* Blocks frosted pill expands to fill remaining space - tappable to open picker */}
        <TouchableOpacity 
          onPress={onAddApps} 
          activeOpacity={0.7}
          style={styles.blocksPillTouchable}
        >
          <BlurView intensity={20} tint="dark" style={styles.blocksPill}>
            <View style={styles.blocksInner}>
              <View style={styles.blocksContent}>
                <Text style={styles.blocksLabel}>Block</Text>
                {Platform.OS === 'ios' && selectedAppCount > 0 ? (
                  <BlockedAppsStrip style={styles.nativeIconStrip} />
                ) : (
                  <View style={styles.placeholderIcons}>
                    <Text style={styles.placeholderText}>
                      {selectedAppCount > 0 ? `${selectedAppCount} apps` : 'Tap to select'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.base,
    marginTop: 4,
    marginBottom: spacing.base,
    position: 'relative',
    zIndex: 0,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  circleBlurWrapper: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  durationPill: {
    paddingHorizontal: spacing.base,
    height: 40,
    minWidth: 84,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timerText: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  blocksPillTouchable: {
    flex: 1,
    marginLeft: 4,
  },
  blocksPill: {
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  blocksInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  blocksContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base, // Increased gap to prevent icons from overlapping text
  },
  blocksLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  nativeIconStrip: {
    height: 28,
    width: 100, // Width for up to 3 icons (28px each with -6px overlap) + "+x" badge
  },
  placeholderIcons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
});

