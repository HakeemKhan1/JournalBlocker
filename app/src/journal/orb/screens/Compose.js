import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, Animated, Easing } from 'react-native';
import { C, SANS, SERIF } from '../theme';
import { Mic, Check, GButton } from '../ui';
import { fill, upper, CloseBtn } from './kit';

function PulseDot() {
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(v, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: C.accDeep, opacity: v }} />;
}

export default function Compose({ v, M }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <CloseBtn onPress={M.closeCompose} />
        <Text style={{ fontSize: 13, color: C.mute, fontFamily: SANS }}>{v.composeWordCount} words</Text>
        <Pressable onPress={M.saveCompose} style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
          <Text style={{ color: v.composeCanSave ? C.acc : C.off, fontSize: 16, fontWeight: '600', fontFamily: SANS }}>Save</Text>
        </Pressable>
      </View>

      <Text style={[upper, { marginTop: 18 }]}>Tuesday · evening</Text>

      <TextInput
        value={v.composeTitle}
        onChangeText={M.composeTitleInput}
        placeholder="Title"
        placeholderTextColor={C.faint}
        style={{ marginTop: 8, width: '100%', fontFamily: SERIF, fontSize: 27, color: C.ink, padding: 0 }}
      />

      <View style={{ height: 1, backgroundColor: C.s08, marginTop: 10 }} />

      <TextInput
        value={v.composeBody}
        onChangeText={M.composeBodyInput}
        placeholder="Start writing, or tap the mic to speak…"
        placeholderTextColor={C.faint}
        multiline
        textAlignVertical="top"
        style={{ flex: 1, marginTop: 14, width: '100%', fontFamily: SERIF, fontSize: 18, lineHeight: 29, color: C.ink2, padding: 0 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
        <Pressable onPress={M.toggleDictate} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: C.accBorderHi, backgroundColor: v.composeDictating ? C.accSurfHi : C.s06, alignItems: 'center', justifyContent: 'center' }}>
          <Mic color={C.acc} scale={0.73} />
        </Pressable>
        {v.composeDictating ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PulseDot />
            <Text style={{ color: C.acc, fontSize: 14, fontWeight: '600', fontFamily: SANS }}>Listening…</Text>
          </View>
        ) : (
          <Text style={{ color: C.mute, fontSize: 14, lineHeight: 19.6, fontFamily: SANS }}>Tap to dictate. No questions, just you</Text>
        )}
      </View>

      {/* saved overlay */}
      {v.composeSaved ? (
        <View style={{ ...fill, zIndex: 30, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: 'rgba(12,11,21,0.97)' }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: C.accDeep, alignItems: 'center', justifyContent: 'center' }}>
            <Check />
          </View>
          <Text style={{ fontFamily: SERIF, fontSize: 28, color: C.ink, marginTop: 22 }}>Entry saved</Text>
          <Text style={{ color: C.dim, fontSize: 15, marginTop: 6, fontFamily: SANS }}>Tucked away, just for you.</Text>

          {v.appsUnlocked ? (
            <>
              <View style={{ marginTop: 26, width: '100%', maxWidth: 300, backgroundColor: C.s05, borderWidth: 1, borderColor: 'rgba(123,191,158,0.25)', borderRadius: 20, padding: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
                  <Text style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: C.green, fontFamily: SANS }}>{v.appsBlocked} apps unlocked</Text>
                </View>
                <Text style={{ marginTop: 12, color: C.dim, fontSize: 14, textAlign: 'center', fontFamily: SANS }}>Your day is open. Spend it well.</Text>
              </View>
              <GButton label="Back to today" onPress={M.completeAndHome} style={{ marginTop: 20, width: '100%', maxWidth: 300 }} />
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
