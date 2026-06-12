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

const dateFmt = new Intl.DateTimeFormat("en-US", {
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
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function formatDay(iso: string) {
  return dayFmt.format(new Date(iso));
}

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(iso: string) {
  return timeFmt.format(new Date(iso));
}

const shortDateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

/** e.g. "12 Jun - 9:00 AM" */
export function formatShortKickoff(iso: string) {
  const d = new Date(iso);
  return `${shortDateFmt.format(d)} - ${timeFmt.format(d)}`;
}

/** YYYY-MM-DD bucket key for grouping fixtures by day (local time). */
export function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
