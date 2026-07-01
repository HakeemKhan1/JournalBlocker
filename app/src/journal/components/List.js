import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, type, spacing, radius } from '../theme';
import Sym from './Sym';

/**
 * Inset-grouped list section (UITableView .insetGrouped). Optional uppercase
 * header and a trailing header action (e.g. "See All" / a + button).
 */
export function ListSection({ header, headerAction, footer, children, style }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.section, style]}>
      {(header || headerAction) && (
        <View style={styles.headerRow}>
          {!!header && <Text style={styles.header}>{header}</Text>}
          {headerAction}
        </View>
      )}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 && <View style={styles.sep} />}
          </View>
        ))}
      </View>
      {!!footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
}

/**
 * A grouped table row. Provide `tile` (an <IconTile/>), `title`, optional
 * `subtitle`, trailing `value`, and `chevron`/`onPress` for a nav row.
 */
export function ListRow({ tile, title, subtitle, value, accessory, chevron = true, onPress, titleColor, last }) {
  const inner = (
    <>
      {!!tile && <View style={styles.tile}>{tile}</View>}
      <View style={styles.rowMid}>
        <Text style={[styles.title, titleColor && { color: titleColor }]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      </View>
      <View style={styles.rowRight}>
        {!!value && <Text style={styles.value} numberOfLines={1}>{value}</Text>}
        {accessory}
        {onPress && chevron && <Sym name="chevron-forward" size={18} color={colors.tertiary} style={{ marginLeft: 4 }} />}
      </View>
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.row}>{inner}</View>;
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.base + spacing.xs, marginBottom: 6 },
  header: { ...type.footnote, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '500' },
  group: { backgroundColor: colors.cell, borderRadius: radius.card, marginHorizontal: spacing.base, overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 52 },
  footer: { ...type.footnote, color: colors.secondary, paddingHorizontal: spacing.base + spacing.xs, marginTop: 7 },
  row: { flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', paddingHorizontal: spacing.base, minHeight: 44, paddingVertical: 11 },
  pressed: { backgroundColor: colors.cellPressed },
  tile: { marginRight: spacing.md, flexShrink: 0 },
  rowMid: { flex: 1, minWidth: 0 },
  rowRight: { flexDirection: 'row', alignItems: 'center', flexShrink: 0, marginLeft: spacing.sm, gap: 2 },
  title: { ...type.body, color: colors.label },
  subtitle: { ...type.footnote, color: colors.secondary, marginTop: 1 },
  value: { ...type.body, color: colors.secondary, marginLeft: spacing.sm },
});
