import assert from "node:assert/strict";
import test from "node:test";
import { applyAutomaticNextDayDelivery } from "../shared/nextDayDelivery";

const standardDelivery = {
  deliveryType: "delivery",
  orderType: "normal",
  scheduleType: "standard",
  deliveryDate: "2026-11-13",
};

test("keeps ordinary delivery on today at 4:59 PM India time", () => {
  const result = applyAutomaticNextDayDelivery(
    standardDelivery,
    new Date("2026-11-13T11:29:00.000Z"),
  );
  assert.equal(result.deliveryDate, "2026-11-13");
  assert.equal(result.nextDayOrder, false);
});

test("schedules ordinary delivery for tomorrow at exactly 5:00 PM India time", () => {
  const result = applyAutomaticNextDayDelivery(
    standardDelivery,
    new Date("2026-11-13T11:30:00.000Z"),
  );
  assert.equal(result.deliveryDate, "2026-11-14");
  assert.equal(result.nextDayOrder, true);
});

test("marks the storefront's already-updated tomorrow date as automatic after cutoff", () => {
  const result = applyAutomaticNextDayDelivery(
    { ...standardDelivery, deliveryDate: "2026-11-14" },
    new Date("2026-11-13T11:30:00.000Z"),
  );
  assert.equal(result.deliveryDate, "2026-11-14");
  assert.equal(result.nextDayOrder, true);
});

test("keeps an order placed at 11:59 PM on the following date", () => {
  const result = applyAutomaticNextDayDelivery(
    standardDelivery,
    new Date("2026-11-13T18:29:00.000Z"),
  );
  assert.equal(result.deliveryDate, "2026-11-14");
  assert.equal(result.nextDayOrder, true);
});

test("starts a new day with today's date and no next-day flag", () => {
  const result = applyAutomaticNextDayDelivery(
    { ...standardDelivery, deliveryDate: "2026-11-14", nextDayOrder: true },
    new Date("2026-11-13T18:30:00.000Z"),
  );
  assert.equal(result.deliveryDate, "2026-11-14");
  assert.equal(result.nextDayOrder, false);
});

test("preserves explicit future, preorder, takeaway, and custom scheduled dates", () => {
  const now = new Date("2026-11-13T11:30:00.000Z");
  const beforeCutoff = new Date("2026-11-13T11:29:00.000Z");
  assert.deepEqual(
    applyAutomaticNextDayDelivery({ ...standardDelivery, deliveryDate: "2026-11-14" }, beforeCutoff),
    { ...standardDelivery, deliveryDate: "2026-11-14", nextDayOrder: false },
  );
  assert.deepEqual(
    applyAutomaticNextDayDelivery({ ...standardDelivery, deliveryDate: "2026-11-16" }, now),
    { ...standardDelivery, deliveryDate: "2026-11-16", nextDayOrder: false },
  );
  assert.deepEqual(
    applyAutomaticNextDayDelivery({ ...standardDelivery, orderType: "preorder" }, now),
    { ...standardDelivery, orderType: "preorder", nextDayOrder: false },
  );
  assert.deepEqual(
    applyAutomaticNextDayDelivery({ ...standardDelivery, deliveryType: "takeaway" }, now),
    { ...standardDelivery, deliveryType: "takeaway", nextDayOrder: false },
  );
  assert.deepEqual(
    applyAutomaticNextDayDelivery({ ...standardDelivery, scheduleType: "scheduled" }, now),
    { ...standardDelivery, scheduleType: "scheduled", nextDayOrder: false },
  );
});
