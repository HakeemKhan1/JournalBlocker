/**
 * Journal Blocker — prototype entry.
 *
 * This fork started from the DeenShield prayer-blocking app; the original
 * prayer App is preserved as App.prayer.reference.js for the blocking-engine
 * wiring we'll reuse (FamilyControls / DeviceActivity / ManagedSettings).
 *
 * For now this renders the design prototype of the journaling flow.
 */
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OrbApp from './src/journal/orb/OrbApp';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OrbApp />
    </GestureHandlerRootView>
  );
}
