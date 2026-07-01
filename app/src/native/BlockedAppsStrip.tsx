import React from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';

type Props = {
  style?: ViewStyle;
};

const NativeBlockedAppsView = requireNativeComponent<Props>('BlockedAppsView');

/**
 * Horizontal strip of selected app icons, rendered natively via Screen Time tokens.
 */
export function BlockedAppsStrip(props: Props) {
  return <NativeBlockedAppsView {...props} />;
}

export default BlockedAppsStrip;

