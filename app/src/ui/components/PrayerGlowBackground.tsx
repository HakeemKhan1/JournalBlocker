import React, { memo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Canvas, Fill, LinearGradient, RadialGradient, vec, Group, BlurMask } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

// Reduced blur value for better performance on older devices
// 80px blur was causing frame drops; 50px is still visually smooth
const BLUR_RADIUS = 50;

/**
 * PrayerGlowBackground
 *
 * Creates an eclipse-like glow effect with bright, luminous gradients.
 * Uses blur and high opacity values for a smooth, glowing appearance.
 * Four centered glows: top-middle, bottom-middle, middle-left, middle-right.
 * Memoized to prevent unnecessary re-renders.
 */
const PrayerGlowBackground = memo(function PrayerGlowBackground() {
  // Eclipse glow from middle-left - positioned at left edge, vertically centered
  const middleLeftCenter = vec(-width * 0.1, height * 0.5);
  const middleLeftRadius = width * 0.7;
  const middleLeftColors = [
    'rgba(101, 198, 103, 0.45)',
    'rgba(101, 198, 103, 0.30)',
    'rgba(101, 198, 103, 0.18)',
    'rgba(101, 198, 103, 0.10)',
    'rgba(101, 198, 103, 0.05)',
    'rgba(101, 198, 103, 0.00)',
  ];
  const middleLeftPositions = [0, 0.25, 0.45, 0.65, 0.85, 1];

  // Eclipse glow from middle-right - positioned at right edge, vertically centered
  const middleRightCenter = vec(width * 1.1, height * 0.5);
  const middleRightRadius = width * 0.7;
  const middleRightColors = [
    'rgba(101, 198, 103, 0.45)',
    'rgba(101, 198, 103, 0.30)',
    'rgba(101, 198, 103, 0.18)',
    'rgba(101, 198, 103, 0.10)',
    'rgba(101, 198, 103, 0.05)',
    'rgba(101, 198, 103, 0.00)',
  ];
  const middleRightPositions = [0, 0.25, 0.45, 0.65, 0.85, 1];

  // Eclipse glow from top-middle - positioned at top edge, horizontally centered
  const topMiddleCenter = vec(width * 0.5, -height * 0.1);
  const topMiddleRadius = width * 0.7;
  const topMiddleColors = [
    'rgba(101, 198, 103, 0.45)',
    'rgba(101, 198, 103, 0.30)',
    'rgba(101, 198, 103, 0.18)',
    'rgba(101, 198, 103, 0.10)',
    'rgba(101, 198, 103, 0.05)',
    'rgba(101, 198, 103, 0.00)',
  ];
  const topMiddlePositions = [0, 0.25, 0.45, 0.65, 0.85, 1];

  // Eclipse glow from bottom-middle - positioned at bottom edge, horizontally centered
  const bottomMiddleCenter = vec(width * 0.5, height * 1.1);
  const bottomMiddleRadius = width * 0.7;
  const bottomMiddleColors = [
    'rgba(101, 198, 103, 0.45)',
    'rgba(101, 198, 103, 0.30)',
    'rgba(101, 198, 103, 0.18)',
    'rgba(101, 198, 103, 0.10)',
    'rgba(101, 198, 103, 0.05)',
    'rgba(101, 198, 103, 0.00)',
  ];
  const bottomMiddlePositions = [0, 0.25, 0.45, 0.65, 0.85, 1];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Eclipse glow from middle-left - positioned at left edge, vertically centered */}
        <Group blendMode="plus">
          <BlurMask blur={BLUR_RADIUS} style="normal" />
          <Fill>
            <RadialGradient
              c={middleLeftCenter}
              r={middleLeftRadius}
              colors={middleLeftColors}
              positions={middleLeftPositions}
            />
          </Fill>
        </Group>

        {/* Eclipse glow from middle-right - positioned at right edge, vertically centered */}
        <Group blendMode="plus">
          <BlurMask blur={BLUR_RADIUS} style="normal" />
          <Fill>
            <RadialGradient
              c={middleRightCenter}
              r={middleRightRadius}
              colors={middleRightColors}
              positions={middleRightPositions}
            />
          </Fill>
        </Group>

        {/* Eclipse glow from top-middle - positioned at top edge, horizontally centered */}
        <Group blendMode="plus">
          <BlurMask blur={BLUR_RADIUS} style="normal" />
          <Fill>
            <RadialGradient
              c={topMiddleCenter}
              r={topMiddleRadius}
              colors={topMiddleColors}
              positions={topMiddlePositions}
            />
          </Fill>
        </Group>

        {/* Eclipse glow from bottom-middle - positioned at bottom edge, horizontally centered */}
        <Group blendMode="plus">
          <BlurMask blur={BLUR_RADIUS} style="normal" />
          <Fill>
            <RadialGradient
              c={bottomMiddleCenter}
              r={bottomMiddleRadius}
              colors={bottomMiddleColors}
              positions={bottomMiddlePositions}
            />
          </Fill>
        </Group>
      </Canvas>
    </View>
  );
});

export default PrayerGlowBackground;
