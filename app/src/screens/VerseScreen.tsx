import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, MosqueSilhouette } from '../ui';
import { VERSES, DailyVerse } from '../data/verses';
import { getItem, setItem } from '../storage/localStorage';
import { captureException } from '../utils/errorReporting';
import { getTodayHardcodedTimes } from '../logic/prayerTimesHardcoded';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Storage keys
const LIKED_VERSES_KEY = 'liked_verses';
const BOOKMARKED_VERSES_KEY = 'bookmarked_verses';
const VERSE_TO_SHOW_DAY_KEY = 'verse_to_show_day';
const LAST_FAJR_CHECK_DATE_KEY = 'verse_last_fajr_check_date';

// Map of surah names to Arabic (simplified - can be expanded later)
const SURAH_ARABIC_NAMES: { [key: string]: string } = {
  'Al‑Fatiha': 'الفاتحة',
  'Ali Imran': 'آل عمران',
  'Al‑Ma\'idah': 'المائدة',
  'An‑Nahl': 'النحل',
  'Al‑Baqarah': 'البقرة',
  'An‑Nisa\'': 'النساء',
  'Al‑Isra\'': 'الإسراء',
  'Al‑Hujurat': 'الحجرات',
  'Luqman': 'لقمان',
  'Al‑A\'raf': 'الأعراف',
  'Ta‑Ha': 'طه',
  'Al‑Muzzammil': 'المزمل',
  'Al‑Ahzab': 'الأحزاب',
  'An‑Nur': 'النور',
  'Saba\'': 'سبأ',
  'Al‑Mu\'minun': 'المؤمنون',
  'Al‑\'Ankabut': 'العنكبوت',
  'Fussilat': 'فصلت',
  'Muhammad': 'محمد',
  'Yusuf': 'يوسف',
  'Al‑An\'am': 'الأنعام',
};

type FilterType = 'all' | 'liked' | 'bookmarked';

export default function VerseScreen() {
  const insets = useSafeAreaInsets();
  
  // Filter state
  const [filter, setFilter] = useState<FilterType>('all');
  
  // State for liked and bookmarked verses (Sets of verse IDs)
  const [likedVerses, setLikedVerses] = useState<Set<string>>(new Set());
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set());
  
  // State for verse counter (index of verse to show)
  const [verseToShowDay, setVerseToShowDay] = useState<number>(0);
  
  // Animation values for icon feedback (useRef prevents memory leaks vs useMemo)
  const heartScale = useRef(new Animated.Value(1)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  
  // Filter verses based on current filter
  const filteredVerses = useMemo(() => {
    if (filter === 'all') return VERSES;
    if (filter === 'liked') return VERSES.filter(v => likedVerses.has(v.id));
    if (filter === 'bookmarked') return VERSES.filter(v => bookmarkedVerses.has(v.id));
    return VERSES;
  }, [filter, likedVerses, bookmarkedVerses]);
  
  
  const [index, setIndex] = useState(0);
  
  // Load verse counter and check if we need to increment
  useEffect(() => {
    const loadVerseCounter = async () => {
      try {
        // Load the current verse index (default to 0 if not set)
        const savedIndex = await getItem(VERSE_TO_SHOW_DAY_KEY);
        let currentIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
        
        // Check if Fajr has passed today and increment if needed
        const now = new Date();
        // Use local date (not UTC) to prevent timezone edge cases
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const lastCheckDate = await getItem(LAST_FAJR_CHECK_DATE_KEY);
        
        // Only check if we haven't checked today yet
        if (lastCheckDate !== todayKey) {
          const todayTimes = getTodayHardcodedTimes();
          const fajrTime = new Date(todayTimes.fajr);
          
          // If Fajr has passed today, increment the counter
          if (now >= fajrTime) {
            currentIndex += 1;
            
            // If increment exceeds list size, reset to 0
            if (currentIndex >= VERSES.length) {
              currentIndex = 0;
            }
            
            // Save the new index and today's date
            await setItem(VERSE_TO_SHOW_DAY_KEY, currentIndex.toString());
            await setItem(LAST_FAJR_CHECK_DATE_KEY, todayKey);
          }
        }
        
        // Set the final index (either the loaded one or the incremented one)
        setVerseToShowDay(currentIndex);
      } catch (error) {
        captureException(error, { context: 'loadVerseCounter' });
        setVerseToShowDay(0);
      }
    };
    
    loadVerseCounter();
  }, []);
  
  // Update index when filter changes or when verseToShowDay changes
  useEffect(() => {
    if (filter === 'all') {
      // For "Today" filter, use the verseToShowDay index
      setIndex(verseToShowDay);
    } else {
      // For liked/bookmarked filters, start at 0
      setIndex(0);
    }
  }, [filter, verseToShowDay]);
  
  // Ensure index stays within bounds of filtered verses (handles empty array case)
  const safeIndex = filteredVerses.length > 0 
    ? Math.min(Math.max(0, index), filteredVerses.length - 1) 
    : -1;
  const verse = safeIndex >= 0 ? filteredVerses[safeIndex] : null;
  const surahArabic = verse ? (SURAH_ARABIC_NAMES[verse.surahName] || verse.surahName) : '';
  const isLiked = verse ? likedVerses.has(verse.id) : false;
  const isBookmarked = verse ? bookmarkedVerses.has(verse.id) : false;

  // Load saved liked and bookmarked verses on mount
  useEffect(() => {
    const loadSavedVerses = async () => {
      try {
        const likedData = await getItem(LIKED_VERSES_KEY);
        const bookmarkedData = await getItem(BOOKMARKED_VERSES_KEY);
        
        if (likedData) {
          const likedArray = JSON.parse(likedData);
          setLikedVerses(new Set(likedArray));
        }
        
        if (bookmarkedData) {
          const bookmarkedArray = JSON.parse(bookmarkedData);
          setBookmarkedVerses(new Set(bookmarkedArray));
        }
      } catch (error) {
        captureException(error, { context: 'loadSavedVerses' });
      }
    };
    
    loadSavedVerses();
  }, []);

  // Save liked verses to storage
  const saveLikedVerses = useCallback(async (newLikedVerses: Set<string>) => {
    try {
      await setItem(LIKED_VERSES_KEY, JSON.stringify(Array.from(newLikedVerses)));
    } catch (error) {
      captureException(error, { context: 'saveLikedVerses' });
    }
  }, []);

  // Save bookmarked verses to storage
  const saveBookmarkedVerses = useCallback(async (newBookmarkedVerses: Set<string>) => {
    try {
      await setItem(BOOKMARKED_VERSES_KEY, JSON.stringify(Array.from(newBookmarkedVerses)));
    } catch (error) {
      captureException(error, { context: 'saveBookmarkedVerses' });
    }
  }, []);

  const handleNext = () => {
    if (filteredVerses.length === 0) return;
    setIndex((prev) => (prev + 1) % filteredVerses.length);
  };

  const handlePrevious = () => {
    if (filteredVerses.length === 0) return;
    setIndex((prev) => (prev - 1 + filteredVerses.length) % filteredVerses.length);
  };

  const handleFavorite = useCallback(() => {
    if (!verse) return;
    
    const newLikedVerses = new Set(likedVerses);
    
    if (isLiked) {
      newLikedVerses.delete(verse.id);
    } else {
      newLikedVerses.add(verse.id);
    }
    
    setLikedVerses(newLikedVerses);
    saveLikedVerses(newLikedVerses);
    
    // Animate icon
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLiked, verse?.id, likedVerses, heartScale, saveLikedVerses]);

  const handleBookmark = useCallback(() => {
    if (!verse) return;
    
    const newBookmarkedVerses = new Set(bookmarkedVerses);
    
    if (isBookmarked) {
      newBookmarkedVerses.delete(verse.id);
    } else {
      newBookmarkedVerses.add(verse.id);
    }
    
    setBookmarkedVerses(newBookmarkedVerses);
    saveBookmarkedVerses(newBookmarkedVerses);
    
    // Animate icon
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bookmarkScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isBookmarked, verse?.id, bookmarkedVerses, bookmarkScale, saveBookmarkedVerses]);

  const handleShare = useCallback(async () => {
    if (!verse) return;
    
    try {
      await Share.share({
        message: `${verse.arabic}\n\n${verse.transliteration}\n\n"${verse.translation}"\n\n— ${verse.surahName}, Ayah ${verse.ayah}`,
      });
    } catch (error: any) {
      // User cancelled share - not an error
      if (error?.name !== 'AbortError') {
        captureException(error, { context: 'shareVerse' });
        Alert.alert('Share Failed', 'Unable to share this verse.');
      }
    }
  }, [verse]);

  return (
    <LinearGradient
      colors={colors.gradient.background as [string, string]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.base, paddingBottom: insets.bottom + spacing.base }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Verse</Text>
          
          {/* Filter buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'liked' && styles.filterButtonActive]}
              onPress={() => setFilter('liked')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={filter === 'liked' ? 'heart' : 'heart-outline'} 
                size={14} 
                color={filter === 'liked' ? colors.textPrimary : colors.textSecondary} 
              />
              <Text style={[styles.filterButtonText, filter === 'liked' && styles.filterButtonTextActive]}>
                Liked {likedVerses.size > 0 && `(${likedVerses.size})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'bookmarked' && styles.filterButtonActive]}
              onPress={() => setFilter('bookmarked')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={filter === 'bookmarked' ? 'bookmark' : 'bookmark-outline'} 
                size={14} 
                color={filter === 'bookmarked' ? colors.textPrimary : colors.textSecondary} 
              />
              <Text style={[styles.filterButtonText, filter === 'bookmarked' && styles.filterButtonTextActive]}>
                Saved {bookmarkedVerses.size > 0 && `(${bookmarkedVerses.size})`}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* NEW AT FAJR pill - only show for 'all' filter */}
          {filter === 'all' && (
            <View style={styles.newPill}>
              <Ionicons name="refresh" size={10} color={colors.accent.primary} />
              <Text style={styles.newPillText}>NEW AT FAJR</Text>
            </View>
          )}
        </View>

        {/* Empty state for filtered views */}
        {filteredVerses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={filter === 'liked' ? 'heart-outline' : 'bookmark-outline'} 
              size={48} 
              color={colors.textTertiary} 
            />
            <Text style={styles.emptyStateText}>
              {filter === 'liked' 
                ? 'No liked verses yet' 
                : 'No saved verses yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'liked'
                ? 'Tap the heart icon to favorite verses'
                : 'Tap the bookmark icon to save verses'}
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setFilter('all')}
            >
              <Text style={styles.emptyStateButtonText}>Browse All Verses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Breadcrumb bar */}
            <View style={styles.breadcrumbContainer}>
              <View style={[styles.breadcrumbPill, styles.breadcrumbPillActive]}>
                <Text style={styles.breadcrumbTextActive}>{verse.surahName}</Text>
              </View>
              <View style={styles.breadcrumbDot} />
              <View style={styles.breadcrumbPill}>
                <Text style={styles.breadcrumbText}>{surahArabic}</Text>
              </View>
              <View style={styles.breadcrumbDot} />
              <View style={styles.breadcrumbPill}>
                <Text style={styles.breadcrumbText}>Ayah {verse.ayah}</Text>
              </View>
            </View>

            {/* Main verse card */}
            <View style={styles.verseCard}>
          {/* Arabic text */}
          <Text style={styles.arabicText}>{verse.arabic}</Text>
          
          {/* Separator with crescent */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Ionicons name="moon" size={16} color={colors.accent.primary} />
            <View style={styles.separatorLine} />
          </View>

          {/* Transliteration */}
          <Text style={styles.transliterationText}>{verse.transliteration}</Text>

          {/* Translation */}
          <Text style={styles.translationText}>{verse.translation}</Text>

          {/* Action icons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? "#EF5350" : colors.textPrimary} 
                />
              </Animated.View>
              {isLiked && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>♥</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={handleBookmark}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isBookmarked ? colors.accent.primary : colors.textPrimary} 
                />
              </Animated.View>
              {isBookmarked && (
                <View style={[styles.actionBadge, styles.actionBadgeBookmark]}>
                  <Text style={styles.actionBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {/* Status indicators */}
          {(isLiked || isBookmarked) && (
            <View style={styles.statusIndicators}>
              {isLiked && (
                <View style={styles.statusPill}>
                  <Ionicons name="heart" size={12} color="#EF5350" />
                  <Text style={styles.statusPillText}>Favorited</Text>
                </View>
              )}
              {isBookmarked && (
                <View style={[styles.statusPill, styles.statusPillBookmark]}>
                  <Ionicons name="bookmark" size={12} color={colors.accent.primary} />
                  <Text style={[styles.statusPillText, styles.statusPillTextBookmark]}>Saved</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Navigation controls - only show for liked/bookmarked filters */}
        {filter !== 'all' && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            {/* Page indicator */}
            <View style={styles.pageIndicator}>
              {filteredVerses.length > 0 && (
                <Text style={styles.pageIndicatorText}>
                  {safeIndex + 1} / {filteredVerses.length}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.navButton, styles.navButtonNext]}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, styles.navButtonTextNext]}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
        </>
        )}
      </ScrollView>

      {/* Mosque silhouette at bottom */}
      <View style={styles.mosqueContainer}>
        <MosqueSilhouette
          width={SCREEN_WIDTH}
          height={200}
          opacity={0.1}
          color={colors.accent.primary}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 250, // Space for mosque silhouette
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.accent.primary + '20',
    borderColor: colors.accent.primary + '60',
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  filterButtonTextActive: {
    color: colors.accent.primary,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    ...typography.headerMedium,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyStateButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.base,
  },
  emptyStateButtonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600' as const,
  },
  title: {
    ...typography.headerLarge,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  newPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  newPillText: {
    ...typography.labelTiny,
    color: colors.accent.primary,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  breadcrumbPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breadcrumbPillActive: {
    backgroundColor: colors.accent.primary + '20',
    borderColor: colors.accent.primary + '60',
  },
  breadcrumbText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  breadcrumbTextActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  breadcrumbDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  verseCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 42,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.lg,
    // Arabic text will automatically render RTL on React Native
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent.primary + '40',
  },
  transliterationText: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: colors.accent.primary,
    textAlign: 'center',
    marginBottom: spacing.base,
    fontStyle: 'italic',
  },
  translationText: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
  },
  actionIcon: {
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: '#EF5350',
    borderRadius: radius.full,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundCard,
  },
  actionBadgeBookmark: {
    backgroundColor: colors.accent.primary,
  },
  actionBadgeText: {
    fontSize: 8,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statusIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF5350' + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#EF5350' + '40',
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs / 2,
  },
  statusPillBookmark: {
    backgroundColor: colors.accent.primary + '20',
    borderColor: colors.accent.primary + '40',
  },
  statusPillText: {
    ...typography.labelTiny,
    color: '#EF5350',
    marginLeft: spacing.xs,
  },
  statusPillTextBookmark: {
    color: colors.accent.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    marginBottom: spacing.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  navButtonNext: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  navButtonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  navButtonTextNext: {
    marginLeft: 0,
    marginRight: spacing.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
  },
  pageIndicatorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textTertiary,
  },
  pageDotActive: {
    width: 20,
    backgroundColor: colors.accent.primary,
  },
  pageDotMargin: {
    marginRight: spacing.sm,
  },
  mosqueContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
    zIndex: 0,
  },
});

