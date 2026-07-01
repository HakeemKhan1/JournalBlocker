import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { Orb, Glow, Particles, Lock, CheckSmall, AppTile } from '../ui';
import { fill } from './kit';

const upper = { fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: C.mute, fontFamily: SANS };

function AppsRow({ apps }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 51 }}>
      {apps.map((a) => <AppTile key={a} label={a} />)}
    </View>
  );
}

export default function Home({ v, M }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12 }}>
        <View>
          <Text style={upper}>Tuesday · evening</Text>
          <Text style={{ fontFamily: SERIF, fontSize: 27, color: C.ink, marginTop: 1 }}>Today</Text>
        </View>

        {/* streak pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, alignSelf: 'center', marginTop: 16, backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 22, color: C.warm }}>{v.streak}</Text>
            <Text style={{ fontSize: 12, color: C.dim, fontFamily: SANS }}>day streak</Text>
          </View>
          <View style={{ width: 1, height: 18, backgroundColor: C.b12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 18, color: C.soft }}>{v.longest}</Text>
            <Text style={{ fontSize: 12, color: C.mute, fontFamily: SANS }}>best</Text>
          </View>
        </View>

        {/* orb */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          <View style={{ width: 236, height: 236, alignItems: 'center', justifyContent: 'center' }}>
            <Glow size={290} opacity={v.accentGlow} />
            <Pressable onPress={M.launchOrb}><Orb size={184} /></Pressable>
          </View>
          <View style={{ alignItems: 'center' }}>
            {v.journaledToday ? (
              <>
                <Text style={{ fontFamily: SERIF, fontSize: 23, color: C.ink }}>Day unlocked</Text>
                <Text style={{ color: C.dim, fontSize: 15, marginTop: 5, fontFamily: SANS }}>Nicely done. Journal again whenever you like.</Text>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: SERIF, fontSize: 23, color: C.ink }}>Tap to begin</Text>
                <Text style={{ color: C.dim, fontSize: 15, marginTop: 5, fontFamily: SANS }}>One gentle session unlocks your day</Text>
              </>
            )}
            <Pressable onPress={M.startCompose} style={{ marginTop: 15, backgroundColor: C.s05, borderWidth: 1, borderColor: C.b10, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999 }}>
              <Text style={{ color: C.soft, fontSize: 14, fontFamily: SANS }}>Open a blank entry instead</Text>
            </Pressable>
          </View>
        </View>

        {/* blocked / unlocked card */}
        {v.journaledToday ? (
          <View style={{ backgroundColor: 'rgba(123,191,158,0.09)', borderWidth: 1, borderColor: 'rgba(123,191,158,0.26)', borderRadius: 18, padding: 15, gap: 13 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(123,191,158,0.16)', alignItems: 'center', justifyContent: 'center' }}><CheckSmall /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 15, color: C.greenLite, fontFamily: SANS }}>{v.appsBlocked} apps open</Text>
                <Text style={{ fontSize: 13, color: C.dim, marginTop: 1, fontFamily: SANS }}>Unlocked for the rest of today</Text>
              </View>
            </View>
            <AppsRow apps={v.blockedApps} />
          </View>
        ) : (
          <Pressable onPress={() => M.go('shield')} style={{ backgroundColor: 'rgba(245,169,127,0.09)', borderWidth: 1, borderColor: C.accBorder, borderRadius: 18, padding: 15, gap: 13 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(245,169,127,0.16)', alignItems: 'center', justifyContent: 'center' }}><Lock /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 15, color: C.warm, fontFamily: SANS }}>{v.appsBlocked} apps blocked</Text>
                <Text style={{ fontSize: 13, color: C.dim, marginTop: 1, fontFamily: SANS }}>Resting until you've journaled today</Text>
              </View>
              <Text style={{ color: C.mute, fontSize: 18 }}>›</Text>
            </View>
            <AppsRow apps={v.blockedApps} />
          </Pressable>
        )}
      </View>

      {/* orb launch */}
      {v.launching ? (
        <View style={{ ...fill, zIndex: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,9,19,0.7)' }}>
          <Orb size={200} />
        </View>
      ) : null}

      {/* celebration */}
      {v.showCelebration ? (
        <Pressable onPress={M.dismissCeleb} style={{ ...fill, zIndex: 40, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: 'rgba(10,9,19,0.95)' }}>
          <View style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Glow size={200} opacity={0.9} />
            <View style={{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' }}>
              <Orb size={104} breathe={false} style={{ position: 'absolute' }} />
              <Text style={{ fontFamily: SERIF, fontSize: 38, color: C.onAcc }}>{v.goal}</Text>
            </View>
            <Particles list={v.particles} />
          </View>
          <Text style={{ fontFamily: SERIF, fontSize: 30, color: C.ink }}>{v.goal}-day streak!</Text>
          <Text style={{ color: C.soft, fontSize: 16, lineHeight: 25, marginTop: 10, maxWidth: 270, textAlign: 'center', fontFamily: SANS }}>You showed up every day. That's the whole practice, quietly and beautifully done.</Text>
          <Text style={{ color: C.faint, fontSize: 13, marginTop: 22, fontFamily: SANS }}>Tap anywhere to continue</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
