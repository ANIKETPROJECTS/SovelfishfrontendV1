export type PriceHistoryEntry = {
  price: number;
  changedAt: Date | string;
  source: "created" | "admin" | "baseline";
};

export type MarketMovement = {
  direction: "up" | "down" | "steady";
  changeAmount: number;
  changePercent: number;
  referencePrice: number;
  comparisonLabel: string;
};

export type MarketPriceRange = {
  low: number;
  high: number;
};

export function getCatalogProductPrice(
  product: { price?: number | null; fishPricePerKg?: number | null },
  usesFishPerKgPricing: boolean,
): number | null {
  if (!usesFishPerKgPricing) return product.price ?? null;

  const fishPricePerKg = Number(product.fishPricePerKg ?? product.price);
  return Number.isFinite(fishPricePerKg) && fishPricePerKg > 0
    ? fishPricePerKg
    : product.price ?? null;
}

const INDIA_TIME_ZONE = "Asia/Kolkata";

function getIndiaDayStart(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const utcMidnight = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day));
  return new Date(utcMidnight - (5 * 60 + 30) * 60_000);
}

function getYesterdayClose(
  history: Array<PriceHistoryEntry & { timestamp: number }>,
  todayStart: number,
) {
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  return [...history]
    .reverse()
    .find((entry) => entry.timestamp >= yesterdayStart && entry.timestamp < todayStart);
}

function getIndiaHour(date: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: INDIA_TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(date),
  );
}

function normalizeHistory(history: unknown): Array<PriceHistoryEntry & { timestamp: number }> {
  if (!Array.isArray(history)) return [];

  return history
    .map((entry: any) => ({
      price: Number(entry?.price),
      changedAt: entry?.changedAt,
      source: entry?.source,
      timestamp: new Date(entry?.changedAt).getTime(),
    }))
    .filter(
      (entry) =>
        Number.isFinite(entry.price) &&
        Number.isFinite(entry.timestamp) &&
        ["created", "admin", "baseline"].includes(entry.source),
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function getMarketMovement(
  currentPrice: number | null | undefined,
  rawHistory: unknown,
  now: Date = new Date(),
): MarketMovement | null {
  if (currentPrice == null || !Number.isFinite(Number(currentPrice))) return null;

  const history = normalizeHistory(rawHistory);
  if (!history.length) return null;

  const dayStart = getIndiaDayStart(now).getTime();
  const yesterdayClose = getYesterdayClose(history, dayStart);
  const todayAdminUpdates = history.filter(
    (entry) => entry.source === "admin" && entry.timestamp >= dayStart && entry.timestamp <= now.getTime(),
  );

  let referenceEntry: (typeof history)[number] | undefined;
  let comparisonLabel = "";

  if (todayAdminUpdates.length >= 2) {
    referenceEntry = todayAdminUpdates[0];
    comparisonLabel = getIndiaHour(new Date(referenceEntry.timestamp)) < 12
      ? "vs morning price"
      : "vs first update today";
  } else {
    referenceEntry = yesterdayClose;
    if (referenceEntry) comparisonLabel = "vs yesterday close";
  }

  if (!referenceEntry) return null;

  const changeAmount = Math.round((Number(currentPrice) - referenceEntry.price) * 100) / 100;
  const changePercent = referenceEntry.price > 0
    ? Math.round((changeAmount / referenceEntry.price) * 1000) / 10
    : 0;
  const direction = changeAmount > 0
    ? "up"
    : changeAmount < 0
      ? "down"
      : "steady";

  return {
    direction,
    changeAmount,
    changePercent,
    referencePrice: referenceEntry.price,
    comparisonLabel,
  };
}

export function getDailyPriceRange(
  currentPrice: number | null | undefined,
  rawHistory: unknown,
  now: Date = new Date(),
): MarketPriceRange | null {
  if (currentPrice == null || !Number.isFinite(Number(currentPrice))) return null;

  const history = normalizeHistory(rawHistory);
  if (!history.length) return null;

  const dayStart = getIndiaDayStart(now).getTime();
  const availableHistory = history.filter((entry) => entry.timestamp <= now.getTime());
  const yesterdayClose = getYesterdayClose(availableHistory, dayStart);
  const prices = [
    ...(yesterdayClose == null ? [] : [yesterdayClose.price]),
    ...availableHistory
      .filter((entry) => entry.timestamp >= dayStart)
      .map((entry) => entry.price),
  ];

  if (!prices.length) return null;
  const trackedPrices = [...prices, Number(currentPrice)];
  return {
    low: Math.min(...trackedPrices),
    high: Math.max(...trackedPrices),
  };
}

export function getYesterdayAndTodayHistory(
  rawHistory: unknown,
  now: Date = new Date(),
): Array<{ price: number; changedAt: string }> {
  const history = normalizeHistory(rawHistory);
  const dayStart = getIndiaDayStart(now).getTime();
  const yesterdayClose = getYesterdayClose(history, dayStart);
  const todayEntries = history.filter(
    (entry) => entry.timestamp >= dayStart && entry.timestamp <= now.getTime(),
  );
  const points = [
    ...(yesterdayClose ? [yesterdayClose] : []),
    ...todayEntries.slice(-5),
  ];

  return points.map((entry) => ({
    price: entry.price,
    changedAt: new Date(entry.timestamp).toISOString(),
  }));
}
