import React from 'react';
import { View, StyleSheet } from 'react-native';
import Sym from './Sym';
import { radius } from '../theme';

/** Settings-style rounded square icon tile (white glyph on a colored fill). */
export default function IconTile({ icon, color = '#8E8E93', size = 29, glyph = 17 }) {
  return (
    <View style={[styles.tile, { backgroundColor: color, width: size, height: size, borderRadius: radius.tile }]}>
      <Sym name={icon} size={glyph} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});
