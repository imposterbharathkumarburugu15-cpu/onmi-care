/**
 * Adherence calculation and dose state machine engine.
 * Tracks dose status transitions, compliance percentage, and consecutive day streaks.
 */
import { DoseEvent, DoseStatus, AdherenceStats } from '../types/adherence';

/**
 * Determines current status of a dose based on scheduled time and current time.
 * Windows:
 * - Taken -> TAKEN
 * - Skipped -> SKIPPED
 * - t < scheduled - 15m -> SCHEDULED
 * - scheduled - 15m <= t < scheduled -> REMINDED
 * - scheduled <= t <= scheduled + 30m -> DUE
 * - t > scheduled + 30m -> MISSED
 */
export function determineDoseStatus(
  scheduledTime: string,
  now: Date,
  isTaken: boolean,
  isSkipped: boolean
): DoseStatus {
  if (isTaken) return 'TAKEN';
  if (isSkipped) return 'SKIPPED';

  const scheduledMs = new Date(scheduledTime).getTime();
  const nowMs = now.getTime();
  const diffMinutes = (nowMs - scheduledMs) / (1000 * 60);

  if (diffMinutes < -15) {
    return 'SCHEDULED';
  } else if (diffMinutes >= -15 && diffMinutes < 0) {
    return 'REMINDED';
  } else if (diffMinutes >= 0 && diffMinutes <= 30) {
    return 'DUE';
  } else {
    return 'MISSED';
  }
}

/**
 * Computes adherence statistics from a list of dose events:
 * - percentage: (Taken / (Scheduled - Skipped)) * 100
 * - currentStreak: consecutive days meeting >= 80% adherence up to today/yesterday
 * - bestStreak: historical maximum streak
 */
export function calculateAdherence(events: DoseEvent[]): AdherenceStats {
  if (events.length === 0) {
    return {
      percentage: 100,
      currentStreak: 0,
      bestStreak: 0,
      totalScheduled: 0,
      totalTaken: 0,
      totalSkipped: 0,
      totalMissed: 0,
    };
  }

  let totalTaken = 0;
  let totalSkipped = 0;
  let totalMissed = 0;

  // Group events by date (YYYY-MM-DD)
  const daysMap = new Map<string, { taken: number; skipped: number; missed: number; total: number }>();

  for (const ev of events) {
    const dateKey = ev.scheduledDate || ev.scheduledTime.split('T')[0];
    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, { taken: 0, skipped: 0, missed: 0, total: 0 });
    }
    const dayStats = daysMap.get(dateKey)!;
    dayStats.total += 1;

    if (ev.status === 'TAKEN') {
      totalTaken += 1;
      dayStats.taken += 1;
    } else if (ev.status === 'SKIPPED') {
      totalSkipped += 1;
      dayStats.skipped += 1;
    } else if (ev.status === 'MISSED') {
      totalMissed += 1;
      dayStats.missed += 1;
    }
  }

  // Calculate percentage: valid taken vs applicable scheduled
  const applicableTotal = events.length - totalSkipped;
  const percentage =
    applicableTotal > 0
      ? Math.round((totalTaken / applicableTotal) * 100)
      : 100;

  // Calculate streak based on daily compliance
  const sortedDates = Array.from(daysMap.keys()).sort();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const date of sortedDates) {
    const day = daysMap.get(date)!;
    const applicableDay = day.total - day.skipped;
    const dayCompliant = applicableDay === 0 || (day.taken / applicableDay) >= 0.8;

    if (dayCompliant && day.taken > 0) {
      tempStreak += 1;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  currentStreak = tempStreak;

  return {
    percentage: Math.min(100, Math.max(0, percentage)),
    currentStreak,
    bestStreak,
    totalScheduled: events.length,
    totalTaken,
    totalSkipped,
    totalMissed,
  };
}
