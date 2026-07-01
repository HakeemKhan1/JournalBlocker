import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type, spacing } from '../theme';

/** Modal sheet nav bar: Cancel · Title · Done (Apple form-sheet pattern). */
export default function SheetHeader({ title, onCancel, onDone, doneLabel = 'Done', doneEnabled = true, cancelLabel = 'Cancel' }) {
  return (
    <>
      <View style={styles.grabberWrap}><View style={styles.grabber} /></View>
      <View style={styles.bar}>
        <Pressable onPress={onCancel} hitSlop={10} style={styles.side}>
          <Text style={styles.cancel}>{cancelLabel}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Pressable onPress={doneEnabled ? onDone : undefined} hitSlop={10} style={[styles.side, styles.right]}>
          <Text style={[styles.done, !doneEnabled && styles.doneOff]}>{doneLabel}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  grabberWrap: { alignItems: 'center', paddingTop: 6 },
  grabber: { width: 36, height: 5, borderRadius: 3, backgroundColor: '#D5D5DA' },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, height: 50 },
  side: { flex: 1 },
  right: { alignItems: 'flex-end' },
  cancel: { ...type.body, color: colors.tint },
  title: { ...type.headline, color: colors.label, flex: 2, textAlign: 'center' },
  done: { ...type.headline, color: colors.tint },
  doneOff: { color: colors.tertiary, fontWeight: '400' },
});
