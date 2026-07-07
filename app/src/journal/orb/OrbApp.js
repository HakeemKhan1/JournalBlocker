/**
 * Journal Blocker — app root. A single surface that switches between screens
 * off the controller's `screen` state.
 *
 * Native renders full-screen. On a wide web viewport it renders inside a
 * simulated device frame with a side "screens" nav — a browser preview aid for
 * devs without a Mac (see PhoneFrame / isBezel).
 */
import React from 'react';
import { View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useController } from './controller';
import { PhoneFrame, SideNav, TabBar, isBezel } from './PhoneFrame';

import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Voice from './screens/Voice';
import Shield from './screens/Shield';
import Feelings from './screens/Feelings';
import Reflections from './screens/Reflections';
import Journal from './screens/Journal';
import Entry from './screens/Entry';
import Insights from './screens/Insights';
import Settings from './screens/Settings';
import AppSelect from './screens/AppSelect';
import Compose from './screens/Compose';

const SCREENS = {
  onboarding: Onboarding, home: Home, voice: Voice, shield: Shield, feelings: Feelings,
  history: Reflections, journal: Journal, entry: Entry, insights: Insights,
  settings: Settings, appselect: AppSelect, compose: Compose,
};

export default function OrbApp() {
  const { state, vals, M } = useController({ startScreen: 'onboarding' });
  const Screen = SCREENS[vals.screen] || Home;
  const tabBar = vals.showTabBar ? <TabBar active={vals.activeTab} onTab={M.go} /> : null;
  const screen = <Screen v={vals} M={M} s={state} />;

  // Web wide viewport: device-frame preview + side nav.
  if (isBezel) {
    return (
      <SafeAreaProvider>
        <ExpoStatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: '#0a0913', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 38, padding: 40 }}>
          {vals.showSideNav ? <SideNav items={vals.navItems} /> : null}
          <PhoneFrame tabBar={tabBar}>{screen}</PhoneFrame>
        </View>
      </SafeAreaProvider>
    );
  }

  // Real app: full screen.
  return (
    <SafeAreaProvider>
      <ExpoStatusBar style="light" />
      <PhoneFrame tabBar={tabBar}>{screen}</PhoneFrame>
    </SafeAreaProvider>
  );
}
