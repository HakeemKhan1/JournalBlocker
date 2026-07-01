/**
 * Journal Blocker — app entry. Renders the journaling + app-blocking UI.
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
