import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { Orb, Glow, Lock, AppTile, GButton } from '../ui';

export default function Shield({ v, M, s }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 34 }}>
      {/* orb + lock */}
      <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Glow size={180} opacity={0.5} />
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Orb size={92} />
          <View style={{ position: 'absolute' }}>
            <Lock color={C.onAcc} scale={1.3} />
          </View>
        </View>
      </View>

      <Text style={{ fontFamily: SERIF, fontSize: 29, lineHeight: 36, color: C.ink, textAlign: 'center' }}>These apps are resting.</Text>
      <Text style={{ color: C.soft, fontSize: 16, lineHeight: 26, marginTop: 14, maxWidth: 290, textAlign: 'center', fontFamily: SANS }}>
        You reached for Instagram. Take a breath instead, and one short reflection opens the day right back up.
      </Text>

      {/* dimmed app row */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
        {v.unlockedApps.map((a) => <AppTile key={a} label={a} size={44} radius={12} dim font={14} />)}
      </View>

      <GButton label="Start today's journal" onPress={M.goFeelings} style={{ marginTop: 30, width: '100%', maxWidth: 300 }} />

      <Pressable onPress={M.goFeelings} style={{ marginTop: 12 }}>
        <Text style={{ color: C.dim, fontSize: 14, fontFamily: SANS }}>Use a free pass · {v.freePasses} left</Text>
      </Pressable>

      <Text style={{ color: C.faint, fontSize: 12, marginTop: 18, lineHeight: 18, textAlign: 'center', fontFamily: SANS }}>
        Closed until you've journaled · change anytime in Settings
      </Text>
    </View>
  );
}
