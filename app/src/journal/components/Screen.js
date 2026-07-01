import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type, spacing } from '../theme';
import Sym from './Sym';

/**
 * Standard screen with an iOS large title. `onBack` shows a nav back button;
 * `right` is a trailing nav element. `grouped` uses systemGroupedBackground.
 */
export default function Screen({ title, onBack, backLabel = 'Back', left, right, children, scroll = true, grouped = true, contentStyle }) {
  const bg = grouped ? colors.groupedBg : colors.bg;
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? { showsVerticalScrollIndicator: false, contentContainerStyle: [styles.content, contentStyle] }
    : { style: [styles.content, contentStyle] };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: bg }]}>
      {(onBack || left || right) && (
        <View style={styles.navbar}>
          <View style={styles.navSide}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
                <Sym name="chevron-back" size={26} color={colors.tint} />
                <Text style={styles.backText} numberOfLines={1}>{backLabel}</Text>
              </Pressable>
            ) : left}
          </View>
          <View style={[styles.navSide, styles.navRight]}>{right}</View>
        </View>
      )}
      <Body {...bodyProps}>
        {!!title && <Text style={styles.largeTitle}>{title}</Text>}
        {children}
      </Body>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  navbar: { height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base },
  navSide: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  navRight: { justifyContent: 'flex-end' },
  back: { flexDirection: 'row', alignItems: 'center' },
  backText: { ...type.body, color: colors.tint, marginLeft: -2, maxWidth: 120 },
  content: { paddingBottom: 120 },
  largeTitle: { ...type.largeTitle, color: colors.label, paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.md },
});
