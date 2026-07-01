/**
 * The device chrome: a centered 390×844 phone (with status bar, notch and home
 * indicator) on the dark canvas, an optional left "screens" nav on wide
 * viewports, and the bottom tab bar. On a real phone-sized viewport the bezel
 * is dropped and the screen fills the window.
 */
import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SANS, SERIF, G } from './theme';

const BEZEL = Dimensions.get('window').width >= 440;

export function StatusBar() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink, fontFamily: SANS }}>9:41</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 11, gap: 2 }}>
          {[5, 7, 9, 11].map((h, i) => <View key={i} style={{ width: 3, height: h, backgroundColor: C.ink, borderRadius: 1 }} />)}
        </View>
        <View style={{ width: 23, height: 12, borderWidth: 1.4, borderColor: 'rgba(239,234,254,0.55)', borderRadius: 3, padding: 1.5, justifyContent: 'center' }}>
          <View style={{ width: 13, height: '100%', backgroundColor: C.ink, borderRadius: 1 }} />
        </View>
      </View>
    </View>
  );
}

const TAB_ICON = {
  home: (col) => <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.6, borderColor: col }} />,
  history: (col) => <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.6, borderColor: col }} />,
  insights: (col) => (
    <View style={{ width: 16, height: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 2.5 }}>
      {[8, 12, 16].map((h, i) => <View key={i} style={{ width: 3, height: h, borderRadius: 1.5, backgroundColor: col }} />)}
    </View>
  ),
  settings: (col) => (
    <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.6, borderColor: col, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: col }} />
    </View>
  ),
};

export function TabBar({ active, onTab }) {
  const items = [['home', 'Today'], ['history', 'Reflections'], ['insights', 'Insights'], ['settings', 'Settings']];
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(15,13,30,0.85)', paddingTop: 9, paddingBottom: 20 }}>
      {items.map(([key, label]) => {
        const col = active === key ? C.acc : C.dim;
        return (
          <Pressable key={key} onPress={() => onTab(key)} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
            {TAB_ICON[key](col)}
            <Text style={{ color: col, fontSize: 11, fontWeight: '600', fontFamily: SANS }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SideNav({ items }) {
  if (!BEZEL) return null;
  return (
    <View style={{ width: 190, alignSelf: 'center', gap: 3 }}>
      <Text style={{ fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: C.faint, paddingHorizontal: 12, paddingBottom: 12, lineHeight: 16, fontFamily: SANS }}>Journal Blocker{'\n'}screens</Text>
      {items.map((it) => (
        <Pressable key={it.key} onPress={it.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.acc, opacity: it.active ? 1 : 0 }} />
          <Text style={{ color: it.active ? C.ink : C.dim, fontSize: 14, fontFamily: SANS }}>{it.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** The phone device: gradient inner background, status bar, screen, tab bar, home indicator. */
export function PhoneFrame({ children, tabBar }) {
  const inner = (
    <LinearGradient colors={G.phoneBg} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      style={{ flex: 1, borderRadius: BEZEL ? 46 : 0, overflow: 'hidden' }}>
      <StatusBar />
      {BEZEL ? <View style={{ position: 'absolute', top: 11, left: '50%', marginLeft: -58, width: 116, height: 33, backgroundColor: '#000', borderRadius: 20, zIndex: 51 }} /> : null}
      <View style={{ flex: 1, paddingTop: 54 }}>
        <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
        {tabBar}
      </View>
      {BEZEL ? <View style={{ position: 'absolute', bottom: 8, left: '50%', marginLeft: -66, width: 132, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 55 }} /> : null}
    </LinearGradient>
  );

  if (!BEZEL) return <View style={{ flex: 1 }}>{inner}</View>;
  return (
    <View style={{ width: 390, height: 844, borderRadius: 56, backgroundColor: '#050409', padding: 11, shadowColor: '#000', shadowOpacity: 0.85, shadowRadius: 60, shadowOffset: { width: 0, height: 40 } }}>
      {inner}
    </View>
  );
}

export const isBezel = BEZEL;
