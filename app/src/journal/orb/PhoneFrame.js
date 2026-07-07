/**
 * App shell.
 *
 * On a REAL device we render full-screen using the OS safe-area insets — no
 * fake status bar, notch, or side nav. The simulated "device frame" + left
 * screens nav are a DESKTOP-BROWSER preview aid only (so a dev without a Mac
 * can click between screens in a browser); they never render on native.
 */
import React from 'react';
import { View, Text, Pressable, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { C, SANS, G } from './theme';

// Web + wide viewport → show the centered device-frame preview. Never on native.
const BEZEL = Platform.OS === 'web' && Dimensions.get('window').width >= 440;

/** Simulated status bar — used only in the web device-frame preview. */
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
  const insets = useSafeAreaInsets();
  const items = [['home', 'Today'], ['history', 'Reflections'], ['insights', 'Insights'], ['settings', 'Settings']];
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(15,13,30,0.85)', paddingTop: 9, paddingBottom: Math.max(insets.bottom, 12) }}>
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

/**
 * The app surface. Native → full-screen with real safe-area insets. Web wide →
 * a simulated device frame for previewing.
 */
export function PhoneFrame({ children, tabBar }) {
  const insets = useSafeAreaInsets();

  if (!BEZEL) {
    // Real device (or narrow web): fill the screen, respect the notch/home bar.
    return (
      <LinearGradient colors={G.phoneBg} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
          {tabBar}
        </View>
      </LinearGradient>
    );
  }

  // Web desktop preview: simulated device with chrome.
  const inner = (
    <LinearGradient colors={G.phoneBg} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      style={{ flex: 1, borderRadius: 46, overflow: 'hidden' }}>
      <StatusBar />
      <View style={{ position: 'absolute', top: 11, left: '50%', marginLeft: -58, width: 116, height: 33, backgroundColor: '#000', borderRadius: 20, zIndex: 51 }} />
      <View style={{ flex: 1, paddingTop: 54 }}>
        <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
        {tabBar}
      </View>
      <View style={{ position: 'absolute', bottom: 8, left: '50%', marginLeft: -66, width: 132, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', zIndex: 55 }} />
    </LinearGradient>
  );
  return (
    <View style={{ width: 390, height: 844, borderRadius: 56, backgroundColor: '#050409', padding: 11, shadowColor: '#000', shadowOpacity: 0.85, shadowRadius: 60, shadowOffset: { width: 0, height: 40 } }}>
      {inner}
    </View>
  );
}

export const isBezel = BEZEL;
