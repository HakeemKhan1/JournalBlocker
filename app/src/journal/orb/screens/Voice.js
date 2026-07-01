import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, G, SANS, SERIF } from '../theme';
import { Wave, Mic, Check, AppTile, GButton } from '../ui';
import { fill, upper, CloseBtn } from './kit';

/* breathing loop for the record button */
function useBreathe(enabled = true) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(v, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [enabled]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] });
}

/* pulsing dot (listening indicator) */
function PulseDot({ color = C.accDeep, size = 9 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(v, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  return <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />;
}

/* blinking caret */
function Caret() {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 0, duration: 0, delay: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(v, { toValue: 1, duration: 0, delay: 500, useNativeDriver: Platform.OS !== 'web' }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={{ width: 2, height: 18, backgroundColor: C.acc, marginLeft: 2, opacity: v }} />;
}

function RecordButton({ onPress }) {
  const scale = useBreathe(true);
  return (
    <Pressable onPress={onPress}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={G.button} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', shadowColor: C.accDeep, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 18 } }}>
          <Mic color={C.onAcc} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function Voice({ v, M, s }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28 }}>
      {/* top row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <CloseBtn onPress={() => M.go('home')} />
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {v.vSegs.map((on, i) => (
            <View key={i} style={{ flex: 1, height: 5, borderRadius: 99, backgroundColor: on ? C.acc : C.faint }} />
          ))}
        </View>
        <Text style={{ fontSize: 13, color: C.mute, fontFamily: SANS }}>{v.vLabel}</Text>
      </View>

      {/* question */}
      <View style={{ marginTop: 30 }}>
        <Text style={[upper, { fontSize: 13, letterSpacing: 1, color: C.mute }]}>Question {v.vNum}</Text>
        <Text style={{ fontFamily: SERIF, fontSize: 27, lineHeight: 35, color: C.ink, marginTop: 8 }}>{v.question}</Text>
      </View>

      {/* middle */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        {v.vPhase === 'ready' ? (
          <View style={{ alignItems: 'center', gap: 22 }}>
            <RecordButton onPress={M.record} />
            <Text style={{ color: C.dim, fontSize: 15, fontFamily: SANS }}>Tap to answer out loud</Text>
          </View>
        ) : null}

        {v.vPhase === 'recording' ? (
          <View style={{ alignItems: 'center', gap: 24, width: '100%' }}>
            <Wave bars={v.waveBars} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <PulseDot />
              <Text style={{ color: C.acc, fontSize: 14, fontWeight: '600', fontFamily: SANS }}>Listening…</Text>
            </View>
            <View style={{ minHeight: 60, maxWidth: 300, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, lineHeight: 28, color: '#ddd6f5', textAlign: 'center' }}>{v.transcript}</Text>
              <Caret />
            </View>
          </View>
        ) : null}

        {v.vPhase === 'answered' ? (
          <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 22, padding: 22 }}>
            <Text style={[upper, { fontSize: 12, letterSpacing: 0.84, color: C.mute, marginBottom: 10 }]}>Your answer</Text>
            <Text style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, lineHeight: 30, color: C.ink }}>{v.transcript}</Text>
          </View>
        ) : null}
      </View>

      {/* bottom */}
      {v.vPhase === 'recording' ? (
        <Pressable onPress={M.stopRecord} style={{ width: '100%', paddingVertical: 16, borderRadius: 18, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: C.accDeep }} />
          <Text style={{ color: C.ink, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>Stop</Text>
        </Pressable>
      ) : null}

      {v.vPhase === 'answered' ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={M.retake} style={{ paddingVertical: 16, paddingHorizontal: 22, borderRadius: 18, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.ink, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>Re-record</Text>
          </Pressable>
          <GButton label={v.primaryLabel} onPress={v.primaryAction} style={{ flex: 1 }} />
        </View>
      ) : null}

      {/* success overlay */}
      {v.sessionSuccess ? (
        <View style={{ ...fill, zIndex: 30, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: 'rgba(12,11,21,0.98)' }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: C.accDeep, shadowOpacity: 0.5, shadowRadius: 30 }}>
            <LinearGradient colors={G.button} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ ...fill, alignItems: 'center', justifyContent: 'center' }}>
              <Check color={C.onAcc} w={22} h={42} weight={5} />
            </LinearGradient>
          </View>
          <Text style={{ fontFamily: SERIF, fontSize: 28, color: C.ink, marginTop: 22 }}>Entry saved</Text>
          <Text style={{ color: C.dim, fontSize: 15, marginTop: 6, fontFamily: SANS }}>Tucked away, just for you.</Text>

          {v.appsUnlocked ? (
            <>
              <View style={{ marginTop: 26, width: '100%', maxWidth: 300, backgroundColor: C.s05, borderWidth: 1, borderColor: 'rgba(123,191,158,0.25)', borderRadius: 20, padding: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
                  <Text style={[upper, { fontSize: 12, letterSpacing: 0.96, color: C.green }]}>{v.appsBlocked} apps unlocked</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                  {v.unlockedApps.map((a) => <AppTile key={a} label={a} size={46} radius={13} font={14} />)}
                </View>
                <Text style={{ marginTop: 14, color: C.dim, fontSize: 14, textAlign: 'center', fontFamily: SANS }}>Your day is open. Spend it well.</Text>
              </View>
              <GButton label="Back to today" onPress={M.completeAndHome} style={{ marginTop: 20, width: '100%', maxWidth: 300 }} />
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
