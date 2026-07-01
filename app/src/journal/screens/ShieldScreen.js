import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, IconTile, Sym } from '../components';
import { colors, type, spacing } from '../theme';

/**
 * Clean mock of the iOS Shield screen (native ShieldConfiguration extension —
 * SPEC §5). Replaces a blocked app; its CTA deep-links into Compose.
 */
export default function ShieldScreen({ appName = 'Instagram', appIcon = 'logo-instagram', appColor = colors.tiles.pink, onJournal, onClose }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <IconTile icon={appIcon} color={appColor} size={84} glyph={46} />
          <View style={styles.lockBadge}><Sym name="lock-closed" size={16} color="#fff" /></View>
        </View>
        <Text style={styles.title}>{appName} is paused</Text>
        <Text style={styles.sub}>Take a moment before opening this. One short entry — by voice if you like — and it opens right up.</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.cta}>
          <Button title="Write to unlock" onPress={onJournal} />
          <Pressable onPress={onClose} hitSlop={8}><Text style={styles.escape}>I need access now</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.groupedBg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrap: { marginBottom: spacing.xl },
  lockBadge: { position: 'absolute', bottom: -6, right: -6, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.label, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.groupedBg },
  title: { ...type.title1, color: colors.label, textAlign: 'center' },
  sub: { ...type.body, color: colors.secondary, textAlign: 'center', lineHeight: 24, marginTop: spacing.sm, paddingHorizontal: spacing.md },
  cta: { alignSelf: 'stretch', gap: spacing.md, alignItems: 'center' },
  escape: { ...type.subhead, color: colors.secondary, paddingVertical: spacing.sm },
});
