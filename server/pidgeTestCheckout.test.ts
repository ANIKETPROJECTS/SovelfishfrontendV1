import test from "node:test";
import assert from "node:assert/strict";
import {
  getPidgeTestOrderRejection,
  isPidgeTestCustomer,
} from "./pidgeTestCheckout";

const validTestOrder = {
  configuredPhone: "5551234567",
  sessionPhone: "+91 5551234567",
  orderPhone: "5551234567",
  itemCount: 1,
  itemQuantity: 1,
  paymentCount: 0,
  hasPaymentReference: false,
  hasCoupon: false,
  discount: 0,
  walletAmountUsed: 0,
  productIsPidgeTestProduct: true,
  productIsArchived: false,
  productStatus: "available",
  productPrice: 1,
  itemPrice: 1,
};

test("allows the configured test phone with exactly the ₹1 test product and no payment", () => {
  assert.equal(isPidgeTestCustomer("7507219775", "+91 7507219775"), true);
  assert.equal(getPidgeTestOrderRejection(validTestOrder), null);
});

test("blocks missing or mismatched test-phone configuration", () => {
  assert.equal(isPidgeTestCustomer("", "5551234567"), false);
  assert.equal(isPidgeTestCustomer("5551234567", "5557654321"), false);
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, sessionPhone: "5557654321" })?.status,
    403,
  );
});

test("rejects multiple items, quantities, and any payment or discount values", () => {
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, itemCount: 2 })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, itemQuantity: 2 })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, paymentCount: 1 })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, hasCoupon: true })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, walletAmountUsed: 1 })?.status,
    400,
  );
});

test("rejects a regular, archived, unavailable, or repriced product", () => {
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, productIsPidgeTestProduct: false })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, productIsArchived: true })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, productStatus: "unavailable" })?.status,
    400,
  );
  assert.equal(
    getPidgeTestOrderRejection({ ...validTestOrder, itemPrice: 99 })?.status,
    400,
  );
});
