// Returns ISO timestamps for today's hard-coded prayer times in local timezone.
// Used as fallback when adhan library is unavailable or location services are disabled.
export function getTodayHardcodedTimes(baseDate = new Date()) {
  const now = new Date(baseDate);
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const mk = (h, min) => new Date(y, m, d, h, min, 0, 0).toISOString();
  return {
    fajr: mk(3, 12),   // 2:25 AM - TESTING
    dhuhr: mk(13, 0),  // 1:00 PM
    asr: mk(16, 0),    // 4:00 PM
    maghrib: mk(19, 55), // 7:55 PM
    isha: mk(21, 15),  // 9:15 PM
  };
}

export const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function formatTimeLocal(iso) {
  const dt = new Date(iso);
  const hh = dt.getHours().toString().padStart(2, '0');
  const mm = dt.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}


