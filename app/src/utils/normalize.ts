/**
 * normalize.ts
 * Responsive scaling utility for DeenShield.
 *
 * Scales font sizes and spacing relative to a baseline 375pt-wide device
 * (iPhone 8 / SE). Prevents text from being too small on SE or too large
 * on iPad Pro 13".
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline: iPhone 8 / SE (375 x 667)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

/**
 * Scale a value based on screen width.
 * Good for horizontal spacing and font sizes.
 */
export function normalize(size: number): number {
  const scale = SCREEN_WIDTH / BASE_WIDTH;

  // Clamp scale for iPads so text doesn't become enormous
  const clampedScale = Math.min(scale, 1.35);

  const newSize = size * clampedScale;

  // Round to nearest pixel for crisp rendering
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Scale a value based on screen height.
 * Useful for vertical spacing that should adapt to taller devices.
 */
export function normalizeVertical(size: number): number {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const clampedScale = Math.min(scale, 1.35);
  const newSize = size * clampedScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Returns true if the device has an iPad-class screen (width >= 768pt).
 */
export function isTablet(): boolean {
  return SCREEN_WIDTH >= 768;
}

/**
 * Returns true for "Pro Max"-class phones (width >= 428pt).
 */
export function isLargePhone(): boolean {
  return SCREEN_WIDTH >= 428 && !isTablet();
}
