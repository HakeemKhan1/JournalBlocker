import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Sym } from '../components';
import { colors, type, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

/**
 * Onboarding — clean first page, then voice, blocking, and one permission ask.
 * Pages cross-fade and slide for a smooth Apple-style transition.
 */
const PAGES = [
  {
    kind: 'intro',
    title: 'Journal',
    body: 'A calmer place to think — and a gentle nudge to stay off the apps that pull you away.',
    cta: 'Continue',
  },
  {
    kind: 'feature', icon: 'mic', tint: colors.tiles.indigo,
    title: 'Just say it',
    body: 'Talk, and your words become a clean, written entry. No typing, no blank page to stare at.',
    cta: 'Continue',
  },
  {
    kind: 'feature', icon: 'lock-closed', tint: colors.tint,
    title: 'Less scrolling,\nmore you',
    body: 'Your distracting apps stay closed until you’ve taken a minute to write. A small gate, easily passed.',
    cta: 'Continue',
  },
  {
    kind: 'feature', icon: 'shield-checkmark', tint: colors.tiles.green,
    title: 'Private by design',
    body: 'Screen Time pauses your apps — Apple keeps your choices private. One gentle daily reminder, and your entries never leave your phone.',
    cta: 'Get Started',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const page = PAGES[step];
  const last = step === PAGES.length - 1;

  const next = () => {
    if (last) return onFinish?.();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(tx, { toValue: -width * 0.18, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      setStep((s) => s + 1);
      tx.setValue(width * 0.18);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(tx, { toValue: 0, useNativeDriver: true, friction: 9, tension: 60 }),
      ]).start();
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.content, { opacity, transform: [{ translateX: tx }] }]}>
        {page.kind === 'intro' ? (
          <View style={styles.mark}>
            <LinearGradient colors={['#F2956E', colors.tint]} style={styles.markFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Sym name="book" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: page.tint + '1A' }]}>
            <Sym name={page.icon} size={40} color={page.tint} />
          </View>
        )}
        <Text style={[styles.title, page.kind === 'intro' && styles.titleIntro]}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => <View key={i} style={[styles.dot, i === step && styles.dotActive]} />)}
        </View>
        <Button title={page.cta} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
  mark: { marginBottom: spacing.sm },
  markFill: { width: 92, height: 92, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { ...type.largeTitle, fontSize: 32, color: colors.label, textAlign: 'center' },
  titleIntro: { fontSize: 40 },
  body: { ...type.body, color: colors.secondary, textAlign: 'center', lineHeight: 24, maxWidth: 320 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.separator },
  dotActive: { backgroundColor: colors.tint, width: 20 },
});
