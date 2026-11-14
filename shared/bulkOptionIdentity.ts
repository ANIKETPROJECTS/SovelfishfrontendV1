/**
 * Identifies an exact configured bulk-sale option. Admin-generated option IDs
 * are preferred; otherwise the option's catalog array index is used.
 */
export function getBulkOptionId(option: unknown, index: number): string {
  if (option && typeof option === "object") {
    const record = option as Record<string, unknown>;
    const rawId = record.optionId ?? record._id ?? record.id;
    if (rawId != null && String(rawId).trim()) return `id:${String(rawId).trim()}`;
  }
  return `index:${index}`;
}
