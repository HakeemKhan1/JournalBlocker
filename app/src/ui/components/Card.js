import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../tokens';

/**
 * Card component with surface styling and optional divider
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.hasDivider] - Show divider at bottom
 * @param {Object} [props.style] - Additional styles
 */
export default function Card({ children, hasDivider = false, style }) {
  return (
    <View style={[styles.card, hasDivider && styles.divider, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});

