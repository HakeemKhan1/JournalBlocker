import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, type, radius, spacing } from '../theme';

/**
 * iOS button. kind: 'filled' (tinted, prominent) | 'tinted' (soft) | 'plain'.
 */
export default function Button({ title, onPress, kind = 'filled', color = colors.tint, disabled, style }) {
  const isFilled = kind === 'filled';
  const isTinted = kind === 'tinted';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.base,
        isFilled && { backgroundColor: color },
        isTinted && { backgroundColor: color + '1F' },
        disabled && styles.disabled,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={[styles.text, isFilled ? styles.onFilled : { color }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 50, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  disabled: { opacity: 0.4 },
  text: { ...type.headline },
  onFilled: { color: '#FFFFFF' },
});
