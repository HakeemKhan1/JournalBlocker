/**
 * PaywallView.tsx
 * Wrapper around RevenueCatUI's dashboard-configured paywall.
 *
 * This component embeds the RevenueCat paywall inline (full-screen).
 * The paywall design, products, and copy are all configured from the
 * RevenueCat dashboard — no hardcoded UI here.
 *
 * For most cases, use `presentPaywallIfNeeded()` or `presentPaywall()`
 * from PurchaseService.ts instead. This component exists for cases where
 * you need the paywall embedded in a React Navigation stack.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import { ENTITLEMENT_ID } from '../services/PurchaseService';

interface PaywallViewProps {
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export default function PaywallView({ onClose, onPurchaseSuccess }: PaywallViewProps) {
  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        style={styles.paywall}
        options={{ displayCloseButton: true }}
        onPurchaseCompleted={({ customerInfo }) => {
          if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            onPurchaseSuccess();
          }
        }}
        onRestoreCompleted={({ customerInfo }) => {
          if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
            onPurchaseSuccess();
          }
        }}
        onDismiss={onClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  paywall: {
    flex: 1,
  },
});
