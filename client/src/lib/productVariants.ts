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
  bulkOptionId?: string;
  batchNumber?: string | null;
};

export function getProductVariantKey(variant: ProductWeightVariant): string {
  return variant.batchId
    ? `fish:${variant.batchId}`
    : variant.optionId
      ? `bulk:${variant.optionId}`
    : `portion:${variant.weightKg}:${variant.minWeightKg ?? ""}:${variant.maxWeightKg ?? ""}`;
}

export function getLegacyProductVariantKey(variant: ProductWeightVariant): string {
  return variant.batchId
    ? `fish:${variant.batchId}`
    : `portion:${variant.weightKg}:${variant.minWeightKg ?? ""}:${variant.maxWeightKg ?? ""}`;
}

export function asVariantCartProduct(
  product: Product,
  variant: ProductWeightVariant,
): VariantCartProduct {
  const isWholeFish = variant.saleType === "whole_fish" && Boolean(variant.batchId);
  const isOptionInventory = variant.saleType === "whole_fish" || variant.saleType === "bulk_portion" ||
    product.fishInventoryMode === "whole_fish" ||
    product.fishInventoryMode === "bulk_portions" ||
    product.wholeFishInventory === true;
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
    bulkOptionId: variant.saleType === "bulk_portion" ? variant.optionId ?? undefined : undefined,
    batchNumber: isWholeFish ? variant.batchNumber ?? null : null,
    pieces: isOptionInventory ? variant.pieces ?? null : variant.pieces ?? product.pieces,
    serves: isOptionInventory ? variant.serves ?? null : variant.serves ?? product.serves,
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

export function formatProductMetadataValue(
  value: string | number | null | undefined,
  label: "Pieces" | "Serves",
): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const withoutPrefix = label === "Pieces"
    ? text.replace(/^pieces\s*:?\s*/i, "").trim()
    : text.replace(/^serves?\s*:?\s*/i, "").trim();
  const formatted = label === "Pieces"
    ? withoutPrefix.replace(/\\s+pieces?$/i, "").trim()
    : withoutPrefix.replace(/\\s+serves?$/i, "").trim();
  return formatted || null;
}
