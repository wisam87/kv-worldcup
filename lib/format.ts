/** Result entry unlocks this many hours after kickoff (soft lock). */
export const RESULT_LOCK_HOURS = 2;

/** True once we are >= kickoff + RESULT_LOCK_HOURS. */
export function isResultUnlocked(kickoffIso: string, now: Date = new Date()) {
  const unlockAt =
    new Date(kickoffIso).getTime() + RESULT_LOCK_HOURS * 3600 * 1000;
  return now.getTime() >= unlockAt;
}

export function unlockAt(kickoffIso: string) {
  return new Date(
    new Date(kickoffIso).getTime() + RESULT_LOCK_HOURS * 3600 * 1000
  );
}

// Kickoffs are stored in UTC; the whole audience is in the Maldives, and these
// pages are server-rendered, so we pin all display formatting to Maldives time
// (UTC+5) rather than relying on the server's or browser's timezone.
const TZ = "Indian/Maldives";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatKickoff(iso: string) {
  return dateFmt.format(new Date(iso));
}

const dayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function formatDay(iso: string) {
  return dayFmt.format(new Date(iso));
}

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(iso: string) {
  return timeFmt.format(new Date(iso));
}

const shortDateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
});

/** e.g. "12 Jun - 9:00 AM" (Maldives time) */
export function formatShortKickoff(iso: string) {
  const d = new Date(iso);
  return `${shortDateFmt.format(d)} - ${timeFmt.format(d)}`;
}

// YYYY-MM-DD bucket key for grouping fixtures by Maldives day.
const keyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dayKey(iso: string) {
  return keyFmt.format(new Date(iso));
}
