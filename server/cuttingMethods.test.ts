import test from "node:test";
import assert from "node:assert/strict";
import {
  getCartLineId,
  isValidCuttingMethodSelection,
  normalizeCuttingMethods,
} from "../shared/cuttingMethods";
import { insertOrderRequestSchema } from "../shared/schema";

test("normalizes method lists while preserving their display order", () => {
  assert.deepEqual(
    normalizeCuttingMethods([" Cleaned ", "Fillet", "Cleaned", "", null]),
    ["Cleaned", "Fillet"],
  );
});

test("keeps cart lines with different cutting selections separate", () => {
  assert.notEqual(
    getCartLineId("fish-1", ["Fillet"]),
    getCartLineId("fish-1", ["Cleaned and slices"]),
  );
  assert.equal(
    getCartLineId("fish-1", ["Fillet", "Cleaned"]),
    getCartLineId("fish-1", ["Cleaned", "Fillet"]),
  );
  assert.equal(getCartLineId("fish-1", []), "fish-1");
});

test("accepts no selection and exact configured methods only", () => {
  const allowed = ["Cleaned and slices", "Cube Cut", "Fillet"];
  assert.equal(isValidCuttingMethodSelection([], allowed), true);
  assert.equal(isValidCuttingMethodSelection(["Fillet", "Cube Cut"], allowed), true);
  assert.equal(isValidCuttingMethodSelection(["Fillet "], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["As it is(no cleaned)"], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["Fillet", "Fillet"], allowed), false);
});

test("keeps cutting selections when parsing checkout items", () => {
  const result = insertOrderRequestSchema.safeParse({
    customerName: "Test Customer",
    phone: "9876543210",
    deliveryArea: "Thane",
    address: "Test address",
    items: [{
      productId: "6ae98b72595b9bb2203cc069",
      quantity: 1,
      name: "Surmai",
      price: 900,
      cuttingMethods: ["Cleaned and slices", "Fillet"],
    }],
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.items[0].cuttingMethods, ["Cleaned and slices", "Fillet"]);
  }
});
