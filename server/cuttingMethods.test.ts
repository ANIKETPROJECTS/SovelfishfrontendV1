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
  assert.notEqual(
    getCartLineId("fish-1", [], { pieces: "4 pieces", serves: "Serves 2" }),
    getCartLineId("fish-1", [], { pieces: "8 pieces", serves: "Serves 4" }),
  );
});

test("accepts no selection and exact configured methods only", () => {
  const allowed = ["Cleaned and slices", "Cube Cut", "Fillet"];
  assert.equal(isValidCuttingMethodSelection([], []), true);
  assert.equal(isValidCuttingMethodSelection([], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["Fillet"], allowed), true);
  assert.equal(isValidCuttingMethodSelection(["Fillet "], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["As it is(no cleaned)"], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["Fillet", "Fillet"], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["Fillet", "Cube Cut"], allowed), false);
  assert.equal(isValidCuttingMethodSelection(["Fillet"], []), false);
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
      cuttingMethods: ["Cleaned and slices"],
      fishBatchId: "batch-1",
      inventoryBatchId: "batch-1",
      batchNumber: "LOT-1",
      pieces: "4 pieces",
      serves: "Serves 2",
    }],
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.items[0].cuttingMethods, ["Cleaned and slices"]);
    assert.equal(result.data.items[0].fishBatchId, "batch-1");
    assert.equal(result.data.items[0].inventoryBatchId, "batch-1");
    assert.equal(result.data.items[0].batchNumber, "LOT-1");
    assert.equal(result.data.items[0].pieces, "4 pieces");
    assert.equal(result.data.items[0].serves, "Serves 2");
  }

  const multiple = insertOrderRequestSchema.safeParse({
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
  assert.equal(multiple.success, false);
});
