import { getBulkOptionId } from "../shared/bulkOptionIdentity";

type ProductOptionDetailsResult = {
  items: any[];
  error: string | null;
};

const cleanText = (value: unknown): string | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text || null;
};

function isWholeFish(product: any): boolean {
  return String(product.fishInventoryMode ?? "").toLowerCase() === "whole_fish" ||
    product.wholeFishInventory === true;
}

function isBulkPortions(product: any): boolean {
  return String(product.fishInventoryMode ?? "").toLowerCase() === "bulk_portions" ||
    (Array.isArray(product.bulkPortionOptions) && product.bulkPortionOptions.length > 0) ||
    (Array.isArray(product.bulkPortionWeightsKg) && product.bulkPortionWeightsKg.length > 0);
}

function getConfiguredBulkOptions(product: any): any[] {
  return Array.isArray(product.bulkPortionOptions) && product.bulkPortionOptions.length > 0
    ? product.bulkPortionOptions
    : (product.bulkPortionWeightsKg ?? []).map((weightKg: unknown) => ({ weightKg }));
}

function bulkOptionMatchesWeight(option: any, item: any): boolean {
  const minWeightKg = option?.minWeightKg == null ? null : Number(option.minWeightKg);
  const maxWeightKg = option?.maxWeightKg == null ? null : Number(option.maxWeightKg);
  const hasRange = minWeightKg != null && maxWeightKg != null &&
    Number.isFinite(minWeightKg) && Number.isFinite(maxWeightKg) &&
    Math.abs(minWeightKg - maxWeightKg) > 0.000001;
  const configuredWeightKg = option?.weightKg == null
    ? minWeightKg != null && maxWeightKg != null
      ? (minWeightKg + maxWeightKg) / 2
      : Number.NaN
    : Number(option.weightKg);
  const weightKg = Number.isFinite(configuredWeightKg)
    ? Math.round(configuredWeightKg * 1000) / 1000
    : Number.NaN;
  const sameWeight = Number.isFinite(weightKg) &&
    Math.abs(weightKg - Number(item.weightKgPerUnit)) < 0.000001;
  const expectedMin = hasRange ? minWeightKg : null;
  const expectedMax = hasRange ? maxWeightKg : null;
  const sameMin = expectedMin == null
    ? item.weightMinKgPerUnit == null
    : item.weightMinKgPerUnit != null &&
      Math.abs(expectedMin - Number(item.weightMinKgPerUnit)) < 0.000001;
  const sameMax = expectedMax == null
    ? item.weightMaxKgPerUnit == null
    : item.weightMaxKgPerUnit != null &&
      Math.abs(expectedMax - Number(item.weightMaxKgPerUnit)) < 0.000001;
  return sameWeight && sameMin && sameMax;
}

/**
 * Enriches order items using the selected hub's current catalog. Values from the
 * browser are never used as the saved snapshot; they only help identify an
 * ambiguous legacy bulk option when no stable option ID was available.
 */
export function resolveOrderItemOptionDetails(
  items: any[],
  products: any[],
  combos: any[] = [],
): ProductOptionDetailsResult {
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const combosById = new Map(combos.map((combo) => [String(combo._id), combo]));

  const resolvedItems: any[] = [];
  for (const item of items) {
    const product = productsById.get(String(item.productId));
    if (!product) {
      const combo = combosById.get(String(item.productId));
      resolvedItems.push({
        ...item,
        pieces: null,
        serves: cleanText(combo?.serves),
        inventoryBatchId: null,
        batchNumber: null,
        bulkOptionId: null,
      });
      continue;
    }

    if (isWholeFish(product)) {
      const selectedBatchId = String(item.fishBatchId ?? "").trim();
      const batch = (product.batches ?? []).find((entry: any) =>
        String(entry?._id ?? entry?.batchId ?? "") === selectedBatchId,
      );
      if (!selectedBatchId || !batch) {
        return {
          items,
          error: `The selected fish batch for "${product.name}" is no longer available. Please choose another weight.`,
        };
      }
      const currentPieces = cleanText(batch.pieces);
      const currentServes = cleanText(batch.serves);
      const batchId = String(batch._id ?? batch.batchId);
      resolvedItems.push({
        ...item,
        fishBatchId: batchId,
        inventoryBatchId: batchId,
        batchNumber: cleanText(batch.batchNumber),
        pieces: currentPieces,
        serves: currentServes,
        bulkOptionId: null,
      });
      continue;
    }

    if (isBulkPortions(product)) {
      const options = getConfiguredBulkOptions(product);
      const weightMatches = options
        .map((option, index) => ({ option, index, optionId: getBulkOptionId(option, index) }))
        .filter(({ option }) => bulkOptionMatchesWeight(option, item));
      const matches = weightMatches.filter(({ optionId }) =>
        !item.bulkOptionId || optionId === String(item.bulkOptionId),
      );
      if (matches.length === 0) {
        return {
          items,
          error: `The selected weight for "${product.name}" is no longer available. Please refresh and choose it again.`,
        };
      }

      let selectedOption = matches.length === 1 ? matches[0] : null;
      if (!selectedOption) {
        const submittedPieces = cleanText(item.pieces);
        const submittedServes = cleanText(item.serves);
        const matchingMetadata = matches.filter(({ option }) =>
          cleanText(option.pieces) === submittedPieces &&
          cleanText(option.serves) === submittedServes,
        );
        if (matchingMetadata.length === 1) selectedOption = matchingMetadata[0];
        else {
          const firstPieces = cleanText(matches[0].option.pieces);
          const firstServes = cleanText(matches[0].option.serves);
          if (matches.every(({ option }) =>
            cleanText(option.pieces) === firstPieces &&
            cleanText(option.serves) === firstServes,
          )) selectedOption = matches[0];
        }
      }

      resolvedItems.push({
        ...item,
        bulkOptionId: selectedOption?.optionId ?? item.bulkOptionId ?? null,
        pieces: cleanText(selectedOption?.option.pieces),
        serves: cleanText(selectedOption?.option.serves),
        inventoryBatchId: null,
        batchNumber: null,
      });
      continue;
    }

    const currentPieces = cleanText(product.pieces);
    const currentServes = cleanText(product.serves);
    resolvedItems.push({
      ...item,
      pieces: currentPieces,
      serves: currentServes,
      inventoryBatchId: null,
      batchNumber: null,
      bulkOptionId: null,
    });
  }

  return { items: resolvedItems, error: null };
}
