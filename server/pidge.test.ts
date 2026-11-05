import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
  buildPidgeCreateOrderPayload,
  createPidgeDelivery,
  readPidgeConfig,
  resetPidgeTokenForTests,
  type PidgeConfig,
} from "./pidge";

const config: PidgeConfig = {
  apiBaseUrl: "https://pidge.example",
  username: "test-user",
  password: "test-password",
  channel: "website",
  brandCode: "FSX",
  locationCode: "Airoli",
  sender: {
    name: "Fresh Stock Xchange",
    mobile: "9619590694",
    address: {
      address_line_1: "Store, Sector 6",
      city: "Navi Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400708",
    },
  },
  poc: { name: "Support", mobile: "9619590694" },
};

const order = {
  _id: "mongo-id",
  orderId: "FSX-123",
  customerName: "Customer",
  phone: "9876543210",
  email: "customer@example.com",
  address: "Flat 2, Main Road, Airoli",
  deliveryAddressDetail: {
    name: "Customer",
    phone: "9876543210",
    building: "Flat 2",
    street: "Main Road",
    area: "Airoli",
    landmark: "Near station",
    city: "Navi Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400708",
    instructions: "Call on arrival",
  },
  items: [{ productId: "fish-1", name: "Surmai", quantity: 2, price: 450, weightKgPerUnit: 0.5 }],
  total: 920,
  dueAmount: 920,
  paymentStatus: "unpaid",
  deliveryDate: "2026-11-06",
};

test("maps the saved checkout address and order into Pidge's trip format", () => {
  const payload = buildPidgeCreateOrderPayload(order, config);
  const trip = payload.trips[0];

  assert.equal(payload.channel, "website");
  assert.deepEqual(payload.brand, { code: "FSX", location_code: "Airoli" });
  assert.equal(trip.source_order_id, "FSX-123");
  assert.equal(trip.receiver_detail.address.address_line_1, "Flat 2, Main Road");
  assert.equal(trip.receiver_detail.address.city, "Navi Mumbai");
  assert.equal(trip.receiver_detail.address.landmark, "Near station");
  assert.equal(trip.cod_amount, 920);
  assert.equal(trip.products[0].dimension.dead_weight, 500);
  assert.equal(trip.delivery_date, "2026-11-06");
});

test("does not set cash collection for an already-paid order", () => {
  const payload = buildPidgeCreateOrderPayload(
    { ...order, paymentStatus: "paid", dueAmount: 0 },
    config,
  );
  assert.equal(payload.trips[0].cod_amount, 0);
});

test("rejects a customer address without Pidge-required city or state", () => {
  assert.throws(
    () => buildPidgeCreateOrderPayload({
      ...order,
      deliveryAddressDetail: { ...order.deliveryAddressDetail, city: "" },
    }, config),
    /missing city/i,
  );
});

test("uses Pidge's production host by default when no override is set", () => {
  const keys = [
    "PIDGE_API_BASE_URL", "PIDGE_USERNAME", "PIDGE_PASSWORD", "PIDGE_SENDER_NAME",
    "PIDGE_SENDER_MOBILE", "PIDGE_SENDER_ADDRESS_LINE_1", "PIDGE_SENDER_CITY",
    "PIDGE_SENDER_STATE", "PIDGE_SENDER_PINCODE",
  ];
  const originalValues = new Map(keys.map((key) => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    Object.assign(process.env, {
      PIDGE_USERNAME: "test-user",
      PIDGE_PASSWORD: "test-password",
      PIDGE_SENDER_NAME: "Fresh Stock Xchange",
      PIDGE_SENDER_MOBILE: "9619590694",
      PIDGE_SENDER_ADDRESS_LINE_1: "Store, Sector 6",
      PIDGE_SENDER_CITY: "Navi Mumbai",
      PIDGE_SENDER_STATE: "Maharashtra",
      PIDGE_SENDER_PINCODE: "400708",
    });
    assert.equal(readPidgeConfig().apiBaseUrl, "https://api.pidge.in");
  } finally {
    for (const key of keys) {
      const original = originalValues.get(key);
      if (original === undefined) delete process.env[key];
      else process.env[key] = original;
    }
  }
});

test("logs in and submits exactly one delivery trip", async () => {
  const keys = [
    "PIDGE_API_BASE_URL", "PIDGE_USERNAME", "PIDGE_PASSWORD",
    "PIDGE_SENDER_NAME", "PIDGE_SENDER_MOBILE", "PIDGE_SENDER_ADDRESS_LINE_1",
    "PIDGE_SENDER_CITY", "PIDGE_SENDER_STATE", "PIDGE_SENDER_PINCODE",
    "PIDGE_CHANNEL", "PIDGE_BRAND_CODE", "PIDGE_LOCATION_CODE", "PIDGE_POC_NAME",
    "PIDGE_POC_MOBILE",
  ];
  const originalValues = new Map(keys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  try {
    Object.assign(process.env, {
      PIDGE_API_BASE_URL: config.apiBaseUrl,
      PIDGE_USERNAME: config.username,
      PIDGE_PASSWORD: config.password,
      PIDGE_SENDER_NAME: config.sender.name,
      PIDGE_SENDER_MOBILE: config.sender.mobile,
      PIDGE_SENDER_ADDRESS_LINE_1: config.sender.address.address_line_1,
      PIDGE_SENDER_CITY: config.sender.address.city,
      PIDGE_SENDER_STATE: config.sender.address.state,
      PIDGE_SENDER_PINCODE: config.sender.address.pincode,
      PIDGE_CHANNEL: "website",
      PIDGE_BRAND_CODE: "FSX",
      PIDGE_LOCATION_CODE: "Airoli",
      PIDGE_POC_NAME: "Support",
      PIDGE_POC_MOBILE: "9619590694",
    });
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.endsWith("/vendor/login")) {
        return new Response(JSON.stringify({ data: { token: "Bearer test-token" } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: { "FSX-123": "pidge-order-1" } }), { status: 200 });
    }) as typeof fetch;

    resetPidgeTokenForTests();
    const result = await createPidgeDelivery(order);
    assert.equal(result.pidgeOrderId, "pidge-order-1");
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /vendor\/login$/);
    assert.match(calls[1].url, /vendor\/order$/);
    assert.equal(new Headers(calls[1].init?.headers).get("authorization"), "Bearer test-token");
    assert.equal(JSON.parse(String(calls[1].init?.body)).trips.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of keys) {
      const original = originalValues.get(key);
      if (original === undefined) delete process.env[key];
      else process.env[key] = original;
    }
    resetPidgeTokenForTests();
  }
});

after(() => resetPidgeTokenForTests());
