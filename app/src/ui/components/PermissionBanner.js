import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../tokens';
import Card from './Card';

/**
 * PermissionBanner component for permission prompts
 * Inline card with icon, message, and CTA button
 * 
 * @param {Object} props
 * @param {string} props.message - Main message text
 * @param {string} props.ctaText - Button text
 * @param {Function} props.onPress - CTA button action
 * @param {React.ReactNode} [props.icon] - Optional icon component
 */
export default function PermissionBanner({ message, ctaText, onPress, icon }) {
  return (
    <Card style={styles.banner}>
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity
          onPress={onPress}
          style={styles.button}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{ctaText}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  message: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
    fontWeight: typography.bodyM.fontWeight,
  },
  button: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.accent.interactive,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
});

