import assert from "node:assert/strict";
import test from "node:test";
import type { CustomerAddressDraft } from "@/components/storefront/CustomerAddressFields";
import {
  normalizeCustomerAddressDraft,
  validateCustomerAddressDraft,
} from "./customerAddressForm";

const cityAreas = [{ id: "area-1", name: "Airoli", charge: 15 }];
const validDraft: CustomerAddressDraft = {
  name: "A Customer",
  phone: "9876543210",
  building: "Flat 12",
  street: "Main Road",
  area: "Airoli",
  cityArea: "Airoli",
  city: "Airoli",
  pincode: "400708",
  type: "house",
  label: "Home",
  instructions: "Call on arrival",
  latitude: 19.15,
  longitude: 73.0,
};

test("validates required address pin, contact, coordinates, and active area consistently", () => {
  const options = { cityAreas, isCityAreasLoading: false, cityAreasError: null };
  assert.equal(validateCustomerAddressDraft(validDraft, options), null);
  assert.equal(
    validateCustomerAddressDraft({ ...validDraft, pincode: "123" }, options)?.title,
    "Enter a valid 6-digit pincode",
  );
  assert.equal(
    validateCustomerAddressDraft({ ...validDraft, phone: "123" }, options)?.title,
    "Enter a valid 10-digit mobile number",
  );
  assert.equal(
    validateCustomerAddressDraft({ ...validDraft, latitude: undefined, longitude: undefined }, options)?.title,
    "Choose the exact delivery location on the map",
  );
  assert.equal(
    validateCustomerAddressDraft({ ...validDraft, cityArea: "Inactive" }, options)?.title,
    "Choose an active delivery Area/City",
  );
});

test("normalizes the active area while retaining existing address details", () => {
  const normalized = normalizeCustomerAddressDraft(
    { ...validDraft, cityArea: "airoli", label: "Home" },
    cityAreas,
  );
  assert.ok(normalized);
  assert.equal(normalized.area, "Airoli");
  assert.equal(normalized.cityArea, "Airoli");
  assert.equal(normalized.city, "Airoli");
  assert.equal(normalized.instructions, "Call on arrival");
  assert.equal(normalized.latitude, validDraft.latitude);
  assert.equal(normalized.longitude, validDraft.longitude);
});
