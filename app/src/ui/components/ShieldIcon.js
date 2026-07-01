import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * Shield icon component - represents Smart Blocking feature
 * Matches app design theme with green accent color
 * 
 * @param {Object} props
 * @param {number} [props.size=32] - Size of the icon
 * @param {string} [props.color='#2FA05E'] - Color of the icon
 */
export default function ShieldIcon({ size = 32, color = '#2FA05E' }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Shield shape with checkmark */}
        <Path
          d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 12L11 14L15 10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

