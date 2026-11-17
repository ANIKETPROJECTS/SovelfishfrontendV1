import type { AddressCoordinates } from "@shared/addressCoordinates";

export type GooglePlaceSuggestion = {
  placePrediction?: {
    text?: { toString: () => string };
    toPlace: () => any;
  };
};

export type GoogleReverseGeocodeResult = {
  formattedAddress: string;
  addressComponents: GoogleAddressComponent[];
};

export type GoogleAddressComponent = {
    long_name?: string;
    short_name?: string;
    longText?: string;
    shortText?: string;
    types: string[];
};

export function createPlacesSessionToken(): any {
  return new window.google.maps.places.AutocompleteSessionToken();
}

export async function fetchPlaceSuggestions(
  input: string,
  sessionToken: any,
): Promise<GooglePlaceSuggestion[]> {
  const { AutocompleteSuggestion } = await window.google.maps.importLibrary("places");
  const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    language: "en",
    includedRegionCodes: ["in"],
    sessionToken,
  });
  return response.suggestions ?? [];
}

export async function fetchSelectedPlace(prediction: GooglePlaceSuggestion["placePrediction"]) {
  if (!prediction) throw new Error("Select a suggested place.");
  const place = prediction.toPlace();
  await place.fetchFields({
    fields: ["location", "formattedAddress", "addressComponents", "displayName"],
  });
  return place;
}

export async function reverseGeocodeCoordinates(
  coordinates: AddressCoordinates,
): Promise<GoogleReverseGeocodeResult | null> {
  const { Geocoder } = await window.google.maps.importLibrary("geocoding");
  const response = await new Geocoder().geocode({
    location: { lat: coordinates.latitude, lng: coordinates.longitude },
  });
  const result = response.results?.[0];
  if (!result) return null;
  return {
    formattedAddress: result.formatted_address ?? "",
    addressComponents: result.address_components ?? [],
  };
}

export function getIndianPostalCode(
  components: GoogleAddressComponent[] | undefined,
): string | null {
  if (!components) return null;
  const isIndia = components.some(
    (component) =>
      component.types.includes("country") &&
      (component.short_name ?? component.shortText) === "IN",
  );
  if (!isIndia) return null;

  const rawPostalCode = components.find((component) =>
    component.types.includes("postal_code"),
  );
  const postalCode = rawPostalCode?.long_name ?? rawPostalCode?.longText;
  const digits = postalCode?.replace(/\D/g, "") ?? "";
  return /^\d{6}$/.test(digits) ? digits : null;
}

export function getGoogleAddressParts(
  components: GoogleAddressComponent[],
) {
  const find = (...types: string[]) => {
    for (const type of types) {
      const component = components.find((candidate) => candidate.types.includes(type));
      const value = component?.long_name ?? component?.longText;
      if (value) return value;
    }
    return "";
  };

  return {
    pincode: getIndianPostalCode(components) ?? "",
    area:
      find("sublocality_level_1", "sublocality", "neighborhood", "locality") ||
      find("administrative_area_level_3", "administrative_area_level_2"),
    city: find("locality", "administrative_area_level_2", "administrative_area_level_1"),
    street: [find("street_number"), find("route")].filter(Boolean).join(", "),
  };
}

export function getPlaceSuggestionText(suggestion: GooglePlaceSuggestion): string {
  return suggestion.placePrediction?.text?.toString() ?? "";
}
