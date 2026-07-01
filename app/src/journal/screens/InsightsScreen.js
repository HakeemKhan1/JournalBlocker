import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, StatCard, SectionHeader, Sym } from '../components';
import { colors, type, spacing, radius, cardShadow } from '../theme';
import { insightsAll } from '../data/mockState';

/** Full insights — the "more useful ones" behind the home preview. */
export default function InsightsScreen({ navigation }) {
  const { stats, summary, themes, onThisDay } = insightsAll;
  return (
    <Screen title="Insights" onBack={() => navigation.pop()} backLabel="Journal">
      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.id} style={styles.cell}>
            <StatCard icon={s.icon} iconColor={s.color} value={s.value} label={s.label} />
          </View>
        ))}
      </View>

      <SectionHeader title="Your month" />
      <View style={styles.summaryCard}>
        <View style={styles.summaryHead}>
          <Sym name="sparkles" size={15} color={colors.tiles.indigo} />
          <Text style={styles.summaryTag}>Summarized by AI</Text>
        </View>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      <SectionHeader title="Themes" />
      <View style={styles.themeWrap}>
        {themes.map((t) => <View key={t} style={styles.theme}><Text style={styles.themeText}>{t}</Text></View>)}
      </View>

      <SectionHeader title="Looking back" />
      <View style={styles.otd}>
        <Text style={styles.otdWhen}>{onThisDay.when}</Text>
        <Text style={styles.otdText}>“{onThisDay.text}”</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.base - 4, marginTop: spacing.xs },
  cell: { width: '50%', padding: 4 },
  summaryCard: { backgroundColor: colors.cell, borderRadius: radius.card, marginHorizontal: spacing.base, padding: spacing.base, gap: spacing.sm, ...cardShadow },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryTag: { ...type.footnote, color: colors.tiles.indigo, fontWeight: '600' },
  summaryText: { ...type.body, color: colors.label, lineHeight: 24 },
  themeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.base },
  theme: { backgroundColor: colors.cell, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, ...cardShadow },
  themeText: { ...type.subhead, color: colors.label, fontWeight: '500' },
  otd: { backgroundColor: colors.cell, borderRadius: radius.card, marginHorizontal: spacing.base, padding: spacing.base, gap: 4, ...cardShadow },
  otdWhen: { ...type.footnote, color: colors.tint, fontWeight: '600' },
  otdText: { ...type.title3, color: colors.label, lineHeight: 27 },
});
