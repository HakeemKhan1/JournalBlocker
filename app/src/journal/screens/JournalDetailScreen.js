import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen, Segmented, Sym, IconTile } from '../components';
import { colors, type, spacing, radius, cardShadow } from '../theme';
import { entries as ALL, journals, moods } from '../data/mockState';

const BUCKETS = [
  { key: 'today', label: 'Today' },
  { key: 'month', label: 'This Month' },
  { key: 'earlier', label: 'Earlier' },
];
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'month', label: 'Month' },
  { key: 'today', label: 'Today' },
];

/** A journal's entries, grouped by recency, with add + edit. */
export default function JournalDetailScreen({ navigation, journalId = 'all', title = 'All Entries', onCompose }) {
  const [filter, setFilter] = useState('all');
  const journal = journals.find((j) => j.id === journalId);

  const list = useMemo(
    () => ALL.filter((e) => (journalId === 'all' || e.journalId === journalId)
      && (filter === 'all' || (filter === 'today' ? e.bucket === 'today' : e.bucket !== 'earlier'))),
    [journalId, filter]
  );
  const sections = BUCKETS.map((b) => ({ ...b, items: list.filter((e) => e.bucket === b.key) })).filter((s) => s.items.length);

  return (
    <Screen
      title={title}
      onBack={() => navigation.pop()}
      backLabel="Journal"
      right={<Pressable onPress={() => onCompose?.(journalId === 'all' ? 'personal' : journalId)} hitSlop={10} accessibilityLabel="New entry"><Sym name="create-outline" size={26} color={colors.tint} /></Pressable>}
    >
      <View style={styles.controls}>
        <Segmented segments={FILTERS} value={filter} onChange={setFilter} />
      </View>

      {sections.length === 0 ? (
        <Empty />
      ) : sections.map((s) => (
        <View key={s.key}>
          <Text style={styles.sectionHeader}>{s.label}</Text>
          {s.items.map((e) => (
            <EntryCard key={e.id} entry={e} onPress={() => navigation.push('EntryDetail', { id: e.id })} />
          ))}
        </View>
      ))}
    </Screen>
  );
}

function EntryCard({ entry, onPress }) {
  const mood = moods.find((m) => m.id === entry.mood);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, cardShadow, pressed && { opacity: 0.7 }]}>
      <View style={styles.cardHead}>
        <Text style={styles.time}>{entry.date} · {entry.time}</Text>
        <View style={styles.cardMeta}>
          {entry.aiAssisted && <Sym name="sparkles" size={13} color={colors.tiles.indigo} />}
          {!!mood && <IconTile icon={mood.icon} color={mood.color} size={22} glyph={13} />}
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>{entry.title}</Text>
      <Text style={styles.preview} numberOfLines={2}>{entry.text}</Text>
    </Pressable>
  );
}

function Empty() {
  return (
    <View style={styles.empty}>
      <Sym name="create-outline" size={42} color={colors.tertiary} />
      <Text style={styles.emptyText}>No entries yet</Text>
      <Text style={styles.emptySub}>Tap the compose button to add one.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm },
  sectionHeader: { ...type.footnote, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '500', marginLeft: spacing.base + spacing.xs, marginTop: spacing.base, marginBottom: 6 },
  card: { backgroundColor: colors.cell, borderRadius: radius.card, marginHorizontal: spacing.base, marginBottom: spacing.sm, padding: spacing.base, gap: 5 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { ...type.footnote, color: colors.secondary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...type.headline, color: colors.label },
  preview: { ...type.subhead, color: colors.secondary, lineHeight: 20 },
  empty: { alignItems: 'center', gap: 6, paddingTop: 80 },
  emptyText: { ...type.headline, color: colors.label, marginTop: spacing.sm },
  emptySub: { ...type.subhead, color: colors.secondary },
});
