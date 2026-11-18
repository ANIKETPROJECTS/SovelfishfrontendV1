import { normalizePreorderMode } from "./productVisibility";
import { isPreorderDateAvailable } from "./preorderAvailability";

export type PreorderOrderItem = {
  productId: string;
  name?: string | null;
};

export type PreorderOrderProduct = {
  _id: string | { toString(): string };
  name?: string;
  preorderMode?: unknown;
  preOrderMode?: unknown;
  preorderAvailability?: unknown;
  isArchived?: boolean;
  status?: string;
};

export type PreorderOrderInput = {
  orderType?: string | null;
  deliveryType?: string | null;
  deliveryDate?: string | null;
  items?: PreorderOrderItem[];
};

function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Apply the customer-facing order-mode rules against products read from the
 * selected hub's database. Product names, order type, and dates from the
 * browser are never treated as proof of preorder eligibility.
 */
export function validatePreorderOrderInput(
  input: PreorderOrderInput,
  products: PreorderOrderProduct[],
  todayKey: string,
): string | null {
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const items = input.items ?? [];

  if (input.orderType === "preorder") {
    if (input.deliveryType !== "delivery") {
      return "Preorder orders are available for delivery only.";
    }
    if (!isValidDateKey(input.deliveryDate) || !isValidDateKey(todayKey) || input.deliveryDate <= todayKey) {
      return "Preorder delivery must be scheduled for a valid future date.";
    }
    if (items.length === 0) return "A preorder must contain at least one product.";

    for (const item of items) {
      const product = productsById.get(String(item.productId));
      if (!product) {
        return `Product "${item.name || item.productId}" is not available for preorder.`;
      }
      const mode = normalizePreorderMode(product.preorderMode ?? product.preOrderMode);
      if (mode !== "preorder_only") {
        return `"${product.name ?? item.name ?? "This product"}" is not marked as preorder-only.`;
      }
      if (product.isArchived || product.status === "unavailable") {
        return `"${product.name ?? item.name ?? "This product"}" is not currently available.`;
      }
      if (!isPreorderDateAvailable(input.deliveryDate, product.preorderAvailability)) {
        return `"${product.name ?? item.name ?? "This product"}" is not available on ${input.deliveryDate}.`;
      }
    }
    return null;
  }

  for (const item of items) {
    const product = productsById.get(String(item.productId));
    if (product && normalizePreorderMode(product.preorderMode ?? product.preOrderMode) === "preorder_only") {
      return `"${product.name ?? item.name ?? "This product"}" must be ordered through Preorder.`;
    }
  }
  return null;
}
