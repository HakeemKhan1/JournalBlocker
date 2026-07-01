/**
 * Journal Blocker — "orb" design tokens.
 *
 * Ported from the Claude Design composition (Journal Blocker.dc.html): a dark,
 * cosmic palette with a warm peach accent, a breathing gradient "orb" as the
 * signature element, Newsreader (serif) for display copy and Hanken Grotesk
 * (sans) for UI.
 */
import { Platform } from 'react-native';

/* --- fonts -------------------------------------------------------------- */
// On web we pull the two families from Google Fonts (injected once below).
// On native we fall back to the system sans + a system serif so the app still
// renders without bundling font files; the web preview is the design target.
if (Platform.OS === 'web' && typeof document !== 'undefined' &&
    !document.getElementById('jb-fonts')) {
  const link = document.createElement('link');
  link.id = 'jb-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap';
  document.head.appendChild(link);
  // page background so the area around the phone matches the design canvas
  document.body.style.background =
    'radial-gradient(130% 100% at 50% -8%, #1c1838 0%, #0a0913 70%)';
}

export const SANS = Platform.select({
  web: "'Hanken Grotesk', system-ui, sans-serif",
  default: undefined,
});
export const SERIF = Platform.select({
  web: "'Newsreader', Georgia, serif",
  ios: 'Georgia',
  default: 'serif',
});

/* --- colors ------------------------------------------------------------- */
export const C = {
  // text
  ink: '#efeafe',        // primary
  ink2: '#e8e3fb',
  soft: '#c4bee6',
  dim: '#a39dc9',
  mute: '#8b85b3',       // secondary label
  faint: '#6f699a',      // tertiary
  off: '#4d4870',        // disabled

  // accent (peach) + warm
  acc: '#f5a97f',
  accDeep: '#f0926b',
  accLite: '#f7b48f',
  warm: '#ffd9bf',
  onAcc: '#2a1320',

  // semantic
  green: '#7bbf9e',
  greenLite: '#a9e0c6',
  pink: '#e89bb5',
  red: '#e8978f',
  redLite: '#f3b0a8',
  purple: '#c9a6ef',
  blue: '#8fb0ef',

  // surfaces (over the dark phone background)
  s04: 'rgba(255,255,255,0.04)',
  s05: 'rgba(255,255,255,0.05)',
  s06: 'rgba(255,255,255,0.06)',
  s08: 'rgba(255,255,255,0.08)',
  b08: 'rgba(255,255,255,0.08)',
  b10: 'rgba(255,255,255,0.10)',
  b12: 'rgba(255,255,255,0.12)',

  // tinted accent surfaces
  accSurf: 'rgba(245,169,127,0.12)',
  accSurfHi: 'rgba(245,169,127,0.14)',
  accBorder: 'rgba(245,169,127,0.24)',
  accBorderHi: 'rgba(245,169,127,0.30)',
};

// gradient stop sets (for expo-linear-gradient / svg)
export const G = {
  button: ['#f7b48f', '#f0926b'],          // primary CTA (top→bottom)
  phoneBg: ['#241f44', '#16132b', '#0f0d1e'],
  appTile: ['#3a2f63', '#241f44'],
  // orb radial stops: offset → color
  orb: [
    { offset: 0, color: '#ffe6cc' },
    { offset: 0.33, color: '#f5a97f' },
    { offset: 0.61, color: '#d07f9b' },
    { offset: 1, color: '#6a4aa6' },
  ],
};

export default { C, G, SANS, SERIF };
