import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { Orb, Glow, GButton } from '../ui';
import { upper, CloseBtn } from './kit';

function Chip({ f }) {
  return (
    <Pressable
      onPress={f.onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: f.on ? C.accSurfHi : C.s04,
        borderWidth: 1,
        borderColor: f.on ? C.acc : C.b10,
      }}>
      <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: f.dot }} />
      <Text style={{ fontSize: 15, color: f.on ? C.warm : C.soft, fontFamily: SANS }}>{f.label}</Text>
    </Pressable>
  );
}

export default function Feelings({ v, M, s }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 26 }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <CloseBtn onPress={() => M.go('home')} />
      </View>

      {/* orb + title */}
      <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
          <Glow size={72} opacity={0.5} />
          <Orb size={48} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[upper, { fontSize: 12, letterSpacing: 1.08 }]}>Before Instagram opens</Text>
          <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 31, color: C.ink, marginTop: 3 }}>How are you feeling?</Text>
        </View>
      </View>

      <Text style={{ color: C.dim, fontSize: 14.5, lineHeight: 22, marginTop: 12, fontFamily: SANS }}>
        Take one breath and name it. Pick as many as fit — it helps your reflections find their pattern.
      </Text>

      {/* chips */}
      <ScrollView style={{ flex: 1, marginTop: 18 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignContent: 'flex-start' }} showsVerticalScrollIndicator={false}>
        {v.feelingList.map((f) => <Chip key={f.id} f={f} />)}
      </ScrollView>

      {/* bottom row */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
        <Pressable onPress={M.startVoice} style={{ paddingVertical: 17, paddingHorizontal: 22, borderRadius: 18, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.ink, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>Skip</Text>
        </Pressable>
        <GButton label={v.feelingsCta} onPress={M.startVoice} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
