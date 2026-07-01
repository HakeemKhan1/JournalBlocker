import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../tokens';
import { formatHijriDate } from '../../logic/hijriDate';

/**
 * TodayHeader component showing date, Hijri date, and settings button
 * 
 * @param {Object} props
 * @param {Function} [props.onSettingsPress] - Callback when settings button is pressed
 */
export function TodayHeader({ onSettingsPress }) {
  const insets = useSafeAreaInsets();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
  const hijriDate = formatHijriDate(today);
  
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + spacing.base, 48) }]}>
      <View style={styles.headerRow}>
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>Today, {dateStr}</Text>
          <Text style={styles.hijriText}>{hijriDate}</Text>
        </View>
        {onSettingsPress && (
          <Pressable onPress={onSettingsPress} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.accent.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateSection: {
    flex: 1,
  },
  dateText: {
    ...typography.headerLarge,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  hijriText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

