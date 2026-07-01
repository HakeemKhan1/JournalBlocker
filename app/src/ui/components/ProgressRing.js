import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../tokens';

/**
 * ProgressRing component showing circular progress with "X/3 Prayed" text
 * 
 * @param {Object} props
 * @param {number} props.completed - Number of completed prayers (0-3)
 * @param {number} props.total - Total number of prayers to track (default: 3)
 * @param {number} [props.size] - Ring diameter
 * @param {number} [props.strokeWidth] - Ring thickness
 */
export default function ProgressRing({ 
  completed = 0, 
  total = 3, 
  size = 100, 
  strokeWidth = 15 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / total, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  // Calculate checkmark position (bottom of ring, where progress starts)
  // Progress starts from bottom (6 o'clock) after -90 degree rotation
  const ringRadius = radius + strokeWidth / 2;
  const checkmarkSize = 18;
  // Bottom position: x = center, y = center + radius
  const checkmarkX = size / 2 - checkmarkSize / 2;
  const checkmarkY = size / 2 + ringRadius - checkmarkSize / 2 - 2; // Slightly outside ring
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background ring - dark grey/black */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1A1A1A"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring - green, starts from bottom */}
        {progress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0B721E"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={styles.textOverlay}>
        <Text style={styles.countText}>{completed}/{total}</Text>
        <Text style={styles.labelText}>Prayed</Text>
      </View>
      {/* Checkmark icon at bottom of ring when complete */}
      {completed >= total && (
        <View style={[
          styles.checkmarkContainer,
          {
            left: checkmarkX,
            top: checkmarkY,
          }
        ]}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  textOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  countText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textPrimary,
    opacity: 0.8,
    marginTop: 2,
    lineHeight: 14,
  },
  checkmarkContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  checkmarkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0B721E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B721E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});

