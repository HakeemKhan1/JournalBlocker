import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, radius } from '../tokens';

/**
 * PrimaryButton component for main CTAs
 * Height 56px with xl radius
 * 
 * @param {Object} props
 * @param {string} props.title
 * @param {Function} props.onPress
 * @param {boolean} [props.disabled]
 * @param {Object} [props.style]
 */
export default function PrimaryButton({ title, onPress, disabled = false, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled, style]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.accent.dueLocked,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

