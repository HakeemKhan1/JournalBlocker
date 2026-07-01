/**
 * Typography tokens - updated to match Figma design
 * Format: { fontSize, lineHeight, fontWeight }
 * @type {const} - Ensures fontWeight values are typed as literal strings for TypeScript
 */

/** @type {const} */
export const typography = {
  // Header
  headerLarge: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: /** @type {'700'} */ ('700'),
  },
  headerMedium: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: /** @type {'700'} */ ('700'),
  },
  
  // Body
  bodyLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: /** @type {'600'} */ ('600'),
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: /** @type {'500'} */ ('500'),
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: /** @type {'500'} */ ('500'),
  },
  
  // Times
  timeLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: /** @type {'700'} */ ('700'),
  },
  timeMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: /** @type {'600'} */ ('600'),
  },
  
  // Labels
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: /** @type {'600'} */ ('600'),
  },
  labelTiny: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: /** @type {'600'} */ ('600'),
  },
  
  // Buttons
  button: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: /** @type {'700'} */ ('700'),
  },
  
  // Legacy (kept for compatibility)
  titleL: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: /** @type {'700'} */ ('700'),
  },
  titleM: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: /** @type {'700'} */ ('700'),
  },
  bodyM: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: /** @type {'500'} */ ('500'),
  },
  metaS: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: /** @type {'600'} */ ('600'),
  },
};

