import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, type, spacing, radius, cardShadow } from '../theme';
import Sym from './Sym';

/** Health-app-style metric card: small colored symbol, big value, caption. */
export default function StatCard({ icon, iconColor = colors.tint, value, label, style }) {
  return (
    <View style={[styles.card, cardShadow, style]}>
      <View style={styles.head}>
        {!!icon && <Sym name={icon} size={15} color={iconColor} />}
        <Text style={[styles.label, { color: iconColor }]} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.cell, borderRadius: radius.card, padding: spacing.base, minWidth: 0, gap: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { ...type.footnote, fontWeight: '600' },
  value: { ...type.title1, color: colors.label },
});
