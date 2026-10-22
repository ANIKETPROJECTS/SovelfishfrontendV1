type PhonePeCredentials = {
  clientId: string;
  clientSecret: string;
  clientVersion: string;
};

type PhonePePaymentDetail = {
  transactionId?: string;
  state?: string;
  amount?: number;
};

export type PhonePeOrderStatus = {
  orderId?: string;
  state?: string;
  amount?: number;
  paymentDetails?: PhonePePaymentDetail[];
};

type PhonePeCheckoutResponse = {
  orderId?: string;
  state?: string;
  redirectUrl?: string;
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class PhonePeClient {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(
    private readonly credentials: PhonePeCredentials,
    private readonly fetcher: FetchLike = fetch,
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 30_000) {
      return this.accessToken;
    }

    const body = new URLSearchParams({
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      client_version: this.credentials.clientVersion,
      grant_type: "client_credentials",
    });
    const response = await this.fetcher(
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(10_000),
      },
    );
    const result = await response.json().catch(() => ({})) as {
      access_token?: string;
      expires_at?: number;
      expires_in?: number;
    };
    if (!response.ok || !result.access_token) {
      throw new Error(`PhonePe authentication failed (HTTP ${response.status}).`);
    }

    const expiryFromEpoch = Number(result.expires_at) * 1000;
    const expiryFromDuration = Date.now() + Number(result.expires_in ?? 1800) * 1000;
    this.accessToken = result.access_token;
    this.tokenExpiresAt =
      Number.isFinite(expiryFromEpoch) && expiryFromEpoch > Date.now()
        ? expiryFromEpoch
        : expiryFromDuration;
    return this.accessToken;
  }

  private async apiRequest<T>(url: string, init: RequestInit): Promise<T> {
    const token = await this.getAccessToken();
    const response = await this.fetcher(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
        ...init.headers,
      },
      signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json().catch(() => ({})) as T;
    if (!response.ok) {
      throw new Error(`PhonePe request failed (HTTP ${response.status}).`);
    }
    return result;
  }

  async createPayment(input: {
    phonepeOrderId: string;
    amountPaise: number;
    redirectUrl: string;
  }): Promise<PhonePeCheckoutResponse> {
    return this.apiRequest<PhonePeCheckoutResponse>(
      "https://api.phonepe.com/apis/pg/checkout/v2/pay",
      {
        method: "POST",
        body: JSON.stringify({
          merchantOrderId: input.phonepeOrderId,
          amount: input.amountPaise,
          expireAfter: 1800,
          paymentFlow: {
            type: "PG_CHECKOUT",
            merchantUrls: { redirectUrl: input.redirectUrl },
          },
        }),
      },
    );
  }

  async getOrderStatus(phonepeOrderId: string): Promise<PhonePeOrderStatus> {
    return this.apiRequest<PhonePeOrderStatus>(
      `https://api.phonepe.com/apis/pg/checkout/v2/order/${encodeURIComponent(phonepeOrderId)}/status?details=true`,
      { method: "GET" },
    );
  }
}

let liveClient: PhonePeClient | null | undefined;

export function getPhonePeClient(): PhonePeClient | null {
  if (liveClient !== undefined) return liveClient;
  const clientId = process.env.PHONEPE_LIVE_CLIENT_ID?.trim();
  const clientSecret = process.env.PHONEPE_LIVE_CLIENT_SECRET?.trim();
  const clientVersion = process.env.PHONEPE_LIVE_CLIENT_VERSION?.trim();
  liveClient = clientId && clientSecret && clientVersion
    ? new PhonePeClient({ clientId, clientSecret, clientVersion })
    : null;
  return liveClient;
}
