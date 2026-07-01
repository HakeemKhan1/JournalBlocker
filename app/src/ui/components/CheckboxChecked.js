import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

/**
 * Checked checkbox component - white rounded square with black checkmark
 * Matches Figma design: 22x22 white square with 4px radius and black checkmark
 */
export default function CheckboxChecked({ size = 22 }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        {/* White rounded square */}
        <Rect x="1" y="1" width="20" height="20" rx="4" fill="white" stroke="white" strokeWidth="2" />
        {/* Black checkmark */}
        <Path
          d="M5.65459 11.0985L9.33495 15.6071L17.5543 6.88919"
          stroke="#292E2B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

