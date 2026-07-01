import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type, spacing } from '../theme';

/** iOS segmented control. `segments`: [{key,label}]; `value`=active key. */
export default function Segmented({ segments, value, onChange, style }) {
  return (
    <View style={[styles.track, style]}>
      {segments.map((s) => {
        const active = s.key === value;
        return (
          <Pressable key={s.key} onPress={() => onChange(s.key)} style={[styles.seg, active && styles.segActive]}>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{s.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.fill, borderRadius: 9, padding: 2 },
  seg: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 7 },
  segActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  label: { ...type.subhead, color: colors.label, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});
