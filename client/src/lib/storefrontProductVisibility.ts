const hiddenProductNames = new Set(["catfishegg"]);

export function isStorefrontProductVisible(product: { name?: string | null }): boolean {
  const normalizedName = (product.name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return !hiddenProductNames.has(normalizedName);
}
