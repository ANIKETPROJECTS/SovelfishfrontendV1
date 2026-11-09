export type AddressCoordinates = {
  latitude: number;
  longitude: number;
};

export function getValidAddressCoordinates(value: unknown): AddressCoordinates | null {
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as Record<string, unknown>;
  const { latitude, longitude } = candidate;
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function hasAddressCoordinateFields(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.latitude !== undefined || candidate.longitude !== undefined;
}
