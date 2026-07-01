import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, Dimensions, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Bridge from '../native/LockedIslamBridge';
import { captureException } from '../utils/errorReporting';
import { colors, spacing, typography, MosqueSilhouette } from '../ui';
import { requestNotificationPermissions } from '../services/notificationService';

// DeenShield logo for the welcome screen
const deenShieldLogo = require('../ui/assets/deenshield_app_logo.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to render the appropriate icon based on iconType
const renderIcon = (iconType, size = 32, color = '#2FA05E') => {
  const iconMap = {
    'shield': 'shield-checkmark',
    'bell': 'notifications',
    'book': 'book',
    'screentime': 'hourglass',
    'location': 'location',
    'notification': 'notifications-outline',
  };
  const iconName = iconMap[iconType] || 'help-circle';
  return <Ionicons name={iconName} size={size} color={color} />;
};

const ONBOARDING_SLIDES = [
  {
    id: 'welcome',
    title: 'DeenShield',
    tagline: 'Discipline powered by Deen.',
    features: [
      { iconType: 'shield', title: 'Smart Blocking', description: 'Reduce distractions during prayer windows' },
      { iconType: 'bell', title: 'Prayer Notifications', description: 'Get notified before each prayer time' },
      { iconType: 'book', title: 'Study Sessions', description: 'Block apps while you study and focus' },
    ],
    primaryButton: { text: 'Get Started', action: 'next' },
  },
  {
    id: 'permission-screentime',
    iconType: 'screentime',
    title: 'Enable Screen Time Access',
    subtitle: 'Required for Smart Blocking',
    body: 'DeenShield needs Screen Time permission to block distracting apps during prayer and study sessions.',
    primaryButton: { text: 'Allow Screen Time', action: 'requestScreenTime' },
    secondaryButton: { text: 'Skip for Now', action: 'next' },
  },
  {
    id: 'permission-location',
    iconType: 'location',
    title: 'Enable Location Access',
    subtitle: 'For Accurate Prayer Times',
    body: 'We use your location to calculate precise prayer times and show the Qibla direction from where you are.',
    primaryButton: { text: 'Allow Location', action: 'requestLocation' },
    secondaryButton: { text: 'Skip for Now', action: 'next' },
  },
  {
    id: 'permission-notifications',
    iconType: 'notification',
    title: 'Enable Notifications',
    subtitle: 'Never Miss a Prayer',
    body: 'Get gentle reminders before each prayer time so you can prepare and stay on track with your daily prayers.',
    primaryButton: { text: 'Allow Notifications', action: 'requestNotifications' },
    secondaryButton: { text: 'Skip for Now', action: 'next' },
  },
  {
    id: 'lock-setup',
    iconType: 'shield',
    title: 'Smart Lock Setup',
    body: 'Choose which apps to lock during prayer windows so you stay disciplined and focused when it matters.',
    primaryButton: { text: 'Pick Apps to Block', action: 'pickApps' },
    secondaryButton: { text: 'Set Up Later', action: 'next' },
  },
  {
    id: 'ready',
    iconType: 'book',
    title: 'You\'re All Set!',
    subtitle: 'Ready to build spiritual discipline',
    body: 'Discover daily verses, a live prayer countdown, and a Qibla compass to guide your day.',
    primaryButton: { text: 'Get Started', action: 'complete' },
  },
];

export default function OnboardingScreen({ onComplete }) {
  const flatListRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slideIndex);
  };

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentSlide + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const handleAction = async (action) => {
    switch (action) {
      case 'next':
        handleNext();
        break;

      case 'pickApps':
        await Bridge.pickApps();
        handleNext();
        break;

      case 'requestScreenTime':
        try {
          await Bridge.authorizeScreenTime();
        } catch (error) {
          captureException(error, { context: 'authorizeScreenTime' });
        }
        handleNext();
        break;

      case 'requestLocation':
        try {
          await Location.requestForegroundPermissionsAsync();
        } catch (error) {
          captureException(error, { context: 'requestLocationPermission' });
        }
        handleNext();
        break;

      case 'requestNotifications':
        try {
          await requestNotificationPermissions();
        } catch (error) {
          captureException(error, { context: 'requestNotificationPermission' });
        }
        handleNext();
        break;

      case 'complete':
        await onComplete();
        break;

      default:
        handleNext();
    }
  };

  const renderSlide = ({ item: slide }) => {
    const isWelcome = slide.id === 'welcome';
    
    // Custom deep gradient for all screens to match theme
    const gradientColors = ['#0F2415', '#000000']; // Deep Jungle Green -> Black

    return (
      <LinearGradient
        colors={gradientColors}
        style={[styles.slideContainer, { width: SCREEN_WIDTH }]}
      >
        {/* Mosque Silhouette - Anchored to bottom for all screens */}
        <View style={styles.mosqueFooter}>
             <MosqueSilhouette 
              width={SCREEN_WIDTH} 
              height={SCREEN_WIDTH * 0.6}
              opacity={0.1}
            />
        </View>

        <View style={styles.contentContainer}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={styles.logoLockup}>
                    {isWelcome ? (
                        <Image 
                        source={deenShieldLogo}
                        style={styles.welcomeLogo}
                        resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.glassIconCircle}>
                            {renderIcon(slide.iconType, 48)}
                        </View>
                    )}
                </View>

                <Text style={[styles.title, isWelcome && styles.welcomeTitle]}>{slide.title}</Text>
                
                {slide.subtitle && (
                    <Text style={styles.subtitle}>{slide.subtitle}</Text>
                )}

                {isWelcome ? (
                    <Text style={styles.tagline}>{slide.tagline}</Text>
                ) : (
                    <Text style={styles.bodyText}>{slide.body}</Text>
                )}
            </View>

            {/* Features (Welcome only) */}
            {isWelcome && (
            <View style={styles.featuresContainer}>
                {slide.features.map((feature, idx) => (
                <View key={idx} style={styles.glassFeatureCard}>
                    <View style={styles.glassIcon}>
                         {renderIcon(feature.iconType, 32)}
                    </View>
                    <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                </View>
                ))}
            </View>
            )}
            
            {!isWelcome && <View style={styles.spacer} />}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.primaryButton, styles.glowButton]}
                onPress={() => handleAction(slide.primaryButton.action)}
                activeOpacity={0.8}
            >
                <Text style={styles.primaryButtonText}>{slide.primaryButton.text}</Text>
            </TouchableOpacity>

            {slide.secondaryButton && (
                <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => handleAction(slide.secondaryButton.action)}
                activeOpacity={0.8}
                >
                <Text style={styles.secondaryButtonText}>{slide.secondaryButton.text}</Text>
                </TouchableOpacity>
            )}
            
             {/* Legal Text (Welcome only) */}
            {isWelcome && (
              <TouchableOpacity onPress={() => Linking.openURL('https://deenshield.app/privacy')}>
                <Text style={styles.legalText}>
                    By continuing, you agree to our <Text style={styles.linkText}>Terms & Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
            </View>
        </View>

        {/* Pagination Dots - Positioned at bottom */}
        <View style={styles.paginationContainer}>
          {ONBOARDING_SLIDES.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                idx === currentSlide && styles.dotActive,
                idx < ONBOARDING_SLIDES.length - 1 && styles.dotMargin
              ]} 
            />
          ))}
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60, 
    paddingBottom: 40,
  },
  contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
  },
  mosqueFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 0,
  },
  headerSection: {
      alignItems: 'center',
  },
  logoLockup: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  welcomeLogo: {
    width: 100,
    height: 100,
  },
  glassIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    ...typography.headerLarge,
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  welcomeTitle: {
      fontSize: 42,
      marginBottom: 0,
      lineHeight: 48,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.accent.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 14,
  },
  tagline: {
    ...typography.bodyLarge,
    fontSize: 16,
    color: colors.accent.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '500',
    marginTop: 4,
  },
  bodyText: {
    ...typography.bodyMedium,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 28,
    paddingHorizontal: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  featuresContainer: {
    width: '100%',
    marginVertical: spacing.md,
  },
  glassFeatureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  glassIcon: {
      marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    zIndex: 10,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glowButton: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    ...typography.button,
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  legalText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  linkText: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl, 
    marginTop: spacing.md, 
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotMargin: {
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
    width: 24,
  },
});
