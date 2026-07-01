import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../tokens';

/**
 * StartSessionButton component - large gradient button to start prayer session
 * 
 * @param {Object} props
 * @param {Function} props.onPress - Callback when button is pressed
 * @param {boolean} [props.disabled] - Whether button is disabled
 */
export default function StartSessionButton({ onPress, disabled = false }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.button}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? [colors.textTertiary, colors.textTertiary] : ['#2E492F', '#274C32', '#246440']}
        style={styles.gradient}
      >
        <Text style={styles.buttonText}>Start Session</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: spacing.base,
    marginTop: 4,
    marginBottom: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.base + 4,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});

