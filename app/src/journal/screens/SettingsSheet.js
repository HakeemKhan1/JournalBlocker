import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListSection, ListRow, IconTile } from '../components';
import { colors, type, spacing } from '../theme';

/** Lightweight settings sheet. Includes prototype-only navigation shortcuts. */
export default function SettingsSheet({ onClose, onReplayOnboarding, onPreviewShield }) {
  const [reminder, setReminder] = useState(true);
  const [freeze, setFreeze] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bar}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} hitSlop={10}><Text style={styles.done}>Done</Text></Pressable>
      </View>

      <ListSection header="Habit">
        <ListRow tile={<IconTile icon="notifications" color={colors.tiles.red} />} title="Daily reminder" chevron={false}
          accessory={<Switch value={reminder} onValueChange={setReminder} trackColor={{ true: colors.tint }} />} />
        <ListRow tile={<IconTile icon="snow" color={colors.tiles.blue} />} title="Streak freeze" subtitle="Protects a long streak from one missed day" chevron={false}
          accessory={<Switch value={freeze} onValueChange={setFreeze} trackColor={{ true: colors.tint }} />} />
      </ListSection>

      <ListSection header="Journal">
        <ListRow tile={<IconTile icon="sparkles" color={colors.tiles.indigo} />} title="AI prompts" value="Daily" onPress={() => {}} />
        <ListRow tile={<IconTile icon="share-outline" color={colors.tiles.green} />} title="Export entries" onPress={() => {}} />
        <ListRow tile={<IconTile icon="lock-closed" color={colors.tiles.gray} />} title="Privacy" subtitle="Entries stay on your device" onPress={() => {}} />
      </ListSection>

      <ListSection header="Prototype">
        <ListRow tile={<IconTile icon="play-back" color={colors.tiles.purple} />} title="Replay onboarding" onPress={onReplayOnboarding} />
        <ListRow tile={<IconTile icon="shield-half" color={colors.tint} />} title="Preview block screen" onPress={onPreviewShield} />
      </ListSection>

      <Text style={styles.footer}>Journal · prototype v0.2</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.groupedBg },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, height: 52 },
  title: { ...type.headline, color: colors.label },
  done: { ...type.headline, color: colors.tint },
  footer: { ...type.footnote, color: colors.secondary, textAlign: 'center', marginTop: spacing.xl },
});
