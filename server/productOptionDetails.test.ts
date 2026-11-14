import test from "node:test";
import assert from "node:assert/strict";
import { resolveOrderItemOptionDetails } from "./productOptionDetails";
import { getBulkOptionId } from "../shared/bulkOptionIdentity";

test("standard variants take pieces and serves from the selected product record", () => {
  const result = resolveOrderItemOptionDetails(
    [{ productId: "variant-1", pieces: "tampered", serves: "tampered" }],
    [{ _id: "variant-1", name: "Variant", pieces: "5 pieces", serves: "Serves 2" }],
  );
  assert.equal(result.error, null);
  assert.equal(result.items[0].pieces, "5 pieces");
  assert.equal(result.items[0].serves, "Serves 2");
});

test("bulk options use exact option identity, not the parent product values", () => {
  const product = {
    _id: "fish-1",
    name: "Pomfret",
    fishInventoryMode: "bulk_portions",
    pieces: "old parent pieces",
    serves: "old parent serves",
    bulkPortionOptions: [
      { weightKg: 1, pieces: "4 pieces", serves: "Serves 2" },
      { weightKg: 1, pieces: "8 pieces", serves: "Serves 4" },
    ],
  };
  const secondOptionId = getBulkOptionId(product.bulkPortionOptions[1], 1);
  const result = resolveOrderItemOptionDetails(
    [{
      productId: "fish-1",
      weightKgPerUnit: 1,
      bulkOptionId: secondOptionId,
      pieces: "not trusted",
      serves: "not trusted",
    }],
    [product],
  );
  assert.equal(result.error, null);
  assert.equal(result.items[0].pieces, "8 pieces");
  assert.equal(result.items[0].serves, "Serves 4");
  assert.equal(result.items[0].inventoryBatchId, null);
});

test("whole fish snapshots details and ID from the selected batch", () => {
  const result = resolveOrderItemOptionDetails(
    [{ productId: "fish-2", fishBatchId: "batch-b" }],
    [{
      _id: "fish-2",
      name: "Rawas",
      fishInventoryMode: "whole_fish",
      pieces: "parent pieces",
      serves: "parent serves",
      batches: [
        { _id: "batch-a", batchNumber: "A", pieces: "2 pieces", serves: "Serves 1" },
        { _id: "batch-b", batchNumber: "B", pieces: "4 pieces", serves: "Serves 3" },
      ],
    }],
  );
  assert.equal(result.error, null);
  assert.equal(result.items[0].inventoryBatchId, "batch-b");
  assert.equal(result.items[0].fishBatchId, "batch-b");
  assert.equal(result.items[0].batchNumber, "B");
  assert.equal(result.items[0].pieces, "4 pieces");
  assert.equal(result.items[0].serves, "Serves 3");
});

test("missing option details stay empty rather than falling back to parent values", () => {
  const result = resolveOrderItemOptionDetails(
    [{ productId: "fish-3", weightKgPerUnit: 0.5, bulkOptionId: "index:0" }],
    [{
      _id: "fish-3",
      fishInventoryMode: "bulk_portions",
      pieces: "stale parent pieces",
      serves: "stale parent serves",
      bulkPortionOptions: [{ weightKg: 0.5 }],
    }],
  );
  assert.equal(result.error, null);
  assert.equal(result.items[0].pieces, null);
  assert.equal(result.items[0].serves, null);
});
