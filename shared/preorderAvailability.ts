export const PREORDER_AVAILABILITY_TYPES = ["all", "weekdays", "date_range", "date_range_and_weekdays"] as const;
export type PreorderAvailabilityType = (typeof PREORDER_AVAILABILITY_TYPES)[number];

export type PreorderAvailability = {
  type: PreorderAvailabilityType;
  weekdays?: number[];
  startDate?: string;
  endDate?: string;
  timeslotIdsByWeekday?: Record<string, string[]>;
};

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export function normalizePreorderAvailability(value: unknown): PreorderAvailability {
  if (!value || typeof value !== "object") {
    return { type: "all", weekdays: ALL_WEEKDAYS };
  }

  const raw = value as Record<string, unknown>;
  const weekdays = Array.isArray(raw.weekdays)
    ? raw.weekdays
      .map(Number)
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      .filter((day, index, days) => days.indexOf(day) === index)
      .sort((a, b) => a - b)
    : ALL_WEEKDAYS;
  const startDate = typeof raw.startDate === "string" ? raw.startDate : "";
  const endDate = typeof raw.endDate === "string" ? raw.endDate : "";
  const timeslotIdsByWeekday = raw.timeslotIdsByWeekday && typeof raw.timeslotIdsByWeekday === "object"
    ? Object.fromEntries(
      Object.entries(raw.timeslotIdsByWeekday as Record<string, unknown>).map(([day, ids]) => [
        day,
        Array.isArray(ids) ? ids.map(String) : [],
      ]),
    )
    : undefined;
  const rawType = PREORDER_AVAILABILITY_TYPES.includes(raw.type as PreorderAvailabilityType)
    ? raw.type as PreorderAvailabilityType
    : null;

  // The external admin editor has stored constrained schedules with
  // type:"all" while still persisting weekdays/startDate/endDate. Infer the
  // effective rule from those fields so the storefront does not reopen every
  // date. Explicit constrained fields always take precedence over that legacy
  // type value.
  const hasDateRange = Boolean(startDate || endDate);
  const hasWeekdayRestriction = weekdays.length < ALL_WEEKDAYS.length;
  const type: PreorderAvailabilityType = hasDateRange
    ? (hasWeekdayRestriction ? "date_range_and_weekdays" : "date_range")
    : hasWeekdayRestriction
      ? "weekdays"
      : rawType ?? "all";

  return {
    type,
    weekdays,
    startDate,
    endDate,
    timeslotIdsByWeekday,
  };
}

function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function getWeekdays(raw: Record<string, unknown>): number[] | null {
  if (raw.weekdays === undefined) return ALL_WEEKDAYS;
  if (!Array.isArray(raw.weekdays)) return null;
  const weekdays = raw.weekdays;
  if (
    weekdays.length === 0 ||
    weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  ) {
    return null;
  }
  return [...new Set(weekdays)];
}

/** Date keys are deliberately treated as calendar dates, not UTC timestamps. */
export function isPreorderDateAvailable(
  dateKey: string,
  availability: unknown,
): boolean {
  if (!isValidDateKey(dateKey)) return false;
  if (availability == null) return true;
  if (!availability || typeof availability !== "object" || Array.isArray(availability)) return false;

  const raw = availability as Record<string, unknown>;
  const supportedType = PREORDER_AVAILABILITY_TYPES.includes(raw.type as PreorderAvailabilityType);
  if (raw.type !== undefined && !supportedType) return false;

  const weekdays = getWeekdays(raw);
  if (!weekdays) return false;

  const startDate = raw.startDate === undefined || raw.startDate === ""
    ? null
    : isValidDateKey(raw.startDate) ? raw.startDate : false;
  const endDate = raw.endDate === undefined || raw.endDate === ""
    ? null
    : isValidDateKey(raw.endDate) ? raw.endDate : false;
  if (startDate === false || endDate === false) return false;

  const hasRange = startDate !== null || endDate !== null;
  if (hasRange && (startDate === null || endDate === null || startDate > endDate)) return false;

  const weekdaysRestricted = weekdays.length < ALL_WEEKDAYS.length;
  const type = raw.type as PreorderAvailabilityType | undefined;
  const effectiveType: PreorderAvailabilityType = hasRange
    ? (weekdaysRestricted ? "date_range_and_weekdays" : "date_range")
    : weekdaysRestricted
      ? "weekdays"
      : type ?? "all";

  if (effectiveType === "date_range" || effectiveType === "date_range_and_weekdays") {
    if (startDate === null || endDate === null || dateKey < startDate || dateKey > endDate) return false;
  }
  if (effectiveType === "weekdays" || effectiveType === "date_range_and_weekdays") {
    const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
    if (!weekdays.includes(weekday)) return false;
  }
  return true;
}

/**
 * A preorder cart has one shared delivery date. Therefore a date is eligible
 * only when every product in the cart allows that date.
 */
export function isPreorderDateAvailableForAll(
  dateKey: string,
  availabilities: unknown[],
): boolean {
  return availabilities.length > 0
    && availabilities.every((availability) => isPreorderDateAvailable(dateKey, availability));
}

/**
 * Finds the next date accepted by every product schedule. The starting date
 * is supplied by the caller so browser and server code can use India-local
 * "tomorrow" without making this pure helper depend on a machine timezone.
 */
export function findFirstPreorderDateKey(
  firstFutureDateKey: string,
  availabilities: unknown[],
  maxDays = 730,
): string | null {
  if (!isValidDateKey(firstFutureDateKey) || availabilities.length === 0) return null;
  const candidate = new Date(`${firstFutureDateKey}T00:00:00.000Z`);
  for (let offset = 0; offset < maxDays; offset += 1) {
    const dateKey = candidate.toISOString().slice(0, 10);
    if (isPreorderDateAvailableForAll(dateKey, availabilities)) return dateKey;
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return null;
}