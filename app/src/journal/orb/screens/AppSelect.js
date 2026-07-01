import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { AppTile, Toggle, GButton } from '../ui';
import { Scroll } from './kit';

function CatRow({ c }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 16, padding: 14, paddingHorizontal: 16 }}>
      <AppTile label={c.letter} size={40} radius={12} font={15} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink, fontFamily: SANS }}>{c.name}</Text>
          {c.rec ? (
            <Text style={{ fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: C.acc, backgroundColor: 'rgba(245,169,127,0.12)', paddingVertical: 2, paddingHorizontal: 7, borderRadius: 99, overflow: 'hidden', fontFamily: SANS }}>Recommended</Text>
          ) : null}
        </View>
        <Text style={{ fontSize: 13, color: C.mute, marginTop: 1, fontFamily: SANS }}>{c.desc}</Text>
      </View>
      <Toggle on={c.on} onPress={c.onToggle} />
    </View>
  );
}

export default function AppSelect({ v, M }) {
  return (
    <Scroll>
      <Text style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 32.5, color: C.ink }}>What should we keep closed?</Text>
      <Text style={{ color: C.dim, fontSize: 15, lineHeight: 23.25, marginTop: 8, fontFamily: SANS }}>
        Start with our recommended set, the usual attention-grabbers. Change it anytime.
      </Text>

      <Pressable onPress={M.useRecommended}
        style={{ marginTop: 16, paddingVertical: 14, borderRadius: 16, backgroundColor: C.accSurf, borderWidth: 1, borderColor: C.accBorderHi, alignItems: 'center' }}>
        <Text style={{ color: C.warm, fontSize: 15, fontWeight: '600', fontFamily: SANS }}>Use recommended set</Text>
      </Pressable>

      <View style={{ marginTop: 18, gap: 10 }}>
        {v.catList.map((c, i) => <CatRow key={i} c={c} />)}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
        <Text style={{ flex: 1, color: C.faint, fontSize: 13, lineHeight: 19.5, fontFamily: SANS }}>
          We never see which apps you use. Blocking happens on your device.
        </Text>
      </View>

      <GButton label="Choose apps to block" onPress={() => M.configureBlockedApps().then(() => M.go('settings'))} style={{ marginTop: 16 }} />
    </Scroll>
  );
}
