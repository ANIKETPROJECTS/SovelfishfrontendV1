export function normalizeCuttingMethods(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .filter((method): method is string => typeof method === "string")
      .map((method) => method.trim())
      .filter(Boolean),
  )];
}

export function getCartLineId(
  baseId: string | number,
  selectedMethods: unknown,
  details?: { pieces?: unknown; serves?: unknown },
): string {
  const methods = normalizeCuttingMethods(selectedMethods).sort((left, right) =>
    left.localeCompare(right),
  );
  let lineId = methods.length === 0
    ? String(baseId)
    : `${String(baseId)}::cutting::${encodeURIComponent(JSON.stringify(methods))}`;
  const pieces = typeof details?.pieces === "string" ? details.pieces.trim() : "";
  const serves = typeof details?.serves === "string" ? details.serves.trim() : "";
  if (pieces || serves) {
    lineId += `::meal::${encodeURIComponent(JSON.stringify([pieces || null, serves || null]))}`;
  }
  return lineId;
}

export function isValidCuttingMethodSelection(
  selectedMethods: unknown,
  availableMethods: unknown,
): boolean {
  if (!Array.isArray(selectedMethods)) return false;
  const allowedMethods = normalizeCuttingMethods(availableMethods);
  if (allowedMethods.length === 0) return selectedMethods.length === 0;
  if (selectedMethods.length !== 1) return false;
  const available = new Set(allowedMethods);
  const selected = selectedMethods as unknown[];
  if (selected.some((method) => typeof method !== "string" || !method.trim())) return false;
  return selected.every((method) => available.has(method as string));
}
