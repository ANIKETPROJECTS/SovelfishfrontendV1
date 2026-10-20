import test from "node:test";
import assert from "node:assert/strict";
import { getDailyPriceRange, getMarketMovement } from "./marketPricing";

const today = new Date("2026-10-21T10:30:00+05:30");

test("compares the first price update of the day with the prior day's close", () => {
  const movement = getMarketMovement(
    540,
    [
      { price: 500, changedAt: "2026-10-20T12:00:00+05:30", source: "created" },
      { price: 540, changedAt: "2026-10-21T08:00:00+05:30", source: "admin" },
    ],
    today,
  );

  assert.deepEqual(movement, {
    direction: "up",
    changeAmount: 40,
    changePercent: 8,
    referencePrice: 500,
    comparisonLabel: "vs yesterday close",
  });
});

test("compares later updates with the first morning price of the day", () => {
  const movement = getMarketMovement(
    510,
    [
      { price: 500, changedAt: "2026-10-20T12:00:00+05:30", source: "created" },
      { price: 540, changedAt: "2026-10-21T08:00:00+05:30", source: "admin" },
      { price: 510, changedAt: "2026-10-21T14:00:00+05:30", source: "admin" },
    ],
    new Date("2026-10-21T15:00:00+05:30"),
  );

  assert.deepEqual(movement, {
    direction: "down",
    changeAmount: -30,
    changePercent: -5.6,
    referencePrice: 540,
    comparisonLabel: "vs morning price",
  });
});

test("does not invent a movement before any price history is recorded", () => {
  assert.equal(getMarketMovement(300, [], today), null);
});

test("shows a steady price against yesterday's close when there was no update today", () => {
  const movement = getMarketMovement(
    500,
    [{ price: 500, changedAt: "2026-10-20T12:00:00+05:30", source: "created" }],
    today,
  );

  assert.deepEqual(movement, {
    direction: "steady",
    changeAmount: 0,
    changePercent: 0,
    referencePrice: 500,
    comparisonLabel: "vs yesterday close",
  });
});

test("calculates the day's low and high from the prior close and today's recorded prices", () => {
  const range = getDailyPriceRange(
    510,
    [
      { price: 500, changedAt: "2026-10-20T12:00:00+05:30", source: "created" },
      { price: 540, changedAt: "2026-10-21T08:00:00+05:30", source: "admin" },
      { price: 510, changedAt: "2026-10-21T14:00:00+05:30", source: "admin" },
    ],
    new Date("2026-10-21T15:00:00+05:30"),
  );

  assert.deepEqual(range, { low: 500, high: 540 });
});

test("does not invent a low or high before price history is recorded", () => {
  assert.equal(getDailyPriceRange(300, [], today), null);
});
