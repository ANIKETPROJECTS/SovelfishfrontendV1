import assert from "node:assert/strict";
import test from "node:test";
import { getGoogleAddressParts, getIndianPostalCode } from "./googleMapsLocation";

test("accepts only six-digit Indian postal codes", () => {
  assert.equal(
    getIndianPostalCode([
      { long_name: "India", short_name: "IN", types: ["country"] },
      { long_name: "400 001", short_name: "400 001", types: ["postal_code"] },
    ]),
    "400001",
  );
  assert.equal(
    getIndianPostalCode([
      { long_name: "United States", short_name: "US", types: ["country"] },
      { long_name: "10001", short_name: "10001", types: ["postal_code"] },
    ]),
    null,
  );
  assert.equal(
    getIndianPostalCode([
      { long_name: "India", short_name: "IN", types: ["country"] },
      { long_name: "40001", short_name: "40001", types: ["postal_code"] },
    ]),
    null,
  );
});

test("extracts area, city, street, and pincode from Google address components", () => {
  assert.deepEqual(
    getGoogleAddressParts([
      { long_name: "India", short_name: "IN", types: ["country"] },
      { long_name: "400708", short_name: "400708", types: ["postal_code"] },
      { long_name: "Thane", short_name: "Thane", types: ["locality"] },
      { long_name: "Hiranandani Estate", short_name: "Hiranandani Estate", types: ["sublocality_level_1"] },
      { long_name: "Pokhran Road", short_name: "Pokhran Road", types: ["route"] },
      { long_name: "12", short_name: "12", types: ["street_number"] },
    ]),
    {
      pincode: "400708",
      area: "Hiranandani Estate",
      city: "Thane",
      street: "12, Pokhran Road",
    },
  );
});
