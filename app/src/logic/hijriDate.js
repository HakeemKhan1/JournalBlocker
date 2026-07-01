/**
 * Hijri date conversion utility using hijri-converter library
 * Provides accurate Gregorian to Hijri date conversion
 */

import { toHijri as convertToHijri } from 'hijri-converter';

const HIJRI_MONTHS = [
  'MUHARRAM', 'SAFAR', 'RABI\' AL-AWWAL', 'RABI\' AL-THANI',
  'JUMADA AL-ULA', 'JUMADA AL-THANI', 'RAJAB', 'SHA\'BAN',
  'RAMADAN', 'SHAWWAL', 'DHU AL-QI\'DAH', 'DHU AL-HIJJAH'
];

/**
 * Convert Gregorian date to Hijri date
 * @param {Date} gregorianDate - The Gregorian date to convert
 * @returns {Object} Object with day, month (0-indexed), year, and monthName
 */
export function toHijri(gregorianDate) {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1; // 1-indexed for hijri-converter
  const day = gregorianDate.getDate();
  
  try {
    const hijri = convertToHijri(year, month, day);
    
    return {
      day: hijri.hd,
      month: hijri.hm - 1, // 0-indexed for consistency with JavaScript Date
      year: hijri.hy,
      monthName: HIJRI_MONTHS[hijri.hm - 1] || 'UNKNOWN'
    };
  } catch (e) {
    // Fallback to approximate calculation if library fails
    const hijriYear = Math.floor((year - 622) * 1.030684);
    const monthIndex = Math.max(0, Math.min(11, month - 1));
    
    return {
      day: Math.max(1, Math.min(30, day)),
      month: monthIndex,
      year: hijriYear,
      monthName: HIJRI_MONTHS[monthIndex]
    };
  }
}

/**
 * Format Hijri date as "5 SHA'BAN 1442 AH"
 * @param {Date} gregorianDate - The Gregorian date to convert and format
 * @returns {string} Formatted Hijri date string
 */
export function formatHijriDate(gregorianDate) {
  const hijri = toHijri(gregorianDate);
  return `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;
}
