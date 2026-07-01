/**
 * Journal — iOS design tokens (Apple HIG).
 *
 * System grouped-background chrome, SF-style type, a single warm tint. No emoji;
 * icons come from Ionicons (SF-Symbol-like) via components/Sym.
 */
import { Platform } from 'react-native';
import { spacing } from '../ui/tokens';

/** SF on iOS; closest system stack on web so it reads as Apple. */
export const family = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif',
  default: undefined,
});

export const colors = {
  // Backgrounds
  groupedBg: '#F2F2F7',   // systemGroupedBackground
  bg: '#FFFFFF',
  cell: '#FFFFFF',        // secondarySystemGroupedBackground
  cellPressed: '#E5E5EA',
  fill: '#EFEFF4',        // subtle filled controls / mood pills

  // Text
  label: '#1C1C1E',
  secondary: '#8A8A8E',   // secondaryLabel
  tertiary: '#B7B7BC',    // tertiaryLabel / chevrons
  separator: '#E4E4E9',

  // Color roles
  tint: '#E8714C',        // warm journal accent (used as the system tint)
  blue: '#007AFF',
  green: '#34C759',
  red: '#FF3B30',

  // Settings-style icon tile fills
  tiles: {
    orange: '#FF9500', red: '#FF3B30', blue: '#007AFF', green: '#34C759',
    purple: '#AF52DE', pink: '#FF375F', teal: '#30B0C7', indigo: '#5856D6',
    gray: '#8E8E93', yellow: '#FFC400', brown: '#A2845E', mint: '#00C7BE',
  },
};

const t = (o) => ({ ...o, fontFamily: family });
export const type = {
  largeTitle: t({ fontSize: 34, fontWeight: '700', letterSpacing: 0.37 }),
  title1: t({ fontSize: 28, fontWeight: '700' }),
  title2: t({ fontSize: 22, fontWeight: '700' }),
  title3: t({ fontSize: 20, fontWeight: '600' }),
  headline: t({ fontSize: 17, fontWeight: '600' }),
  body: t({ fontSize: 17, fontWeight: '400' }),
  callout: t({ fontSize: 16, fontWeight: '400' }),
  subhead: t({ fontSize: 15, fontWeight: '400' }),
  footnote: t({ fontSize: 13, fontWeight: '400' }),
  caption: t({ fontSize: 12, fontWeight: '400' }),
};

export const radius = { tile: 7, card: 10, sheet: 14, button: 12, pill: 999 };

export const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export { spacing };
export default { colors, type, radius, spacing, family, cardShadow };
