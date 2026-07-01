import React from 'react';
import { View, Text, Pressable, TextInput, Alert, Platform } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { Toggle } from '../ui';
import { Scroll, Section, Card } from './kit';

function editDayStart(current, onSet) {
  if (Platform.OS === 'ios' && Alert.prompt) {
    Alert.prompt(
      'Day starts at',
      'When the morning gate re-engages each day (24h, e.g. 05:00).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: (val) => { if (val && /^\d{1,2}:\d{2}$/.test(val.trim())) onSet(val.trim()); } },
      ],
      'plain-text',
      current,
    );
  }
}

const divider = { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' };

function NavRow({ label, value, onPress, last }) {
  const content = (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }, last ? null : divider]}>
      <Text style={{ fontSize: 15, color: C.ink, fontFamily: SANS }}>{label}</Text>
      <Text style={{ color: C.mute, fontSize: 14, fontFamily: SANS }}>{value}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

function Stepper({ v, M }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, paddingHorizontal: 16 }, divider]}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: C.ink, fontFamily: SANS }}>Questions per session</Text>
        <Text style={{ fontSize: 12.5, color: C.mute, marginTop: 2, fontFamily: SANS }}>{v.askSummary}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => M.setAsk(-1)} style={stepBtn}>
          <Text style={{ color: v.askCanDec ? C.ink : C.off, fontSize: 18, lineHeight: 18, fontFamily: SANS }}>−</Text>
        </Pressable>
        <Text style={{ fontFamily: SERIF, fontSize: 22, color: C.ink, minWidth: 14, textAlign: 'center' }}>{v.askCount}</Text>
        <Pressable onPress={() => M.setAsk(1)} style={stepBtn}>
          <Text style={{ color: v.askCanInc ? C.ink : C.off, fontSize: 18, lineHeight: 18, fontFamily: SANS }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const stepBtn = { width: 30, height: 30, borderRadius: 15, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' };

function QuestionRow({ q }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 16 }, divider]}>
      <TextInput
        value={q.text}
        onChangeText={q.onEdit}
        placeholder="Write a question…"
        placeholderTextColor={C.faint}
        style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: 21, color: q.on ? C.ink : C.faint, paddingVertical: 4, fontFamily: SANS }}
      />
      <Toggle on={q.on} onPress={q.onToggle} />
    </View>
  );
}

export default function Settings({ v, M }) {
  return (
    <Scroll>
      <Text style={{ fontFamily: SERIF, fontSize: 27, color: C.ink, marginBottom: 4 }}>Settings</Text>

      <Section>Blocking</Section>
      <Card style={{ overflow: 'hidden' }}>
        <NavRow
          label="Blocked apps"
          value={`${v.configured ? v.appsBlocked : 0} apps ›`}
          onPress={M.configureBlockedApps}
        />
        <NavRow label="Day starts at" value={`${v.dayStartTime} ›`} onPress={() => editDayStart(v.dayStartTime, M.setDayStartTime)} />
        <NavRow label="Unlock rule" value="Journal to open the day" last />
      </Card>

      <Section>Escape hatch</Section>
      <Card style={{ overflow: 'hidden' }}>
        <NavRow label="Free passes" value={`${v.freePasses} per week`} last />
      </Card>

      <Text style={{ ...upperLabel, marginTop: 22, marginBottom: 6 }}>Journaling questions</Text>
      <Text style={{ fontSize: 13, color: C.mute, lineHeight: 19.5, marginBottom: 10, fontFamily: SANS }}>
        These are what we'll ask out loud each time you journal. Tap any one to reword it.
      </Text>
      <Card style={{ overflow: 'hidden' }}>
        <Stepper v={v} M={M} />
        {v.qList.map((q, i) => <QuestionRow key={i} q={q} />)}
        <Pressable onPress={M.addQ} style={{ padding: 15, paddingHorizontal: 16 }}>
          <Text style={{ color: C.acc, fontSize: 15, fontWeight: '600', fontFamily: SANS }}>+ Add a question</Text>
        </Pressable>
      </Card>

      <Section>Privacy</Section>
      <Card style={{ padding: 16 }}>
        <Text style={{ color: C.dim, fontSize: 14, lineHeight: 22.4, fontFamily: SANS }}>
          Your reflections are stored only on this phone. We never see them, and there's no account to sign in to.
        </Text>
      </Card>
    </Scroll>
  );
}

const upperLabel = { fontSize: 12, letterSpacing: 1.08, textTransform: 'uppercase', color: C.mute, fontFamily: SANS };
