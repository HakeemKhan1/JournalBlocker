/**
 * Journal Blocker — interactive prototype, ported from the Claude Design
 * composition "Journal Blocker.dc.html". A single phone surface that switches
 * between twelve screens off the controller's `screen` state.
 */
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useController } from './controller';
import { PhoneFrame, SideNav, TabBar, isBezel } from './PhoneFrame';
import { C } from './theme';

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

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0a0913', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 38, padding: isBezel ? 40 : 0 }}>
        {vals.showSideNav ? <SideNav items={vals.navItems} /> : null}
        <PhoneFrame tabBar={vals.showTabBar ? <TabBar active={vals.activeTab} onTab={M.go} /> : null}>
          <Screen v={vals} M={M} s={state} />
        </PhoneFrame>
      </View>
    </SafeAreaProvider>
  );
}
