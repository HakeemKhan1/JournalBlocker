import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Bridge from '../native/LockedIslamBridge';
import BlockedAppsStrip from '../native/BlockedAppsStrip';
import { captureException } from '../utils/errorReporting';

export default function AppPickerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedAppCount, setSelectedAppCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSelectedApps();
    // Reload when screen comes into focus (after returning from picker)
    const unsubscribe = navigation.addListener('focus', () => {
      loadSelectedApps();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSelectedApps = async () => {
    try {
      const shared = await Bridge.getSharedState();
      if (shared?.selectedAppsCount !== undefined) {
        setSelectedAppCount(shared.selectedAppsCount);
      }
    } catch (error) {
      captureException(error, { context: 'loadSelectedApps' });
    }
  };

  const handleOpenPicker = async () => {
    setIsLoading(true);
    try {
      const result = await Bridge.pickApps();
      const count = result?.count || result?.tokens?.length || 0;
      setSelectedAppCount(count);
      
      // Update shared state with the count
      // Use nullish coalescing (??) to handle null properly - spreading null causes runtime error
      const shared = (await Bridge.getSharedState()) ?? {};
      await Bridge.syncSharedState({
        ...shared,
        selectedAppsCount: count,
      });
      
      // Show feedback
      if (count > 0) {
        Alert.alert('Apps Updated', `${count} app${count > 1 ? 's' : ''} selected for blocking.`);
      } else {
        Alert.alert('Apps Cleared', 'No apps are currently selected for blocking.');
      }
    } catch (error) {
      captureException(error, { context: 'handleOpenPicker' });
      Alert.alert('Error', 'Unable to update app selection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearApps = () => {
    Alert.alert(
      'Clear All Apps',
      'Are you sure you want to remove all selected apps?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Open picker with no selection (user will need to deselect all)
            // Note: iOS picker doesn't support programmatic clearing,
            // so we'll guide the user to clear manually
            Alert.alert(
              'Clear Apps',
              'Please open the app picker and deselect all apps to clear your selection.',
              [
                {
                  text: 'Open Picker',
                  onPress: handleOpenPicker,
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 44) }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Apps to Block</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
      
      <Text style={styles.description}>
        Select apps that should be blocked during prayer windows. These apps will be shielded when prayers are due.
      </Text>

      {/* Current Selection Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Currently Selected</Text>
        <Text style={styles.statusValue}>
          {selectedAppCount > 0
            ? `${selectedAppCount} app${selectedAppCount > 1 ? 's' : ''}`
            : 'No apps selected'}
        </Text>

        {selectedAppCount > 0 && (
          <>
            <Text style={styles.statusHint}>
              These apps will be blocked during prayer windows.
            </Text>

            <View style={styles.iconStripContainer}>
              <BlockedAppsStrip style={styles.iconStrip} />
            </View>
          </>
        )}

        {selectedAppCount === 0 && (
          <Text style={styles.statusHint}>
            Tap "Select Apps" to choose which apps you want shielded.
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleOpenPicker}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Loading...' : 'Select Apps'}
          </Text>
        </TouchableOpacity>

        {selectedAppCount > 0 && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleClearApps}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Clear All Apps</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>
          • Selected apps will be blocked during prayer windows{'\n'}
          • You can modify your selection at any time{'\n'}
          • Changes take effect immediately
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#66BB6A',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  description: {
    color: '#B0B0B0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statusLabel: {
    color: '#B0B0B0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusHint: {
    color: '#707070',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  iconStripContainer: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#252525',
  },
  iconStrip: {
    height: 44,
    width: '100%',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#66BB6A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  secondaryButtonText: {
    color: '#EF5350',
    fontSize: 17,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#B0B0B0',
    fontSize: 14,
    lineHeight: 20,
  },
});

