import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetHeader, Sym, IconTile, JOURNAL_ICONS } from '../components';
import { colors, type, spacing, radius } from '../theme';

const COLORS = Object.values(colors.tiles);

/** Create a journal: pick an icon (many options) and a color, name it. */
export default function AddJournalSheet({ onCancel, onCreate }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('book');
  const [color, setColor] = useState(colors.tiles.indigo);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <SheetHeader
        title="New Journal"
        onCancel={onCancel}
        onDone={() => onCreate?.({ name: name.trim() || 'Untitled', icon, color })}
        doneLabel="Add"
        doneEnabled={name.trim().length > 0}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.previewWrap}>
          <IconTile icon={icon} color={color} size={64} glyph={34} />
        </View>

        <View style={styles.field}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Journal name"
            placeholderTextColor={colors.tertiary}
            style={styles.input}
            autoFocus
            returnKeyType="done"
          />
        </View>

        <Text style={styles.label}>Color</Text>
        <View style={styles.swatchRow}>
          {COLORS.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}>
              {color === c && <Sym name="checkmark" size={16} color="#fff" />}
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {JOURNAL_ICONS.map((ic) => (
            <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconCell, icon === ic && { backgroundColor: color + '22', borderColor: color }]}>
              <Sym name={ic} size={24} color={icon === ic ? color : colors.label} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.groupedBg },
  content: { padding: spacing.base, paddingBottom: spacing.xxl, gap: spacing.base },
  previewWrap: { alignItems: 'center', paddingVertical: spacing.md },
  field: { backgroundColor: colors.cell, borderRadius: radius.card, paddingHorizontal: spacing.base },
  input: { ...type.body, color: colors.label, height: 50 },
  label: { ...type.footnote, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: spacing.xs, marginTop: spacing.sm },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: 2, borderColor: colors.label },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconCell: { width: 52, height: 52, borderRadius: radius.card, backgroundColor: colors.cell, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
});
