export interface CityAreaOption {
  id?: string;
  name: string;
  charge: number;
}

export function normalizeCityAreaName(value: unknown): string {
  return typeof value === "string"
    ? value.normalize("NFKC").trim().toLocaleLowerCase("en-IN")
    : "";
}

export function findCityAreaOption(
  options: readonly CityAreaOption[],
  requestedName: unknown,
): CityAreaOption | null {
  const normalized = normalizeCityAreaName(requestedName);
  if (!normalized) return null;
  return options.find((option) =>
    normalizeCityAreaName(option.name) === normalized &&
    Number.isFinite(option.charge) &&
    option.charge >= 0,
  ) ?? null;
}

export function addCityAreaChargeToPrice(basePrice: number, charge: number): number {
  if (!Number.isFinite(basePrice) || basePrice < 0 || !Number.isFinite(charge) || charge < 0) {
    throw new Error("Invalid city-area pricing values.");
  }
  return basePrice + charge;
}

export function priceItemsForCityArea<
  T extends { price: number | null; basePrice?: number | null; quantity: number },
>(
  items: readonly T[],
  cityArea: CityAreaOption,
): Array<T & { basePrice: number; price: number; cityArea: string; cityAreaCharge: number }> {
  return items.map((item) => {
    const basePrice = item.basePrice == null ? item.price : item.basePrice;
    if (basePrice == null || !Number.isFinite(basePrice) || basePrice < 0) {
      throw new Error("An item has an invalid base price.");
    }
    return {
      ...item,
      basePrice,
      price: addCityAreaChargeToPrice(basePrice, cityArea.charge),
      cityArea: cityArea.name,
      cityAreaCharge: cityArea.charge,
    };
  });
}

export function sumPricedItems(
  items: readonly { price: number; quantity: number }[],
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
