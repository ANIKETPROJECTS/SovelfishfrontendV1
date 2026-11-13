import assert from "node:assert/strict";
import test from "node:test";
import {
  addCityAreaChargeToPrice,
  findCityAreaOption,
  priceItemsForCityArea,
  sumPricedItems,
} from "./cityAreaPricing";

const options = [
  { id: "a", name: "Airoli", charge: 0 },
  { id: "b", name: "Ghansoli", charge: 100 },
];

test("matches a configured area without accepting arbitrary names", () => {
  assert.equal(findCityAreaOption(options, "  GHANSOLI ")?.name, "Ghansoli");
  assert.equal(findCityAreaOption(options, "Unknown"), null);
  assert.equal(findCityAreaOption(options, ""), null);
});

test("adds the area charge per unit and keeps zero-charge areas free", () => {
  const ghansoli = findCityAreaOption(options, "Ghansoli")!;
  const priced = priceItemsForCityArea([
    { productId: "p1", price: 200, quantity: 2 },
  ], ghansoli);
  assert.equal(priced[0].basePrice, 200);
  assert.equal(priced[0].price, 300);
  assert.equal(sumPricedItems(priced), 600);

  const airoli = findCityAreaOption(options, "Airoli")!;
  assert.equal(addCityAreaChargeToPrice(200, airoli.charge), 200);
});

test("rejects invalid prices instead of silently applying a zero charge", () => {
  assert.throws(() => addCityAreaChargeToPrice(200, Number.NaN));
  assert.throws(() => priceItemsForCityArea([
    { productId: "p1", price: null, quantity: 1 },
  ], options[0]));
});
