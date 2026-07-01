/**
 * Design color tokens - updated to match Figma design
 */

export const colors = {
  // Backgrounds
  background: '#1A1C1B',        // Primary background from Figma
  backgroundSecondary: '#051006', // Deeper dark green
  backgroundCard: '#292E2B',     // Prayer box color from Figma
  surface: '#1A2A1F',            // Elevated surfaces
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#707070',
  
  // Accents
  accent: {
    primary: '#2FA05E',          // Primary green
    secondary: '#66BB6A',        // Secondary green (progress rings)
    interactive: '#2FA05E',      // Buttons, links
    dueLocked: '#2FA05E',
    prayed: '#66BB6A',
    missed: '#EF5350',
  },
  
  // Gradients
  gradient: {
    primary: ['#2FA05E', '#1DB954'],      // Button gradient
    background: ['#1A1C1B', '#1A1C1B'],   // Background gradient (solid color)
    card: ['#132417', '#0F1A14'],         // Card gradient
  },
  
  // Borders & Dividers
  border: '#1A2A1F',
  divider: '#132417',
  
  // Status Colors
  status: {
    new: '#2FA05E',              // "NEW" tag
    active: '#2FA05E',           // Active prayer
    completed: '#66BB6A',        // Completed prayer
    pending: '#707070',          // Pending prayer
  },
  
  // Badges (kept for compatibility)
  badge: {
    notDue: {
      fill: '#3A3A3A',
      text: '#B0B0B0',
    },
    dueLocked: {
      fill: '#2E7D32',
      text: '#A5D6A7',
    },
    prayed: {
      fill: '#2E7D32',
      text: '#A5D6A7',
    },
    missed: {
      fill: '#C62828',
      text: '#EF5350',
    },
  },
};

