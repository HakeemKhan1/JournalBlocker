/**
 * Shared visual primitives for the orb design: the breathing gradient Orb and
 * its glow halo (react-native-svg so gradients work on web + native), the
 * peach gradient CTA button, a pill toggle, animated voice wave + particles,
 * and the small geometric glyphs the design draws with CSS borders.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Pressable, Platform } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { C, G, SANS } from './theme';

/* ---- breathing loop helper -------------------------------------------- */
function useLoop(toRange, duration, enabled = true) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enabled, duration]);
  return v.interpolate({ inputRange: [0, 1], outputRange: toRange });
}

/* ---- Orb -------------------------------------------------------------- */
export function Orb({ size = 184, breathe = true, style }) {
  const scale = useLoop([1, 1.055], 6000, breathe);
  return (
    <Animated.View style={[{ width: size, height: size, transform: [{ scale }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="orb" cx="0.5" cy="0.5" r="0.72" fx="0.36" fy="0.30">
            <Stop offset="0" stopColor="#ffe6cc" />
            <Stop offset="0.33" stopColor="#f5a97f" />
            <Stop offset="0.61" stopColor="#d07f9b" />
            <Stop offset="1" stopColor="#6a4aa6" />
          </RadialGradient>
          <RadialGradient id="orbHi" cx="0.4" cy="0.28" r="0.5">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill="url(#orb)" />
        <Circle cx="50" cy="50" r="50" fill="url(#orbHi)" />
      </Svg>
    </Animated.View>
  );
}

/* ---- Glow halo -------------------------------------------------------- */
export function Glow({ size = 240, opacity = 0.85, style }) {
  const scale = useLoop([1, 1.14], 6000, true);
  const op = useLoop([opacity * 0.7, opacity], 6000, true);
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, opacity: op, transform: [{ scale }] }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#f5a97f" stopOpacity="0.55" />
            <Stop offset="0.64" stopColor="#f5a97f" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill="url(#glow)" />
      </Svg>
    </Animated.View>
  );
}

/* ---- primary CTA ------------------------------------------------------ */
export function GButton({ label, onPress, disabled, style, textStyle, children }) {
  if (disabled) {
    return (
      <View style={[{ flex: 1, paddingVertical: 17, borderRadius: 18, borderWidth: 1, borderColor: C.s08, backgroundColor: C.s05, alignItems: 'center' }, style]}>
        <Text style={{ color: C.faint, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>{label}</Text>
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} style={style}>
      <LinearGradient colors={G.button} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingVertical: 17, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: C.accDeep, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } }}>
        {children || <Text style={[{ color: C.onAcc, fontSize: 16, fontWeight: '600', fontFamily: SANS }, textStyle]}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

/* ---- pill toggle ------------------------------------------------------ */
export function Toggle({ on, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ width: 46, height: 28, borderRadius: 99, padding: 3, backgroundColor: on ? C.acc : 'rgba(255,255,255,0.14)', alignItems: on ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }} />
    </Pressable>
  );
}

/* ---- app tile (Ig / Tk / Yt) ----------------------------------------- */
export function AppTile({ label, size = 30, radius = 9, color = C.warm, dim, font = 11 }) {
  return (
    <LinearGradient colors={dim ? ['#2c2550', '#1c1838'] : G.appTile} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
      style={{ width: size, height: size, borderRadius: radius, borderWidth: 1, borderColor: C.s08, alignItems: 'center', justifyContent: 'center', opacity: dim ? 0.7 : 1 }}>
      <Text style={{ fontSize: font, fontWeight: '700', color: dim ? C.mute : color, fontFamily: SANS }}>{label}</Text>
    </LinearGradient>
  );
}

/* ---- voice wave ------------------------------------------------------- */
function WaveBar({ delay }) {
  const v = useRef(new Animated.Value(0.28)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 350, delay: delay * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(v, { toValue: 0.28, duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{ width: 4, height: 50, marginHorizontal: 1.5, borderRadius: 4, transform: [{ scaleY: v }] }}>
      <LinearGradient colors={['#f7b48f', '#d07f9b']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1, borderRadius: 4 }} />
    </Animated.View>
  );
}
export function Wave({ bars }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 74 }}>
      {bars.map((b, i) => <WaveBar key={i} delay={Number(b.delay)} />)}
    </View>
  );
}

/* ---- floating particles ---------------------------------------------- */
function Particle({ p }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: Number(p.dur) * 1000, delay: Number(p.delay) * 1000, easing: Easing.in(Easing.ease), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [20, -150] });
  const opacity = v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: `${p.left}%`, width: Number(p.size), height: Number(p.size), borderRadius: Number(p.size) / 2, backgroundColor: 'rgba(245,169,127,0.7)', opacity, transform: [{ translateY }] }} />
  );
}
export function Particles({ list }) {
  return <>{list.map((p, i) => <Particle key={i} p={p} />)}</>;
}

/* ---- geometric glyphs (drawn with borders, like the design) ---------- */
export function Chevron({ dir = 'right', color = C.faint, size = 9, weight = 2 }) {
  const rot = { right: '-45deg', left: '135deg', down: '45deg', up: '225deg' }[dir];
  // an open corner: left+bottom borders rotated
  return <View style={{ width: size, height: size, borderLeftWidth: weight, borderBottomWidth: weight, borderColor: color, transform: [{ rotate: rot }] }} />;
}

export function Lock({ color = C.acc, scale = 1 }) {
  const w = 14 * scale, h = 11 * scale, sh = 8 * scale, sw = 8 * scale, bw = 2 * scale;
  return (
    <View style={{ width: w, height: h + sh, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', top: 0, width: sw, height: sh, borderWidth: bw, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: sw, borderTopRightRadius: sw }} />
      <View style={{ width: w, height: h, borderWidth: bw, borderColor: color, borderRadius: 3 * scale }} />
    </View>
  );
}

export function Mic({ color = C.acc, scale = 1 }) {
  return (
    <View style={{ width: 22 * scale, height: 33 * scale }}>
      <View style={{ position: 'absolute', top: 0, left: 3 * scale, width: 16 * scale, height: 22 * scale, borderRadius: 9 * scale, backgroundColor: color }} />
      <View style={{ position: 'absolute', bottom: 6 * scale, left: 0, width: 22 * scale, height: 11 * scale, borderWidth: 2.4 * scale, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 12 * scale, borderBottomRightRadius: 12 * scale }} />
      <View style={{ position: 'absolute', bottom: 0, left: 10 * scale, width: 2.4 * scale, height: 8 * scale, backgroundColor: color }} />
    </View>
  );
}

export function Check({ color = C.onAcc, w = 22, h = 42, weight = 5 }) {
  return <View style={{ width: w, height: h, borderRightWidth: weight, borderBottomWidth: weight, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -h * 0.14 }} />;
}

export function CheckSmall({ color = C.green, size = 14, weight = 2.4 }) {
  return <View style={{ width: size, height: size * 0.58, borderLeftWidth: weight, borderBottomWidth: weight, borderColor: color, transform: [{ rotate: '-45deg' }] }} />;
}
