import test from "node:test";
import assert from "node:assert/strict";
import {
  findCheckoutStockIssues,
  getCheckoutAvailableQuantity,
} from "./checkoutStock";

const now = new Date("2026-09-29T12:00:00.000Z");

test("uses top-level quantity when the checkout has no managed batches", () => {
  assert.equal(getCheckoutAvailableQuantity({ quantity: 4 }, now), 4);
});

test("counts only unexpired checkout batches and ignores external POS batches", () => {
  const product = {
    quantity: 99,
    batches: [{ quantity: 50 }],
    inventoryBatches: [
      { quantity: 2, expiryDate: "2026-09-30T00:00:00.000Z" },
      { quantity: 8, expiryDate: "2026-09-28T00:00:00.000Z" },
      { quantity: 10, remainingTime: "expired", expiryDate: "2026-10-01T00:00:00.000Z" },
    ],
  };
  assert.equal(getCheckoutAvailableQuantity(product, now), 2);
});

test("uses the checkout quantity for a shortage and reports missing products", () => {
  const issues = findCheckoutStockIssues(
    [
      { productId: "a", quantity: 3 },
      { productId: "missing", quantity: 1 },
    ],
    new Map([["a", { name: "Chicken", quantity: 2 }]]),
    new Map([["missing", "Fish"]],
    ),
    now,
  );

  assert.deepEqual(issues, [
    { productId: "a", name: "Chicken", requested: 3, available: 2 },
    { productId: "missing", name: "Fish", requested: 1, available: 0 },
  ]);
});

test("checks weighted portions against fractional kilogram inventory", () => {
  const products = new Map([
    ["prawns", { name: "Prawns", quantity: 1.05 }],
  ]);

  assert.deepEqual(
    findCheckoutStockIssues(
      [{ productId: "prawns", quantity: 4, stockPerUnit: 0.275 }],
      products,
      new Map(),
      now,
    ),
    [{ productId: "prawns", name: "Prawns", requested: 1.1, available: 1.05 }],
  );
  assert.deepEqual(
    findCheckoutStockIssues(
      [{ productId: "prawns", quantity: 3, stockPerUnit: 0.275 }],
      products,
      new Map(),
      now,
    ),
    [],
  );
});

test("archived and unavailable products are treated as unavailable", () => {
  assert.equal(getCheckoutAvailableQuantity({ quantity: 10, isArchived: true }, now), 0);
  assert.equal(getCheckoutAvailableQuantity({ quantity: 10, status: "unavailable" }, now), 0);
});