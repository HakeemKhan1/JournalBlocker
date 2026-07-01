import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SANS, SERIF } from '../theme';
import { CheckSmall, GButton } from '../ui';
import { iconStyle } from '../controller';
import { fill, Scroll, BackLink } from './kit';

function EntryCard({ e }) {
  return (
    <Pressable onPress={e.onOpen} style={{ backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 18, padding: 16, paddingHorizontal: 17, gap: 7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: C.acc, fontFamily: SANS }}>{e.dateShort}</Text>
        <Text style={{ fontSize: 12, color: C.faint, fontFamily: SANS }}>{e.mins}</Text>
      </View>
      <Text style={{ fontFamily: SERIF, fontSize: 19, color: C.ink, lineHeight: 24 }}>{e.title}</Text>
      <Text style={{ fontSize: 14, color: C.dim, lineHeight: 21, fontFamily: SANS }}>{e.preview}</Text>
    </Pressable>
  );
}

export default function Journal({ v, M }) {
  return (
    <View style={{ flex: 1 }}>
      <Scroll>
        <BackLink label="Reflections" onPress={M.closeJournalScreen} />

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 16 }}>
          <View style={{ marginTop: 5 }}><View style={iconStyle(v.journalIcon.color, v.journalIcon.shape, 34)} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 26, color: C.ink, lineHeight: 30 }}>{v.journalTitle}</Text>
            <Text style={{ fontSize: 13.5, color: C.mute, marginTop: 4, fontFamily: SANS }}>{v.journalCount} entries · filed automatically</Text>
          </View>
          <Pressable onPress={M.openIconEditor} style={{ backgroundColor: C.s05, borderWidth: 1, borderColor: C.b10, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 999 }}>
            <Text style={{ color: C.soft, fontSize: 13, fontFamily: SANS }}>Customize</Text>
          </Pressable>
        </View>

        <View style={{ gap: 11, marginTop: 20 }}>
          {v.journalList.map((e) => <EntryCard key={e.id} e={e} />)}
        </View>
      </Scroll>

      {/* icon editor sheet */}
      {v.showIconEditor ? (
        <Pressable onPress={M.closeIconEditor} style={{ ...fill, zIndex: 25, justifyContent: 'flex-end', backgroundColor: 'rgba(8,7,16,0.55)' }}>
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <LinearGradient colors={['#2a2450', '#18142e']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: C.b10, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 26 }}>
              <View style={{ width: 38, height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontFamily: SERIF, fontSize: 22, color: C.ink }}>Customize this journal</Text>
              <Text style={{ fontSize: 13.5, color: C.mute, marginTop: 4, lineHeight: 20, fontFamily: SANS }}>Pick a colour and a shape. It shows up wherever this journal appears.</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20, marginBottom: 4 }}>
                <View style={iconStyle(v.journalIcon.color, v.journalIcon.shape, 46)} />
                <Text style={{ fontFamily: SERIF, fontSize: 18, color: C.ink }}>{v.journalTitle}</Text>
              </View>

              <Text style={{ fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: C.mute, marginTop: 18, marginBottom: 10, fontFamily: SANS }}>Colour</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {v.colorOptions.map((c) => (
                  <Pressable key={c.color} onPress={c.onPick} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.color, alignItems: 'center', justifyContent: 'center' }}>
                    {c.active ? <View style={{ width: 13, height: 7, borderLeftWidth: 2.4, borderBottomWidth: 2.4, borderColor: C.onAcc, transform: [{ rotate: '-45deg' }, { translateY: -1 }] }} /> : null}
                  </Pressable>
                ))}
              </View>

              <Text style={{ fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase', color: C.mute, marginTop: 20, marginBottom: 10, fontFamily: SANS }}>Shape</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {v.shapeOptions.map((o) => (
                  <Pressable key={o.shape} onPress={o.onPick} style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: o.active ? C.accSurfHi : C.s04, borderWidth: 1, borderColor: o.active ? C.acc : C.b10, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={iconStyle(o.color, o.shape, 18)} />
                  </Pressable>
                ))}
              </View>

              <GButton label="Done" onPress={M.closeIconEditor} style={{ marginTop: 24 }} />
            </LinearGradient>
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}
