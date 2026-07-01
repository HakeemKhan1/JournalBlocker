import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius, spacing } from '../tokens';

/**
 * StatusBadge component for prayer status display
 * Variants: Not Due / Due (Locked) / Prayed / Missed
 * 
 * @param {Object} props
 * @param {'Not Due' | 'Due (Locked)' | 'Prayed' | 'Missed'} props.status
 */
export default function StatusBadge({ status }) {
  const config = getBadgeConfig(status);
  
  return (
    <View style={[styles.badge, { backgroundColor: config.fill }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {status}
      </Text>
    </View>
  );
}

function getBadgeConfig(status) {
  switch (status) {
    case 'Due (Locked)':
      return {
        fill: colors.badge.dueLocked.fill,
        text: colors.badge.dueLocked.text,
      };
    case 'Prayed':
      return {
        fill: colors.badge.prayed.fill,
        text: colors.badge.prayed.text,
      };
    case 'Missed':
      return {
        fill: colors.badge.missed.fill,
        text: colors.badge.missed.text,
      };
    case 'Not Due':
    default:
      return {
        fill: colors.badge.notDue.fill,
        text: colors.badge.notDue.text,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  text: {
    fontSize: typography.metaS.fontSize,
    lineHeight: typography.metaS.lineHeight,
    fontWeight: typography.metaS.fontWeight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

