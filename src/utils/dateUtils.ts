/**
 * Date and time helper utilities for elderly friendly schedule formatting.
 */

/**
 * Formats time from 24h "HH:mm" to 12h format "h:mm A" (e.g. "08:00" -> "8:00 AM").
 */
export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // 0 hour is 12 AM
  return `${hour}:${minStr} ${ampm}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns formatted relative date string (Today, Tomorrow, or formatted date).
 */
export function formatRelativeDate(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return 'Today';

  const d = new Date(dateStr + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');
  const diffDays = Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Combines date string "YYYY-MM-DD" and time string "HH:mm" into a valid ISO string.
 */
export function combineDateTime(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`;
}
