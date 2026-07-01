import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { C, SANS } from '../theme';
import { Chevron } from '../ui';

export const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

export const upper = { fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', color: C.mute, fontFamily: SANS };

export function Scroll({ children, style, contentStyle }) {
  return (
    <ScrollView style={[{ flex: 1 }, style]} contentContainerStyle={[{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 }, contentStyle]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function Section({ children, style }) {
  return <Text style={[{ ...upper, marginTop: 22, marginBottom: 10 }, style]}>{children}</Text>;
}

export function Card({ children, style }) {
  return <View style={[{ backgroundColor: C.s04, borderWidth: 1, borderColor: C.s08, borderRadius: 18 }, style]}>{children}</View>;
}

export function BackLink({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <Chevron dir="left" color={C.acc} size={9} />
      <Text style={{ color: C.acc, fontSize: 16, fontFamily: SANS }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function CloseBtn({ onPress, glyph = '×' }) {
  return (
    <Pressable onPress={onPress} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.s06, borderWidth: 1, borderColor: C.b10, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.soft, fontSize: 18, lineHeight: 20, fontFamily: SANS }}>{glyph}</Text>
    </Pressable>
  );
}
