import { PRAYER_ORDER } from './prayerTimesHardcoded';

export function deriveCurrentPrayer(todayTimes, prayedMap = {}, now = new Date()) {
  let current = null;
  // Find the latest prayer that has passed (regardless of whether it's been prayed or not)
  for (const p of PRAYER_ORDER) {
    if (new Date(todayTimes[p]) <= now) {
      current = p;
    }
  }
  return current;
}

// Calculate tomorrow's Fajr based on today's Fajr time (24 hours later)
function getTomorrowFajr(todayFajrTime) {
  const tomorrowFajr = new Date(todayFajrTime);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return tomorrowFajr.toISOString();
}

// Get the next prayer to display, including tomorrow's Fajr if all today's prayers have passed
export function getNextPrayerToDisplay(todayTimes, now = new Date()) {
  for (const p of PRAYER_ORDER) {
    if (new Date(todayTimes[p]) > now) {
      return { prayer: p, time: todayTimes[p], isTomorrow: false };
    }
  }
  // All prayers passed, return tomorrow's Fajr
  return { prayer: 'fajr', time: getTomorrowFajr(todayTimes.fajr), isTomorrow: true };
}

export function deriveStatuses(todayTimes, prayedMap, now = new Date()) {
  const current = deriveCurrentPrayer(todayTimes, prayedMap, now);
  const statuses = {};
  for (const p of PRAYER_ORDER) {
    const adhan = new Date(todayTimes[p]);
    const prayed = prayedMap[p] === true;
    if (prayed) {
      statuses[p] = 'Prayed';
      continue;
    }
    if (adhan > now) {
      statuses[p] = 'Not Due';
      continue;
    }
    // At or after adhān
    if (p === current) {
      statuses[p] = 'Due (Locked)';
    } else {
      statuses[p] = 'Missed';
    }
  }
  return { currentPrayer: current, statuses };
}

// Get all prayers that must be checked before shields can be cleared
export function getRequiredPrayersToClear(currentPrayer) {
  if (!currentPrayer) return [];
  
  // Find the index of the current prayer
  const currentIndex = PRAYER_ORDER.indexOf(currentPrayer);
  
  // Return all prayers from the start up to and including the current prayer
  return PRAYER_ORDER.slice(0, currentIndex + 1);
}

// Check if all required prayers have been marked as completed
export function areAllRequiredPrayersComplete(requiredPrayers, prayedMap) {
  return requiredPrayers.every(prayer => prayedMap[prayer] === true);
}


