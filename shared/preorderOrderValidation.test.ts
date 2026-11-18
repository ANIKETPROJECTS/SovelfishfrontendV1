import test from "node:test";
import assert from "node:assert/strict";
import { validatePreorderOrderInput } from "./preorderOrderValidation";

const today = "2026-11-18";
const preorderProduct = {
  _id: "preorder-id",
  name: "Preorder Pomfret",
  preorderMode: "preorder_only",
  preorderAvailability: {
    type: "date_range",
    startDate: "2026-11-20",
    endDate: "2026-11-30",
  },
};

test("accepts an eligible preorder-only product on a future delivery date", () => {
  assert.equal(validatePreorderOrderInput({
    orderType: "preorder",
    deliveryType: "delivery",
    deliveryDate: "2026-11-20",
    items: [{ productId: "preorder-id" }],
  }, [preorderProduct], today), null);
});

test("rejects invalid dates, today's date, and dates outside product availability", () => {
  for (const deliveryDate of ["bad", "2026-11-18", "2026-12-01"]) {
    assert.match(validatePreorderOrderInput({
      orderType: "preorder",
      deliveryType: "delivery",
      deliveryDate,
      items: [{ productId: "preorder-id" }],
    }, [preorderProduct], today) ?? "", /future date|not available/);
  }
});

test("rejects normal, mixed, missing, archived, and inactive preorder products", () => {
  const cases = [
    { products: [{ ...preorderProduct, preorderMode: "normal" }], message: /not marked as preorder-only/ },
    { products: [], message: /not available for preorder/ },
    { products: [{ ...preorderProduct, isArchived: true }], message: /not currently available/ },
    { products: [{ ...preorderProduct, status: "unavailable" }], message: /not currently available/ },
  ];

  for (const entry of cases) {
    assert.match(validatePreorderOrderInput({
      orderType: "preorder",
      deliveryType: "delivery",
      deliveryDate: "2026-11-20",
      items: [{ productId: "preorder-id" }],
    }, entry.products, today) ?? "", entry.message);
  }
});

test("preorders are delivery-only and never accept combos or unsaved IDs", () => {
  assert.match(validatePreorderOrderInput({
    orderType: "preorder",
    deliveryType: "takeaway",
    deliveryDate: "2026-11-20",
    items: [{ productId: "preorder-id" }],
  }, [preorderProduct], today) ?? "", /delivery only/);

  assert.match(validatePreorderOrderInput({
    orderType: "preorder",
    deliveryType: "delivery",
    deliveryDate: "2026-11-20",
    items: [{ productId: "unsaved-combo-id" }],
  }, [preorderProduct], today) ?? "", /not available for preorder/);
});

test("normal checkout rejects preorder-only products without rejecting shared-mode products", () => {
  assert.match(validatePreorderOrderInput({
    orderType: "normal",
    items: [{ productId: "preorder-id" }],
  }, [preorderProduct], today) ?? "", /must be ordered through Preorder/);
  assert.equal(validatePreorderOrderInput({
    orderType: "normal",
    items: [{ productId: "preorder-id" }],
  }, [{ ...preorderProduct, preorderMode: "normal_and_preorder" }], today), null);
});
