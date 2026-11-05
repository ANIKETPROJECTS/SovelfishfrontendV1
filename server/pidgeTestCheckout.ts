export function normalizePidgeTestPhone(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "").slice(-10);
}

export function isPidgeTestCustomer(configuredPhone: unknown, sessionPhone: unknown): boolean {
  const configured = normalizePidgeTestPhone(configuredPhone);
  return configured.length === 10 && normalizePidgeTestPhone(sessionPhone) === configured;
}

export type PidgeTestOrderValidation = {
  configuredPhone: unknown;
  sessionPhone: unknown;
  orderPhone: unknown;
  itemCount: number;
  itemQuantity: number;
  paymentCount: number;
  hasPaymentReference: boolean;
  hasCoupon: boolean;
  discount: number;
  walletAmountUsed: number;
  productIsPidgeTestProduct: boolean;
  productIsArchived: boolean;
  productStatus: unknown;
  productPrice: number;
  itemPrice: number;
};

export function getPidgeTestOrderRejection(input: PidgeTestOrderValidation): {
  status: 400 | 403;
  message: string;
} | null {
  const configuredPhone = normalizePidgeTestPhone(input.configuredPhone);
  if (
    configuredPhone.length !== 10 ||
    !isPidgeTestCustomer(configuredPhone, input.sessionPhone) ||
    normalizePidgeTestPhone(input.orderPhone) !== configuredPhone
  ) {
    return {
      status: 403,
      message: "Pidge test checkout is only available to the configured test account.",
    };
  }
  if (input.itemCount !== 1 || input.itemQuantity !== 1) {
    return {
      status: 400,
      message: "A Pidge test order must contain exactly one test item.",
    };
  }
  if (
    input.paymentCount > 0 ||
    input.hasPaymentReference ||
    input.hasCoupon ||
    input.discount > 0 ||
    input.walletAmountUsed > 0
  ) {
    return {
      status: 400,
      message: "Pidge test orders cannot include payment, wallet, or coupon details.",
    };
  }
  if (
    !input.productIsPidgeTestProduct ||
    input.productIsArchived ||
    input.productStatus === "unavailable" ||
    input.productPrice !== 1 ||
    input.itemPrice !== 1
  ) {
    return {
      status: 400,
      message: "Only the active ₹1 Pidge test product can use test checkout.",
    };
  }
  return null;
}
