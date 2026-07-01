import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SANS, SERIF } from '../theme';
import { AppTile, GButton, Chevron } from '../ui';
import { Scroll, upper } from './kit';

function Segmented({ segList }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 14, padding: 4, gap: 4, marginTop: 16 }}>
      {segList.map((seg) => (
        <Pressable key={seg.value} onPress={seg.onPress}
          style={{ flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', backgroundColor: seg.active ? C.accSurfHi : 'transparent' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: seg.active ? C.warm : C.soft, fontFamily: SANS }}>{seg.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Hero({ RD }) {
  return (
    <LinearGradient colors={['rgba(245,169,127,0.16)', 'rgba(106,74,166,0.16)']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
      style={{ marginTop: 16, borderWidth: 1, borderColor: C.accBorder, borderRadius: 22, padding: 22 }}>
      <Text style={{ fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: C.acc, fontFamily: SANS }}>{RD.label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 13, marginTop: 10 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 62, lineHeight: 53, color: C.warm }}>{RD.heroNum}</Text>
        <Text style={{ fontSize: 16, lineHeight: 22, color: C.ink, paddingBottom: 7, flex: 1, fontFamily: SANS }}>times you paused and let it go</Text>
      </View>
      <Text style={{ color: C.soft, fontSize: 14.5, lineHeight: 22, marginTop: 15, fontFamily: SANS }}>{RD.heroSub}</Text>
    </LinearGradient>
  );
}

function ReachPattern({ RD, maxWin }) {
  return (
    <>
      <Text style={{ fontWeight: '600', fontSize: 15, color: C.ink, marginTop: 24, fontFamily: SANS }}>Your reach pattern</Text>
      <Text style={{ fontSize: 13, color: C.mute, lineHeight: 19.5, marginTop: 4, fontFamily: SANS }}>When the urge tends to show up across your day.</Text>
      <View style={{ marginTop: 14, backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 20, padding: 18, gap: 15 }}>
        {RD.windows.map((w, i) => {
          const isMax = w.pct === maxWin;
          return (
            <View key={i}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
                <Text style={{ fontSize: 14, color: C.ink, fontFamily: SANS }}>
                  {w.label} <Text style={{ color: C.faint, fontSize: 12, fontFamily: SANS }}>{w.sub}</Text>
                </Text>
                {isMax ? (
                  <Text style={{ fontSize: 11, letterSpacing: 0.55, textTransform: 'uppercase', color: C.acc, fontFamily: SANS }}>softest spot</Text>
                ) : null}
              </View>
              <View style={{ height: 12, borderRadius: 99, backgroundColor: C.s05, overflow: 'hidden' }}>
                {isMax ? (
                  <LinearGradient colors={['rgba(245,169,127,0.85)', 'rgba(208,127,155,0.7)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ height: '100%', width: `${w.pct}%`, borderRadius: 99, shadowColor: C.acc, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }} />
                ) : (
                  <View style={{ height: '100%', width: `${w.pct}%`, borderRadius: 99, backgroundColor: 'rgba(245,169,127,0.4)' }} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

function AppRow({ a, i, expandedApp, M }) {
  const open = expandedApp === i;
  return (
    <Pressable onPress={() => M.toggleApp(i)}
      style={{ backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 16, padding: 14, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <AppTile label={a.abbr} size={34} radius={10} font={12} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, color: C.ink, fontFamily: SANS }}>{a.name}</Text>
            <Text style={{ fontSize: 13, color: C.mute, fontFamily: SANS }}>{a.count}</Text>
          </View>
          <View style={{ height: 7, borderRadius: 99, backgroundColor: C.s05, marginTop: 7, overflow: 'hidden' }}>
            <LinearGradient colors={['rgba(245,169,127,0.85)', 'rgba(208,127,155,0.7)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: '100%', width: `${a.bar}%`, borderRadius: 99 }} />
          </View>
        </View>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Chevron dir="right" color={C.faint} size={9} />
        </View>
      </View>
      {open ? (
        <View style={{ marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 11, paddingHorizontal: 13 }}>
            <Text style={{ fontSize: 11, letterSpacing: 0.55, textTransform: 'uppercase', color: C.mute, fontFamily: SANS }}>Peak time</Text>
            <Text style={{ fontSize: 14, color: C.ink, marginTop: 4, fontFamily: SANS }}>{a.peak}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 11, paddingHorizontal: 13 }}>
            <Text style={{ fontSize: 11, letterSpacing: 0.55, textTransform: 'uppercase', color: C.mute, fontFamily: SANS }}>Often feeling</Text>
            <Text style={{ fontSize: 14, color: C.acc, marginTop: 4, fontFamily: SANS }}>{a.mood}</Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

function FeelingPill({ side, top, active, dot, dotColor, children }) {
  return (
    <View style={{
      position: 'absolute', [side]: 0, top, width: 104, height: 44, borderRadius: 13,
      backgroundColor: active ? 'rgba(245,169,127,0.13)' : C.s05,
      borderWidth: 1, borderColor: active ? 'rgba(245,169,127,0.30)' : C.b10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {dot ? <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: dotColor }} /> : null}
      <Text style={{ fontSize: dot ? 13.5 : 14, fontWeight: active && !dot ? '600' : '400', color: active ? C.warm : C.ink, fontFamily: SANS }}>{children}</Text>
    </View>
  );
}

function HowYouFelt() {
  return (
    <>
      <Text style={{ fontWeight: '600', fontSize: 15, color: C.ink, marginTop: 24, fontFamily: SANS }}>How you felt</Text>
      <Text style={{ fontSize: 13, color: C.mute, lineHeight: 19.5, marginTop: 4, fontFamily: SANS }}>The feelings that tend to lead you back to a screen.</Text>
      <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
        style={{ marginTop: 14, borderWidth: 1, borderColor: C.s08, borderRadius: 20, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 14 }}>
          <Text style={{ fontSize: 11, letterSpacing: 0.66, textTransform: 'uppercase', color: C.mute, fontFamily: SANS }}>Feeling</Text>
          <Text style={{ fontSize: 11, letterSpacing: 0.66, textTransform: 'uppercase', color: C.mute, fontFamily: SANS }}>You opened</Text>
        </View>
        <View style={{ width: 280, height: 204, alignSelf: 'center' }}>
          <Svg width={280} height={204} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
            <Path d="M104,28 C150,28 150,28 176,28" fill="none" stroke="#f5a97f" strokeWidth={5} strokeLinecap="round" opacity={0.95} />
            <Path d="M104,28 C150,28 150,102 176,102" fill="none" stroke="#c4bee6" strokeWidth={2} strokeLinecap="round" opacity={0.28} />
            <Path d="M104,102 C150,102 150,102 176,102" fill="none" stroke="#f5a97f" strokeWidth={3.5} strokeLinecap="round" opacity={0.6} />
            <Path d="M104,102 C150,102 150,176 176,176" fill="none" stroke="#c4bee6" strokeWidth={2} strokeLinecap="round" opacity={0.28} />
            <Path d="M104,176 C150,176 150,176 176,176" fill="none" stroke="#f5a97f" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
            <Path d="M104,176 C150,176 150,28 176,28" fill="none" stroke="#c4bee6" strokeWidth={1.5} strokeLinecap="round" opacity={0.2} />
          </Svg>
          <FeelingPill side="left" top={6} active>Anxious</FeelingPill>
          <FeelingPill side="left" top={80}>Bored</FeelingPill>
          <FeelingPill side="left" top={154}>Tired</FeelingPill>
          <FeelingPill side="right" top={6} active dot dotColor={C.acc}>Instagram</FeelingPill>
          <FeelingPill side="right" top={80} dot dotColor={C.mute}>TikTok</FeelingPill>
          <FeelingPill side="right" top={154} dot dotColor={C.mute}>YouTube</FeelingPill>
        </View>
        <View style={{ marginTop: 6, backgroundColor: 'rgba(245,169,127,0.1)', borderRadius: 14, padding: 15, paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, lineHeight: 25.5, color: C.ink }}>"You reach for Instagram most when you're anxious."</Text>
          <Text style={{ color: C.dim, fontSize: 13.5, marginTop: 7, fontFamily: SANS }}>Noticing the feeling is half the work.</Text>
        </View>
      </LinearGradient>
    </>
  );
}

function SmallWin({ RD }) {
  return (
    <>
      <Text style={{ fontWeight: '600', fontSize: 15, color: C.ink, marginTop: 24, fontFamily: SANS }}>A small win</Text>
      <View style={{ marginTop: 14, backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 20, padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: C.mute, fontFamily: SANS }}>Times you let it go</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: C.green }} />
            <Text style={{ fontSize: 13, color: C.green, fontFamily: SANS }}>{RD.trendDelta}</Text>
          </View>
        </View>
        <Svg width="100%" height={58} viewBox="0 0 280 58" preserveAspectRatio="none" style={{ marginTop: 12 }}>
          <Path d="M0,46 L47,42 L93,44 L140,33 L187,28 L233,17 L280,9 L280,58 L0,58 Z" stroke="none" fill="rgba(245,169,127,0.12)" />
          <Path d="M0,46 L47,42 L93,44 L140,33 L187,28 L233,17 L280,9" fill="none" stroke="#f5a97f" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: C.soft, fontSize: 14, lineHeight: 21, marginTop: 8, fontFamily: SANS }}>{RD.trendCap}</Text>
      </View>
    </>
  );
}

function GentleNudge({ RD }) {
  return (
    <LinearGradient colors={['rgba(123,191,158,0.12)', 'rgba(106,74,166,0.12)']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
      style={{ marginTop: 22, borderWidth: 1, borderColor: 'rgba(123,191,158,0.24)', borderRadius: 20, padding: 20 }}>
      <Text style={{ fontSize: 12, letterSpacing: 0.96, textTransform: 'uppercase', color: C.green, fontFamily: SANS }}>A gentle idea</Text>
      <Text style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 27.5, color: C.ink, marginTop: 10 }}>{RD.nudgeText}</Text>
      <GButton label={RD.nudgeCta} onPress={() => {}} style={{ marginTop: 16 }} />
      <Pressable style={{ marginTop: 8, paddingVertical: 11, alignItems: 'center' }}>
        <Text style={{ color: C.mute, fontSize: 14, fontFamily: SANS }}>Maybe later</Text>
      </Pressable>
    </LinearGradient>
  );
}

export default function Insights({ v, M }) {
  const RD = v.RD;
  return (
    <Scroll>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: SERIF, fontSize: 27, color: C.ink }}>Insights</Text>
        <Text style={{ fontSize: 13, color: C.faint, fontFamily: SANS }}>No judgment, just patterns</Text>
      </View>
      <Segmented segList={v.segList} />
      <Hero RD={RD} />
      <ReachPattern RD={RD} maxWin={v.maxWin} />
      <Text style={{ fontWeight: '600', fontSize: 15, color: C.ink, marginTop: 24, fontFamily: SANS }}>What you reach for</Text>
      <Text style={{ fontSize: 13, color: C.mute, lineHeight: 19.5, marginTop: 4, fontFamily: SANS }}>Tap any app to see its pattern.</Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        {RD.apps.map((a, i) => <AppRow key={i} a={a} i={i} expandedApp={v.expandedApp} M={M} />)}
      </View>
      <HowYouFelt />
      <SmallWin RD={RD} />
      <GentleNudge RD={RD} />
    </Scroll>
  );
}
