import assert from "node:assert/strict";
import test from "node:test";
import { getValidAddressCoordinates } from "./addressCoordinates";
import {
  insertCustomerAddressSchema,
  insertOrderRequestSchema,
  updateCustomerAddressSchema,
} from "./schema";

const addressFields = {
  name: "A Customer",
  phone: "9876543210",
  building: "Building 1",
  street: "Market Road",
  area: "Thane",
  pincode: "400708",
};

test("accepts only complete, finite, in-range coordinate pairs", () => {
  assert.deepEqual(
    getValidAddressCoordinates({ latitude: 19.2183, longitude: 72.9781 }),
    { latitude: 19.2183, longitude: 72.9781 },
  );
  assert.equal(getValidAddressCoordinates({ latitude: 19.2 }), null);
  assert.equal(getValidAddressCoordinates({ latitude: 19.2, longitude: "72.9" }), null);
  assert.equal(getValidAddressCoordinates({ latitude: Number.NaN, longitude: 72.9 }), null);
  assert.equal(getValidAddressCoordinates({ latitude: 91, longitude: 72.9 }), null);
  assert.equal(getValidAddressCoordinates({ latitude: 19.2, longitude: 181 }), null);
});

test("customer address creation allows no pin or a valid pin pair", () => {
  assert.equal(insertCustomerAddressSchema.safeParse(addressFields).success, true);
  assert.equal(insertCustomerAddressSchema.safeParse({ ...addressFields, pincode: "" }).success, true);
  assert.equal(insertCustomerAddressSchema.safeParse({ ...addressFields, pincode: "123456" }).success, true);
  assert.equal(insertCustomerAddressSchema.safeParse({ ...addressFields, pincode: "PIN-UNKNOWN" }).success, false);
  assert.equal(insertCustomerAddressSchema.safeParse({ ...addressFields, pincode: "12345" }).success, false);
  const { pincode: _pincode, ...addressWithoutPincode } = addressFields;
  assert.equal(insertCustomerAddressSchema.safeParse(addressWithoutPincode).success, true);
  assert.equal(
    insertCustomerAddressSchema.safeParse({
      ...addressFields,
      latitude: 19.2183,
      longitude: 72.9781,
    }).success,
    true,
  );
  assert.equal(
    insertCustomerAddressSchema.safeParse({ ...addressFields, latitude: 19.2183 }).success,
    false,
  );
});

test("address updates preserve omitted pins and clear or set both coordinates together", () => {
  assert.equal(updateCustomerAddressSchema.safeParse({ area: "Thane" }).success, true);
  assert.equal(updateCustomerAddressSchema.safeParse({ pincode: "123456" }).success, true);
  assert.equal(updateCustomerAddressSchema.safeParse({ pincode: "ANY-VALUE" }).success, false);
  assert.equal(
    updateCustomerAddressSchema.safeParse({ latitude: 19.2183, longitude: 72.9781 }).success,
    true,
  );
  assert.equal(
    updateCustomerAddressSchema.safeParse({ latitude: null, longitude: null }).success,
    true,
  );
  assert.equal(updateCustomerAddressSchema.safeParse({ latitude: null }).success, false);
  assert.equal(
    updateCustomerAddressSchema.safeParse({ latitude: 19.2183, longitude: null }).success,
    false,
  );
});

test("order validation retains a complete pin and rejects partial coordinates", () => {
  const order = {
    customerName: "A Customer",
    phone: "9876543210",
    deliveryArea: "Thane",
    address: "Building 1, Market Road, Thane",
    items: [{ productId: "fish-1", quantity: 1, name: "Fresh fish", price: 100 }],
  };
  const parsed = insertOrderRequestSchema.safeParse({
    ...order,
    deliveryAddressDetail: { latitude: 19.2183, longitude: 72.9781 },
  });
  assert.equal(parsed.success, true);
  assert.equal(
    insertOrderRequestSchema.safeParse({
      ...order,
      deliveryAddressDetail: { pincode: "" },
    }).success,
    true,
  );
  assert.equal(
    insertOrderRequestSchema.safeParse({
      ...order,
      deliveryAddressDetail: { pincode: "PIN-UNKNOWN" },
    }).success,
    false,
  );
  if (parsed.success) {
    assert.deepEqual(parsed.data.deliveryAddressDetail, {
      latitude: 19.2183,
      longitude: 72.9781,
    });
  }
  assert.equal(
    insertOrderRequestSchema.safeParse({
      ...order,
      deliveryAddressDetail: { latitude: 19.2183 },
    }).success,
    false,
  );
});
