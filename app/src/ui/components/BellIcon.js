import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Bell icon component - black circle with green bell inside
 * Matches Figma design: 32x32 black circle with 18x18 green bell centered
 */
export default function BellIcon({ size = 32 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Black circle background */}
        <Circle cx="16" cy="16" r="16" fill="#1B1E1C" />
      </Svg>
      {/* Green bell icon - centered within the circle */}
      <View style={{ position: 'absolute', width: 18, height: 18 }}>
        <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <Path
            d="M15.75 14.25V15H2.25V14.25L3.75 12.75V8.25C3.75 5.925 5.2725 3.8775 7.5 3.2175V3C7.5 2.60218 7.65804 2.22064 7.93934 1.93934C8.22064 1.65804 8.60218 1.5 9 1.5C9.39782 1.5 9.77936 1.65804 10.0607 1.93934C10.342 2.22064 10.5 2.60218 10.5 3V3.2175C12.7275 3.8775 14.25 5.925 14.25 8.25V12.75L15.75 14.25ZM10.5 15.75C10.5 16.1478 10.342 16.5294 10.0607 16.8107C9.77936 17.092 9.39782 17.25 9 17.25C8.60218 17.25 8.22064 17.092 7.93934 16.8107C7.65804 16.5294 7.5 16.1478 7.5 15.75"
            fill="#0B721E"
          />
        </Svg>
      </View>
    </View>
  );
}

