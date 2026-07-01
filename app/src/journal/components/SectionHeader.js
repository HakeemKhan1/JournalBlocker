import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type, spacing } from '../theme';
import Sym from './Sym';

/**
 * Health-app-style section header: bold title + optional tinted action
 * ("See All" with a chevron, or a + button).
 */
export default function SectionHeader({ title, actionLabel, onAction, addButton }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {addButton ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Add ${title}`}>
          <Sym name="add" size={26} color={colors.tint} />
        </Pressable>
      ) : actionLabel ? (
        <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Sym name="chevron-forward" size={15} color={colors.tint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, marginTop: spacing.lg, marginBottom: spacing.sm },
  title: { ...type.title3, color: colors.label, fontWeight: '700' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  actionText: { ...type.body, color: colors.tint },
});
