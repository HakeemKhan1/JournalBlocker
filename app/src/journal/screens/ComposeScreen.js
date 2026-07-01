import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetHeader, Sym, IconTile } from '../components';
import { colors, type, spacing, radius } from '../theme';
import { journals, moods, dailyPrompt } from '../data/mockState';

const RAW = "okay so today was kind of a lot but in a good way i finally shipped the first build and then i made myself go outside instead of refreshing my phone and the walk honestly fixed my whole mood";
const POLISHED = "Today was a lot — but in a good way. I finally shipped the first build, then made myself go outside instead of refreshing my phone. The walk honestly fixed my whole mood.";

/** New entry, voice-first. Simulated dictation + an AI polish pass. */
export default function ComposeScreen({ fromShield = false, journalId = 'personal', onSave, onCancel }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [polished, setPolished] = useState(false);
  const [journal, setJournal] = useState(journalId);
  const [mood, setMood] = useState('good');
  const stream = useRef(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!listening) { pulse.setValue(0); return; }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }));
    loop.start();
    let i = text.length;
    stream.current = setInterval(() => {
      i += 2;
      setText(RAW.slice(0, Math.min(i, RAW.length)));
      if (i >= RAW.length) { clearInterval(stream.current); setListening(false); }
    }, 40);
    return () => { clearInterval(stream.current); loop.stop(); };
  }, [listening]);

  const toggle = () => { if (listening) { clearInterval(stream.current); setListening(false); } else { setPolished(false); setListening(true); } };
  const polish = () => { setPolishing(true); setTimeout(() => { setText(POLISHED); setPolishing(false); setPolished(true); }, 1300); };

  const canSave = text.trim().length > 0 && !listening && !polishing;
  const showPolish = text.trim().length > 0 && !listening && !polished && !polishing;
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <SheetHeader title="New Entry" onCancel={onCancel} onDone={() => onSave?.({ journal, mood })} doneLabel="Save" doneEnabled={canSave} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.prompt}>{dailyPrompt}</Text>

        <TextInput
          value={text}
          onChangeText={(v) => { setText(v); setPolished(false); }}
          multiline
          placeholder="Tap the mic and talk, or type here…"
          placeholderTextColor={colors.tertiary}
          style={styles.input}
          editable={!listening && !polishing}
        />

        {polishing && <View style={styles.aiRow}><Sym name="sparkles" size={14} color={colors.tiles.indigo} /><Text style={styles.aiText}>Polishing with AI…</Text></View>}
        {polished && <View style={styles.aiRow}><Sym name="sparkles" size={14} color={colors.tiles.indigo} /><Text style={styles.aiText}>Cleaned up by AI · edit freely, then Save</Text></View>}

        <View style={styles.micWrap}>
          {listening && <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />}
          <Pressable onPress={toggle} style={[styles.mic, listening && styles.micActive]} accessibilityLabel={listening ? 'Stop dictation' : 'Start voice dictation'}>
            <Sym name={listening ? 'stop' : 'mic'} size={26} color="#fff" />
          </Pressable>
          <Text style={styles.micHint}>{listening ? 'Listening — tap to stop' : 'Speak your entry'}</Text>
          {showPolish && (
            <Pressable onPress={polish} style={styles.polishBtn}>
              <Sym name="sparkles" size={15} color={colors.tiles.indigo} />
              <Text style={styles.polishText}>Polish with AI</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.label}>Journal</Text>
        <View style={styles.chipRow}>
          {journals.map((j) => (
            <Pressable key={j.id} onPress={() => setJournal(j.id)} style={[styles.chip, journal === j.id && { backgroundColor: j.color + '1A', borderColor: j.color }]}>
              <IconTile icon={j.icon} color={j.color} size={20} glyph={12} />
              <Text style={styles.chipText}>{j.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodRow}>
          {moods.map((m) => (
            <Pressable key={m.id} onPress={() => setMood(m.id)} style={[styles.moodCell, mood === m.id && { backgroundColor: m.color + '22', borderColor: m.color }]}>
              <Sym name={m.icon} size={24} color={mood === m.id ? m.color : colors.secondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.base, paddingBottom: spacing.xxl, gap: spacing.md },
  prompt: { ...type.callout, color: colors.secondary, lineHeight: 22 },
  input: { ...type.title3, fontWeight: '400', color: colors.label, lineHeight: 28, minHeight: 140, textAlignVertical: 'top' },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center' },
  aiText: { ...type.footnote, color: colors.tiles.indigo, fontWeight: '500' },
  micWrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  ring: { position: 'absolute', top: 0, width: 64, height: 64, borderRadius: 32, backgroundColor: colors.tiles.indigo },
  mic: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.tiles.indigo, alignItems: 'center', justifyContent: 'center' },
  micActive: { backgroundColor: colors.red },
  micHint: { ...type.subhead, color: colors.secondary },
  polishBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.tiles.indigo + '14', borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 16, marginTop: 4 },
  polishText: { ...type.subhead, color: colors.tiles.indigo, fontWeight: '600' },
  label: { ...type.footnote, color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: spacing.xs, marginTop: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.cell, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 10, paddingRight: 12, borderWidth: 1.5, borderColor: colors.separator },
  chipText: { ...type.subhead, color: colors.label, fontWeight: '500' },
  moodRow: { flexDirection: 'row', gap: spacing.sm },
  moodCell: { width: 52, height: 52, borderRadius: radius.card, backgroundColor: colors.cell, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.separator },
});
