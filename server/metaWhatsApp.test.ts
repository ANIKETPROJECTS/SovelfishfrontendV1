import assert from "node:assert/strict";
import test from "node:test";
import { sendMetaWhatsAppOtp } from "./metaWhatsApp";

test("sends the OTP using the approved copy-code authentication template", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;

  const result = await sendMetaWhatsAppOtp({
    accessToken: "test-access-token",
    phoneNumberId: "123456789",
    recipientPhone: "919876543210",
    otp: "123456",
    templateName: "fsx_otp_website",
    languageCode: "en_US",
    fetcher: async (input, init) => {
      requestUrl = String(input);
      requestInit = init;
      return new Response(JSON.stringify({ messages: [{ id: "wamid.test" }] }), { status: 200 });
    },
  });

  assert.equal(requestUrl, "https://graph.facebook.com/v26.0/123456789/messages");
  assert.equal(requestInit?.method, "POST");
  assert.equal(new Headers(requestInit?.headers).get("authorization"), "Bearer test-access-token");
  assert.equal(new Headers(requestInit?.headers).get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "919876543210",
    type: "template",
    template: {
      name: "fsx_otp_website",
      language: { code: "en_US" },
      components: [
        { type: "body", parameters: [{ type: "text", text: "123456" }] },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: "123456" }],
        },
      ],
    },
  });
  assert.deepEqual(result, { ok: true, messageId: "wamid.test" });
});

test("returns a provider failure status without exposing its response body", async () => {
  const result = await sendMetaWhatsAppOtp({
    accessToken: "test-access-token",
    phoneNumberId: "123456789",
    recipientPhone: "919876543210",
    otp: "123456",
    templateName: "fsx_otp_website",
    languageCode: "en_US",
    fetcher: async () => new Response(JSON.stringify({
      error: { message: "sensitive provider error body", code: 100, error_subcode: 33 },
    }), { status: 400 }),
  });

  assert.deepEqual(result, { ok: false, status: 400, errorCode: 100, errorSubcode: 33 });
});
