import type { Product } from "@shared/schema";

export type ProductWeightVariant = NonNullable<Product["weightVariants"]>[number];

export type VariantCartProduct = Product & {
  originalId: string;
  weightKgPerUnit?: number;
  weightMinKgPerUnit?: number;
  weightMaxKgPerUnit?: number;
  fishBatchId?: string;
  fishWeightKg?: number;
  fishBatchAvailableQty?: number;
};

export function getProductVariantKey(variant: ProductWeightVariant): string {
  return variant.batchId
    ? `fish:${variant.batchId}`
    : `portion:${variant.weightKg}:${variant.minWeightKg ?? ""}:${variant.maxWeightKg ?? ""}`;
}

export function asVariantCartProduct(
  product: Product,
  variant: ProductWeightVariant,
): VariantCartProduct {
  const isWholeFish = variant.saleType === "whole_fish" && Boolean(variant.batchId);
  const optionKey = `${product.id}::${getProductVariantKey(variant)}`;
  return {
    ...product,
    id: optionKey,
    originalId: product.id,
    price: variant.price,
    originalPrice: null,
    unit: variant.averageWeightLabel
      ? `${variant.label} (avg. ${variant.averageWeightLabel})`
      : variant.label,
    weightKgPerUnit: isWholeFish ? undefined : variant.weightKg,
    weightMinKgPerUnit: isWholeFish ? undefined : variant.minWeightKg ?? undefined,
    weightMaxKgPerUnit: isWholeFish ? undefined : variant.maxWeightKg ?? undefined,
    fishBatchId: isWholeFish ? variant.batchId! : undefined,
    fishWeightKg: isWholeFish ? variant.weightKg : undefined,
    fishBatchAvailableQty: isWholeFish ? variant.availableQuantity : undefined,
  } as VariantCartProduct;
}

export function formatProductWeight(
  value: string | number | null | undefined,
  kind: "gross" | "net",
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (/\b(gross|net)\b/i.test(raw)) return raw;
  const hasUnit = /\b(kg|g|gm|gms|gram|grams|ml|l)\b/i.test(raw);
  return `${raw}${hasUnit ? "" : " gm"} ${kind}`;
}

export function formatStorePrice(price: number | null | undefined): string {
  const value = Number(price ?? 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}
