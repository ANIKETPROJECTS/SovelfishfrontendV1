import test from "node:test";
import assert from "node:assert/strict";
import {
  findFirstPreorderDateKey,
  isPreorderDateAvailable,
  isPreorderDateAvailableForAll,
} from "./preorderAvailability";

test("all-date availability accepts valid calendar dates and rejects invalid dates", () => {
  assert.equal(isPreorderDateAvailable("2026-11-19", { type: "all" }), true);
  assert.equal(isPreorderDateAvailable("2026-02-29", { type: "all" }), false);
  assert.equal(isPreorderDateAvailable("2026-11-19", null), true);
});

test("weekday schedules use JavaScript weekday numbering", () => {
  const weekdays = { type: "weekdays", weekdays: [1, 3] };
  assert.equal(isPreorderDateAvailable("2026-11-18", weekdays), true); // Wednesday
  assert.equal(isPreorderDateAvailable("2026-11-19", weekdays), false); // Thursday
});

test("date ranges include both endpoints and reject dates outside them", () => {
  const range = { type: "date_range", startDate: "2026-11-19", endDate: "2026-11-21" };
  assert.equal(isPreorderDateAvailable("2026-11-19", range), true);
  assert.equal(isPreorderDateAvailable("2026-11-21", range), true);
  assert.equal(isPreorderDateAvailable("2026-11-18", range), false);
  assert.equal(isPreorderDateAvailable("2026-11-22", range), false);
});

test("date ranges can also restrict weekdays, including legacy type all records", () => {
  const range = {
    type: "all",
    startDate: "2026-11-18",
    endDate: "2026-11-22",
    weekdays: [3, 5],
  };
  assert.equal(isPreorderDateAvailable("2026-11-18", range), true);
  assert.equal(isPreorderDateAvailable("2026-11-19", range), false);
  assert.equal(isPreorderDateAvailable("2026-11-20", range), true);
});

test("malformed availability fails closed", () => {
  assert.equal(isPreorderDateAvailable("2026-11-19", { type: "unknown" }), false);
  assert.equal(isPreorderDateAvailable("2026-11-19", { type: "weekdays", weekdays: [] }), false);
  assert.equal(isPreorderDateAvailable("2026-11-19", { type: "date_range", startDate: "bad", endDate: "2026-12-01" }), false);
  assert.equal(isPreorderDateAvailable("2026-11-19", { type: "date_range", startDate: "2026-11-20", endDate: "2026-11-19" }), false);
});

test("a shared preorder date must satisfy every product schedule", () => {
  assert.equal(isPreorderDateAvailableForAll("2026-11-20", [
    { type: "all" },
    { type: "weekdays", weekdays: [5] },
  ]), true);
  assert.equal(isPreorderDateAvailableForAll("2026-11-19", [
    { type: "all" },
    { type: "weekdays", weekdays: [5] },
  ]), false);
  assert.equal(isPreorderDateAvailableForAll("2026-11-20", []), false);
});

test("finds the first future date shared by all schedules", () => {
  assert.equal(findFirstPreorderDateKey("2026-11-19", [
    { type: "weekdays", weekdays: [5] },
    { type: "all" },
  ]), "2026-11-20");
  assert.equal(findFirstPreorderDateKey("2026-11-19", [
    { type: "date_range", startDate: "2026-11-01", endDate: "2026-11-18" },
  ]), null);
});
