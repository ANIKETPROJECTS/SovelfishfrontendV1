export function normalizeCuttingMethods(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .filter((method): method is string => typeof method === "string")
      .map((method) => method.trim())
      .filter(Boolean),
  )];
}

export function getCartLineId(baseId: string | number, selectedMethods: unknown): string {
  const methods = normalizeCuttingMethods(selectedMethods).sort((left, right) =>
    left.localeCompare(right),
  );
  if (methods.length === 0) return String(baseId);
  return `${String(baseId)}::cutting::${encodeURIComponent(JSON.stringify(methods))}`;
}

export function isValidCuttingMethodSelection(
  selectedMethods: unknown,
  availableMethods: unknown,
): boolean {
  if (!Array.isArray(selectedMethods)) return false;
  const available = new Set(normalizeCuttingMethods(availableMethods));
  const selected = selectedMethods as unknown[];
  if (selected.some((method) => typeof method !== "string" || !method.trim())) return false;
  if (new Set(selected).size !== selected.length) return false;
  return selected.every((method) => available.has(method as string));
}
