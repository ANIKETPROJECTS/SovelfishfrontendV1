export type PidgeConfig = {
  apiBaseUrl: string;
  username: string;
  password: string;
  channel?: string;
  brandCode?: string;
  brandName?: string;
  locationCode?: string;
  sender: {
    name: string;
    mobile: string;
    email?: string;
    address: {
      address_line_1: string;
      address_line_2?: string;
      label?: string;
      landmark?: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      latitude?: number;
      longitude?: number;
      instructions_to_reach?: string;
    };
  };
  poc: { name: string; mobile: string; email?: string };
};

export class PidgeError extends Error {
  constructor(
    message: string,
    readonly uncertain = false,
  ) {
    super(message);
    this.name = "PidgeError";
  }
}

let cachedToken: string | null = null;
let tokenRequest: Promise<string> | null = null;

const env = (key: string) => process.env[key]?.trim() || "";
const optionalNumber = (key: string): number | undefined => {
  const value = env(key);
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

export function readPidgeConfig(): PidgeConfig {
  const missing: string[] = [];
  const apiBaseUrl = env("PIDGE_API_BASE_URL").replace(/\/+$/, "");
  const username = env("PIDGE_USERNAME");
  const password = env("PIDGE_PASSWORD");
  const senderName = env("PIDGE_SENDER_NAME");
  const senderMobile = env("PIDGE_SENDER_MOBILE");
  const senderAddressLine1 = env("PIDGE_SENDER_ADDRESS_LINE_1");
  const senderCity = env("PIDGE_SENDER_CITY");
  const senderState = env("PIDGE_SENDER_STATE");
  const senderPincode = env("PIDGE_SENDER_PINCODE");
  const pocName = env("PIDGE_POC_NAME") || senderName;
  const pocMobile = env("PIDGE_POC_MOBILE") || senderMobile;

  if (!apiBaseUrl) missing.push("PIDGE_API_BASE_URL");
  if (!username) missing.push("PIDGE_USERNAME");
  if (!password) missing.push("PIDGE_PASSWORD");
  if (!senderName) missing.push("PIDGE_SENDER_NAME");
  if (!senderMobile) missing.push("PIDGE_SENDER_MOBILE");
  if (!senderAddressLine1) missing.push("PIDGE_SENDER_ADDRESS_LINE_1");
  if (!senderCity) missing.push("PIDGE_SENDER_CITY");
  if (!senderState) missing.push("PIDGE_SENDER_STATE");
  if (!senderPincode) missing.push("PIDGE_SENDER_PINCODE");
  if (!pocName) missing.push("PIDGE_POC_NAME");
  if (!pocMobile) missing.push("PIDGE_POC_MOBILE");

  if (missing.length) {
    throw new PidgeError(`Pidge setup is incomplete. Missing: ${missing.join(", ")}`);
  }
  try {
    if (new URL(apiBaseUrl).protocol !== "https:") {
      throw new Error("HTTPS required");
    }
  } catch {
    throw new PidgeError("PIDGE_API_BASE_URL must be a valid HTTPS URL.");
  }
  if (!/^\d{6}$/.test(senderPincode)) {
    throw new PidgeError("PIDGE_SENDER_PINCODE must be a 6-digit PIN code.");
  }

  return {
    apiBaseUrl,
    username,
    password,
    channel: env("PIDGE_CHANNEL") || "website",
    brandCode: env("PIDGE_BRAND_CODE") || undefined,
    brandName: env("PIDGE_BRAND_NAME") || undefined,
    locationCode: env("PIDGE_LOCATION_CODE") || undefined,
    sender: {
      name: senderName,
      mobile: senderMobile,
      email: env("PIDGE_SENDER_EMAIL") || undefined,
      address: {
        address_line_1: senderAddressLine1,
        address_line_2: env("PIDGE_SENDER_ADDRESS_LINE_2") || undefined,
        label: env("PIDGE_SENDER_ADDRESS_LABEL") || "Store pickup",
        landmark: env("PIDGE_SENDER_LANDMARK") || undefined,
        city: senderCity,
        state: senderState,
        country: env("PIDGE_SENDER_COUNTRY") || "India",
        pincode: senderPincode,
        latitude: optionalNumber("PIDGE_SENDER_LATITUDE"),
        longitude: optionalNumber("PIDGE_SENDER_LONGITUDE"),
        instructions_to_reach: env("PIDGE_SENDER_INSTRUCTIONS") || undefined,
      },
    },
    poc: {
      name: pocName,
      mobile: pocMobile,
      email: env("PIDGE_POC_EMAIL") || undefined,
    },
  };
}

function requiredText(value: unknown, label: string): string {
  const text = String(value ?? "").trim();
  if (!text) throw new PidgeError(`The delivery address is missing ${label}. Add it to the customer's saved address before confirming.`);
  return text;
}

function optionalCoordinates(address: Record<string, any>) {
  const latitude = Number(address.latitude);
  const longitude = Number(address.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : {};
}

export function buildPidgeCreateOrderPayload(order: Record<string, any>, config: PidgeConfig) {
  const detail = order.deliveryAddressDetail ?? {};
  const addressLine1 = [detail.building, detail.street].map((value) => String(value ?? "").trim()).filter(Boolean).join(", ");
  const receiverAddress = {
    address_line_1: requiredText(addressLine1, "building or street"),
    address_line_2: String(detail.area ?? "").trim() || undefined,
    label: String(detail.label ?? "").trim() || undefined,
    landmark: String(detail.landmark ?? "").trim() || undefined,
    city: requiredText(detail.city, "city"),
    state: requiredText(detail.state, "state"),
    country: String(detail.country ?? "").trim() || "India",
    pincode: requiredText(detail.pincode, "PIN code"),
    ...optionalCoordinates(detail),
    instructions_to_reach: String(detail.instructions ?? "").trim() || undefined,
  };
  if (!/^\d{6}$/.test(receiverAddress.pincode)) {
    throw new PidgeError("The customer's address must include a valid 6-digit PIN code.");
  }

  const sourceOrderId = String(order.orderId ?? order._id ?? "").trim();
  if (!sourceOrderId) throw new PidgeError("This order has no order number for Pidge mapping.");
  const total = Number(order.total ?? 0);
  const paymentStatus = String(order.paymentStatus ?? "").toLowerCase();
  const dueAmount = Number(
    order.dueAmount ?? (["paid", "completed"].includes(paymentStatus) ? 0 : total),
  );
  const codAmount = ["paid", "completed"].includes(paymentStatus) ? 0 : Math.max(0, dueAmount);
  const notes = [
    order.notes && { name: "Customer note", value: String(order.notes).slice(0, 500) },
    detail.instructions && { name: "Delivery instructions", value: String(detail.instructions).slice(0, 500) },
  ].filter(Boolean);

  const trip: Record<string, any> = {
    receiver_detail: {
      name: requiredText(detail.name || order.customerName, "recipient name"),
      mobile: requiredText(detail.phone || order.phone, "recipient mobile number"),
      ...(order.email ? { email: String(order.email) } : {}),
      address: receiverAddress,
    },
    source_order_id: sourceOrderId,
    reference_id: sourceOrderId,
    bill_amount: Number.isFinite(total) ? total : 0,
    cod_amount: codAmount,
    order_category: "food",
    products: (Array.isArray(order.items) ? order.items : []).map((item: any) => ({
      name: String(item.name ?? "Product"),
      sku: String(item.productId ?? ""),
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
      ...(Number(item.weightKgPerUnit) > 0
        ? { dimension: { dead_weight: Math.round(Number(item.weightKgPerUnit) * 1000) } }
        : {}),
      ...(item.imageUrl ? { image_url: String(item.imageUrl) } : {}),
    })),
  };
  if (notes.length) trip.notes = notes;
  if (order.deliveryDate) trip.delivery_date = String(order.deliveryDate);
  if (order.timeslotLabel) trip.delivery_slot = String(order.timeslotLabel);

  const payload: Record<string, any> = {
    channel: config.channel || "website",
    sender_detail: config.sender,
    poc_detail: config.poc,
    trips: [trip],
  };
  if (config.brandCode || config.locationCode || config.brandName) {
    payload.brand = {
      ...(config.brandCode ? { code: config.brandCode } : {}),
      ...(config.locationCode ? { location_code: config.locationCode } : {}),
      ...(config.brandName ? { name: config.brandName } : {}),
    };
  }
  return payload;
}

async function readJson(response: Response): Promise<any> {
  return response.json().catch(() => ({}));
}

function apiMessage(body: any, fallback: string): string {
  const message = body?.message ?? body?.data?.message ?? body?.error?.message ?? body?.error;
  return typeof message === "string" ? message.slice(0, 400) : fallback;
}

async function login(config: PidgeConfig): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/v1.0/store/channel/vendor/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: config.username, password: config.password }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new PidgeError("Could not reach Pidge login. Check the API URL and server network.");
  }
  const body = await readJson(response);
  const token = body?.data?.token;
  if (!response.ok || typeof token !== "string" || !token.trim()) {
    throw new PidgeError(`Pidge login failed: ${apiMessage(body, `HTTP ${response.status}`)}`);
  }
  cachedToken = token.trim().startsWith("Bearer ") ? token.trim() : `Bearer ${token.trim()}`;
  return cachedToken;
}

async function getToken(config: PidgeConfig, refresh = false): Promise<string> {
  if (refresh) cachedToken = null;
  if (cachedToken) return cachedToken;
  if (!tokenRequest) {
    tokenRequest = login(config).finally(() => {
      tokenRequest = null;
    });
  }
  return tokenRequest;
}

async function authorizedPost(config: PidgeConfig, path: string, payload: unknown): Promise<any> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await getToken(config, attempt > 0);
    let response: Response;
    try {
      response = await fetch(`${config.apiBaseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new PidgeError("Pidge did not return a response. Check the Pidge dashboard before retrying to avoid a duplicate delivery.", true);
    }
    const body = await readJson(response);
    if (response.status === 401 && attempt === 0) continue;
    if (!response.ok) {
      const uncertain = response.status >= 500;
      throw new PidgeError(
        `Pidge rejected the delivery request: ${apiMessage(body, `HTTP ${response.status}`)}`,
        uncertain,
      );
    }
    return body;
  }
  throw new PidgeError("Pidge authorization failed. Check the vendor credentials.");
}

export async function createPidgeDelivery(order: Record<string, any>) {
  const config = readPidgeConfig();
  const payload = buildPidgeCreateOrderPayload(order, config);
  const body = await authorizedPost(config, "/v1.0/store/channel/vendor/order", payload);
  const sourceOrderId = payload.trips[0].source_order_id;
  const pidgeOrderId = body?.data?.[sourceOrderId] ?? body?.data?.id ?? body?.id;
  if (typeof pidgeOrderId !== "string" || !pidgeOrderId.trim()) {
    throw new PidgeError("Pidge accepted the request but did not return its order ID. Check Pidge before retrying.", true);
  }
  return { pidgeOrderId: pidgeOrderId.trim() };
}

export function resetPidgeTokenForTests() {
  cachedToken = null;
  tokenRequest = null;
}
