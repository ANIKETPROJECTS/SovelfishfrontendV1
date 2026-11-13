export const INDIA_TIME_ZONE = "Asia/Kolkata";
export const NEXT_DAY_DELIVERY_CUTOFF_MINUTES = 17 * 60;

type DeliveryScheduleInput = {
  deliveryType?: string | null;
  orderType?: string | null;
  scheduleType?: string | null;
  timeslotId?: string | null;
  timeslotLabel?: string | null;
  timeslotStart?: string | null;
  timeslotEnd?: string | null;
  deliveryDate?: string | null;
  nextDayOrder?: boolean;
};

function getDateTimeParts(date: Date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: INDIA_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
}

export function getIndiaDateKey(date = new Date()): string {
  const parts = getDateTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getIndiaMinutesSinceMidnight(date = new Date()): number {
  const parts = getDateTimeParts(date);
  return Number(parts.hour) * 60 + Number(parts.minute);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) {
    throw new Error(`Invalid calendar date: ${dateKey}`);
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatIndiaDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) {
    return dateKey;
  }
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Derive next-day scheduling for standard storefront delivery orders.
 * Payment initiation stores this result; trusted payment finalizers reuse that
 * stored payload instead of recalculating it after a later callback or retry.
 */
export function applyAutomaticNextDayDelivery<T extends DeliveryScheduleInput>(
  input: T,
  now = new Date(),
): T & { deliveryDate: string; nextDayOrder: boolean } {
  const today = getIndiaDateKey(now);
  const isOrdinaryDelivery =
    (input.deliveryType ?? "delivery") === "delivery" &&
    input.orderType !== "preorder" &&
    (!input.scheduleType || input.scheduleType === "standard") &&
    !input.timeslotId &&
    !input.timeslotLabel &&
    !input.timeslotStart &&
    !input.timeslotEnd;

  if (!isOrdinaryDelivery) {
    return {
      ...input,
      deliveryDate: input.deliveryDate ?? today,
      nextDayOrder: false,
    };
  }

  const cutoffPassed = getIndiaMinutesSinceMidnight(now) >= NEXT_DAY_DELIVERY_CUTOFF_MINUTES;
  const tomorrow = addDaysToDateKey(today, 1);

  // After the cutoff, the storefront may already have sent tomorrow's date
  // from its live label. Recognize exactly that date as the automatic choice;
  // other future dates remain explicit schedules.
  if (isValidDateKey(input.deliveryDate) && input.deliveryDate > today) {
    return {
      ...input,
      nextDayOrder: cutoffPassed && input.deliveryDate === tomorrow,
    } as T & { deliveryDate: string; nextDayOrder: boolean };
  }

  return {
    ...input,
    deliveryDate: cutoffPassed ? tomorrow : today,
    nextDayOrder: cutoffPassed,
  };
}
