import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Stack from './nav/Stack';
import {
  OnboardingScreen, HomeScreen, InsightsScreen, BlockedAppsScreen,
  JournalDetailScreen, EntryDetailScreen, ComposeScreen, AddJournalSheet,
  SettingsSheet, ShieldScreen,
} from './screens';
import { colors } from './theme';

const SCREENS = {
  Home: HomeScreen,
  Insights: InsightsScreen,
  BlockedApps: BlockedAppsScreen,
  JournalDetail: JournalDetailScreen,
  EntryDetail: EntryDetailScreen,
};

/**
 * App shell: onboarding gate → push-navigation stack (Home + details) with
 * Compose / Add-Journal / Settings / Shield presented as modal sheets.
 */
export default function PrototypeApp() {
  const [stage, setStage] = useState('onboarding');
  const [compose, setCompose] = useState(null);     // null | { journalId, fromShield }
  const [addJournal, setAddJournal] = useState(false);
  const [settings, setSettings] = useState(false);
  const [shield, setShield] = useState(false);
  const [journaledToday, setJournaledToday] = useState(false);

  const sharedProps = {
    journaledToday,
    onSettings: () => setSettings(true),
    onCompose: (journalId = 'personal') => setCompose({ journalId, fromShield: false }),
    onAddJournal: () => setAddJournal(true),
  };

  const saveEntry = () => { setJournaledToday(true); setCompose(null); setShield(false); };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.root}>
        {stage === 'onboarding' ? (
          <OnboardingScreen onFinish={() => setStage('app')} />
        ) : (
          <Stack screens={SCREENS} initial="Home" sharedProps={sharedProps} />
        )}

        {/* Compose */}
        <Modal visible={!!compose} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCompose(null)}>
          {compose && <ComposeScreen journalId={compose.journalId} fromShield={compose.fromShield} onSave={saveEntry} onCancel={() => setCompose(null)} />}
        </Modal>

        {/* Add journal */}
        <Modal visible={addJournal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddJournal(false)}>
          <AddJournalSheet onCancel={() => setAddJournal(false)} onCreate={() => setAddJournal(false)} />
        </Modal>

        {/* Settings */}
        <Modal visible={settings} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSettings(false)}>
          <SettingsSheet
            onClose={() => setSettings(false)}
            onReplayOnboarding={() => { setSettings(false); setStage('onboarding'); }}
            onPreviewShield={() => { setSettings(false); setShield(true); }}
          />
        </Modal>

        {/* Shield (full screen) */}
        <Modal visible={shield} animationType="fade" onRequestClose={() => setShield(false)}>
          <ShieldScreen
            onJournal={() => setCompose({ journalId: 'personal', fromShield: true })}
            onClose={() => setShield(false)}
          />
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });
