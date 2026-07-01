import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

/**
 * Monochrome SF-Symbol-like icon (Ionicons under the hood). Keeps the app
 * emoji-free and consistent. Use semantic names from ICONS where possible.
 */
export default function Sym({ name, size = 22, color = colors.label, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

/** Curated icon set offered in the "add journal" picker. */
export const JOURNAL_ICONS = [
  'book', 'journal', 'bookmark', 'heart', 'star', 'moon', 'sunny', 'leaf',
  'flame', 'water', 'cafe', 'restaurant', 'barbell', 'fitness', 'bicycle',
  'walk', 'airplane', 'briefcase', 'school', 'bulb', 'rocket', 'musical-notes',
  'camera', 'color-palette', 'planet', 'paw', 'home', 'people', 'happy',
  'medkit', 'cash', 'game-controller',
];
