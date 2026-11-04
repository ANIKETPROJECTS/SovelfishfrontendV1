import type { Product } from "@shared/schema";

export type ProductWeightVariant = NonNullable<Product["weightVariants"]>[number];

export type VariantCartProduct = Product & {
  originalId: string;
  weightKgPerUnit: number;
};

export function asVariantCartProduct(
  product: Product,
  variant: ProductWeightVariant,
): VariantCartProduct {
  return {
    ...product,
    id: `${product.id}::${variant.weightKg}`,
    originalId: product.id,
    price: variant.price,
    originalPrice: null,
    unit: variant.label,
    netWeight: variant.label,
    weightKgPerUnit: variant.weightKg,
  } as VariantCartProduct;
}

export function formatStorePrice(price: number | null | undefined): string {
  const value = Number(price ?? 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}
