import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen, SectionHeader, StatCard, ListSection, ListRow, IconTile, Sym } from '../components';
import { colors, type, spacing, radius, cardShadow } from '../theme';
import { journals, entries, insightsPreview, blockedApps, blockedCategories } from '../data/mockState';

/**
 * Home — a single scrolling dashboard: Insights preview, Blocked Apps preview,
 * then Journals (All Entries + each journal, with + to add one).
 */
export default function HomeScreen({ navigation, journaledToday, onSettings, onCompose, onAddJournal }) {
  const onCount = blockedCategories.filter((c) => c.on).length;

  return (
    <Screen
      title="Journal"
      left={<NavIcon icon="ellipsis-horizontal-circle-outline" onPress={onSettings} label="Settings" />}
      right={<NavIcon icon="create-outline" onPress={onCompose} label="New entry" />}
    >
      {/* Insights */}
      <SectionHeader title="Insights" actionLabel="See All" onAction={() => navigation.push('Insights')} />
      <Pressable style={styles.statRow} onPress={() => navigation.push('Insights')}>
        {insightsPreview.map((s) => (
          <StatCard key={s.id} icon={s.icon} iconColor={s.color} value={s.value} label={s.label} />
        ))}
      </Pressable>

      {/* Blocked Apps */}
      <SectionHeader title="Blocked Apps" actionLabel="See All" onAction={() => navigation.push('BlockedApps')} />
      <ListSection>
        <ListRow
          tile={<IconTile icon={journaledToday ? 'lock-open' : 'lock-closed'} color={journaledToday ? colors.tiles.green : colors.tint} />}
          title={journaledToday ? 'Unlocked for today' : 'Locked until you journal'}
          subtitle={journaledToday ? 'Apps reopen until tomorrow' : 'Write one entry to unlock'}
          onPress={() => navigation.push('BlockedApps')}
        />
        <ListRow
          tile={<IconTile icon="apps" color={colors.tiles.indigo} />}
          title="Categories & apps"
          value={`${onCount} on`}
          accessory={<AppPeek apps={blockedApps} />}
          onPress={() => navigation.push('BlockedApps')}
        />
      </ListSection>

      {/* Journals */}
      <SectionHeader title="Journals" addButton onAction={onAddJournal} />
      <ListSection footer="Tap + to create a journal with its own icon and name.">
        <ListRow
          tile={<IconTile icon="albums" color={colors.tiles.gray} />}
          title="All Entries"
          value={`${entries.length}`}
          onPress={() => navigation.push('JournalDetail', { journalId: 'all', title: 'All Entries' })}
        />
        {journals.map((j) => (
          <ListRow
            key={j.id}
            tile={<IconTile icon={j.icon} color={j.color} />}
            title={j.name}
            value={`${entries.filter((e) => e.journalId === j.id).length}`}
            onPress={() => navigation.push('JournalDetail', { journalId: j.id, title: j.name })}
          />
        ))}
      </ListSection>
    </Screen>
  );
}

function NavIcon({ icon, onPress, label }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel={label}>
      <Sym name={icon} size={26} color={colors.tint} />
    </Pressable>
  );
}

function AppPeek({ apps }) {
  return (
    <View style={styles.peek}>
      {apps.slice(0, 3).map((a, i) => (
        <View key={a.id} style={[styles.peekDot, { backgroundColor: a.color, marginLeft: i ? -8 : 0 }]}>
          <Sym name={a.icon} size={12} color="#fff" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.base },
  peek: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
  peekDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.cell },
});
