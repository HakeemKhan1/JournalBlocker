import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { Scroll, BackLink } from './kit';

export default function Entry({ v, M }) {
  const entry = v.entry;
  return (
    <Scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ maxWidth: '74%' }}>
          <BackLink label={v.entryJournalName} onPress={M.closeEntryScreen} />
        </View>
        <Pressable style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.soft, fontSize: 16, lineHeight: 18, fontFamily: SANS }}>⋯</Text>
        </Pressable>
      </View>

      {entry ? (
        <>
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: C.acc, fontFamily: SANS }}>{entry.when}</Text>
            <Text style={{ fontFamily: SERIF, fontSize: 30, color: C.ink, lineHeight: 34, marginTop: 7 }}>{entry.date}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 11 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: entry.moodColor }} />
              <Text style={{ color: C.mute, fontSize: 13, fontFamily: SANS }}>Felt {entry.mood} · {entry.mins} read</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: C.s08, marginTop: 20 }} />

          <View style={{ gap: 22, marginTop: 22 }}>
            {entry.blocks.map((b, i) => (
              <View key={i}>
                {b.q ? <Text style={{ fontSize: 12.5, letterSpacing: 0.4, color: C.mute, marginBottom: 9, lineHeight: 18, fontFamily: SANS }}>{b.q}</Text> : null}
                <Text style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 33, color: C.ink2 }}>{b.text}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Scroll>
  );
}
