import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Screen, Sym, IconTile, Button } from '../components';
import { colors, type, spacing, radius } from '../theme';
import { entries, moods, journals } from '../data/mockState';

/** View / edit a single entry. Tap Edit to make the body editable. */
export default function EntryDetailScreen({ navigation, id }) {
  const entry = entries.find((e) => e.id === id) || entries[0];
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);
  const mood = moods.find((m) => m.id === entry.mood);
  const journal = journals.find((j) => j.id === entry.journalId);

  return (
    <Screen
      title={entry.title}
      onBack={() => navigation.pop()}
      backLabel="Entries"
      right={<Pressable onPress={() => setEditing((v) => !v)} hitSlop={10}><Text style={styles.edit}>{editing ? 'Done' : 'Edit'}</Text></Pressable>}
    >
      <View style={styles.metaRow}>
        <Text style={styles.date}>{entry.date} · {entry.time}</Text>
        <View style={styles.tags}>
          {!!journal && <View style={styles.tag}><IconTile icon={journal.icon} color={journal.color} size={20} glyph={12} /><Text style={styles.tagText}>{journal.name}</Text></View>}
          {!!mood && <IconTile icon={mood.icon} color={mood.color} size={24} glyph={14} />}
        </View>
      </View>

      {entry.aiAssisted && (
        <View style={styles.aiNote}><Sym name="sparkles" size={13} color={colors.tiles.indigo} /><Text style={styles.aiText}>Cleaned up by AI from a voice note</Text></View>
      )}

      {editing ? (
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          style={styles.input}
          autoFocus
        />
      ) : (
        <Text style={styles.body}>{text}</Text>
      )}

      <View style={styles.actions}>
        <Button title="Delete entry" kind="tinted" color={colors.red} onPress={() => navigation.pop()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  edit: { ...type.body, color: colors.tint, fontWeight: '600' },
  metaRow: { paddingHorizontal: spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { ...type.subhead, color: colors.secondary },
  tags: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cell, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 8 },
  tagText: { ...type.footnote, color: colors.label, fontWeight: '500' },
  aiNote: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.base, marginTop: spacing.md },
  aiText: { ...type.footnote, color: colors.tiles.indigo },
  body: { ...type.body, color: colors.label, lineHeight: 27, paddingHorizontal: spacing.base, marginTop: spacing.md },
  input: { ...type.body, color: colors.label, lineHeight: 27, paddingHorizontal: spacing.base, marginTop: spacing.md, minHeight: 200, textAlignVertical: 'top' },
  actions: { padding: spacing.base, marginTop: spacing.lg },
});
