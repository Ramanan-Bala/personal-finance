export function parseUtcDate(input: unknown): Date | null {
  if (typeof input !== 'string') return null;
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isValidTimeZone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function getTimeZoneParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value]),
  );

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    millisecond: Number(map.fractionalSecond || '0'),
  };
}

function getTimeZoneOffsetMs(date: Date, timezone: string): number {
  const parts = getTimeZoneParts(date, timezone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
  timezone: string,
): Date {
  const utcGuess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    millisecond,
  );
  const offset = getTimeZoneOffsetMs(new Date(utcGuess), timezone);
  return new Date(utcGuess - offset);
}

export function startOfDayInTimeZone(date: Date, timezone: string): Date {
  const parts = getTimeZoneParts(date, timezone);
  return zonedDateTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    0,
    0,
    0,
    0,
    timezone,
  );
}

export function endOfDayInTimeZone(date: Date, timezone: string): Date {
  const parts = getTimeZoneParts(date, timezone);
  return zonedDateTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    23,
    59,
    59,
    999,
    timezone,
  );
}

export function dayStampInTimeZone(date: Date, timezone: string): string {
  const parts = getTimeZoneParts(date, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function utcStartOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function utcEndOfDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}
