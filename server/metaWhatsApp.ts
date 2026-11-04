export type MetaWhatsAppOtpOptions = {
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  otp: string;
  templateName: string;
  languageCode: string;
  apiVersion?: string;
  fetcher?: typeof fetch;
};

export type MetaWhatsAppSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; status: number; errorCode?: number; errorSubcode?: number };

export async function sendMetaWhatsAppOtp({
  accessToken,
  phoneNumberId,
  recipientPhone,
  otp,
  templateName,
  languageCode,
  apiVersion = "v26.0",
  fetcher = fetch,
}: MetaWhatsAppOtpOptions): Promise<MetaWhatsAppSendResult> {
  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    throw new Error("Invalid Meta Graph API version.");
  }

  const response = await fetcher(
    `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: otp }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: otp }],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    let errorCode: number | undefined;
    let errorSubcode: number | undefined;
    try {
      const payload = await response.json() as {
        error?: { code?: number; error_subcode?: number };
      };
      errorCode = payload.error?.code;
      errorSubcode = payload.error?.error_subcode;
    } catch {
      // Do not log or return raw provider response bodies.
    }
    return { ok: false, status: response.status, errorCode, errorSubcode };
  }

  let messageId: string | undefined;
  try {
    const payload = await response.json() as { messages?: Array<{ id?: string }> };
    messageId = payload.messages?.[0]?.id;
  } catch {
    // A successful HTTP response is enough if Meta omits a JSON message ID.
  }

  return { ok: true, messageId };
}
