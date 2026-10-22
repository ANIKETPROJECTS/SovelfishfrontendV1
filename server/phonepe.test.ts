import assert from "node:assert/strict";
import test from "node:test";
import { PhonePeClient } from "./phonepe";

const credentials = {
  clientId: "test-client",
  clientSecret: "test-secret",
  clientVersion: "1",
};

test("PhonePe creates checkout with an OAuth token and paise amount", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.endsWith("/v1/oauth/token")) {
      return new Response(JSON.stringify({
        access_token: "test-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }), { status: 200 });
    }
    return new Response(JSON.stringify({
      orderId: "provider-order",
      state: "PENDING",
      redirectUrl: "https://phonepe.example/checkout",
    }), { status: 200 });
  };

  const client = new PhonePeClient(credentials, fetcher);
  const checkout = await client.createPayment({
    phonepeOrderId: "FSX_1234567890_abcdef0123456789",
    amountPaise: 12345,
    redirectUrl: "https://shop.example/?phonepeOrderId=FSX_1234567890_abcdef0123456789",
  });

  assert.equal(checkout.redirectUrl, "https://phonepe.example/checkout");
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://api.phonepe.com/apis/identity-manager/v1/oauth/token");
  assert.equal(
    (calls[0].init?.headers as Record<string, string>)["Content-Type"],
    "application/x-www-form-urlencoded",
  );
  assert.equal(calls[1].url, "https://api.phonepe.com/apis/pg/checkout/v2/pay");
  assert.equal(
    (calls[1].init?.headers as Record<string, string>).Authorization,
    "O-Bearer test-access-token",
  );
  const sent = JSON.parse(String(calls[1].init?.body));
  assert.equal(sent.amount, 12345);
  assert.equal(sent.merchantOrderId, "FSX_1234567890_abcdef0123456789");
  assert.equal(sent.paymentFlow.type, "PG_CHECKOUT");
});

test("PhonePe status checks reuse the token and encode the merchant order ID", async () => {
  let authCalls = 0;
  let statusUrl = "";
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/v1/oauth/token")) {
      authCalls += 1;
      return new Response(JSON.stringify({
        access_token: "test-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }), { status: 200 });
    }
    statusUrl = url;
    return new Response(JSON.stringify({
      orderId: "provider-order",
      state: "COMPLETED",
      amount: 12345,
      paymentDetails: [{ state: "COMPLETED", transactionId: "txn-1" }],
    }), { status: 200 });
  };

  const client = new PhonePeClient(credentials, fetcher);
  const result = await client.getOrderStatus("FSX_12345_abc");
  assert.equal(result.state, "COMPLETED");
  assert.equal(authCalls, 1);
  assert.match(statusUrl, /checkout\/v2\/order\/FSX_12345_abc\/status\?details=true$/);
});
