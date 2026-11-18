import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getValidAddressCoordinates,
  type AddressCoordinates,
} from "@shared/addressCoordinates";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import {
  createPlacesSessionToken,
  fetchPlaceSuggestions,
  fetchSelectedPlace,
  getIndianPostalCode,
  getPlaceSuggestionText,
  reverseGeocodeCoordinates,
} from "@/lib/googleMapsLocation";

type SearchStatus = "idle" | "loading" | "results" | "empty" | "error";
type LocationStatus = "idle" | "loading" | "error";

const DEFAULT_MAP_CENTER: AddressCoordinates = { latitude: 19.2183, longitude: 72.9781 };
const MIN_SEARCH_LENGTH = 3;

function createDeliveryPinContent() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">' +
    '<path d="M16 39S2 22.7 2 15.2a14 14 0 1 1 28 0C30 22.7 16 39 16 39Z" fill="#C8651B" stroke="#7B3A14" stroke-width="2"/>' +
    '<circle cx="16" cy="15" r="5" fill="#fff"/>' +
    "</svg>";
  const image = document.createElement("img");
  image.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  image.alt = "";
  image.width = 32;
  image.height = 40;
  image.draggable = false;
  image.style.display = "block";
  return image;
}

function getAdvancedMarkerCoordinates(marker: any): AddressCoordinates | null {
  const position = marker?.position;
  if (!position) return null;
  return getValidAddressCoordinates({
    latitude: typeof position.lat === "function" ? position.lat() : Number(position.lat),
    longitude: typeof position.lng === "function" ? position.lng() : Number(position.lng),
  });
}

function createDeliveryPin(
  map: any,
  position: { lat: number; lng: number },
  title: string,
  onDragEnd: (coordinates: AddressCoordinates) => void,
) {
  const marker = new window.google.maps.marker.AdvancedMarkerElement({
    map,
    position,
    title,
    gmpDraggable: true,
  });
  marker.append(createDeliveryPinContent());
  const handleDragEnd = () => {
    const coordinates = getAdvancedMarkerCoordinates(marker);
    if (coordinates) onDragEnd(coordinates);
  };
  marker.addEventListener("gmp-dragend", handleDragEnd);
  return {
    marker,
    cleanup: () => marker.removeEventListener("gmp-dragend", handleDragEnd),
  };
}

export function AddressMapPicker({
  coordinates,
  onSavePin,
  required = false,
  compact = false,
}: {
  coordinates?: AddressCoordinates | null;
  onSavePin: (coordinates: AddressCoordinates | null, pincode?: string | null) => void;
  required?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<AddressCoordinates | null>(null);
  const [draftPincode, setDraftPincode] = useState<string | null>(null);
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [pincodeLookupFailed, setPincodeLookupFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GooglePlaceSuggestion[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState("");
  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState("");
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initialCoordinatesRef = useRef<AddressCoordinates | null>(null);
  const placesSessionTokenRef = useRef<any>(null);
  const searchRequestIdRef = useRef(0);
  const reverseGeocodeRequestIdRef = useRef(0);
  const markerDragCleanupRef = useRef<(() => void) | null>(null);
  const { ready: mapsReady, error: mapsLoadError, errorMessage: mapsErrorMessage } = useGoogleMaps(open);
  const mapElementRef = useCallback((element: HTMLDivElement | null) => {
    setMapElement(element);
  }, []);

  const placePin = useCallback((next: AddressCoordinates) => {
    setDraftCoordinates(next);
    setDraftPincode(null);
    setPincodeLookupFailed(false);
    setIsLookingUpPincode(true);
    const requestId = ++reverseGeocodeRequestIdRef.current;
    const map = mapRef.current;
    const position = { lat: next.latitude, lng: next.longitude };
    if (map) {
      if (markerRef.current) {
        markerRef.current.position = position;
      } else {
        const pin = createDeliveryPin(map, position, "Selected delivery pin", placePin);
        markerRef.current = pin.marker;
        markerDragCleanupRef.current = pin.cleanup;
      }
      map.setCenter(position);
      map.setZoom(Math.max(map.getZoom() || 11, 15));
    }

    void reverseGeocodeCoordinates(next)
      .then((result) => {
        if (requestId !== reverseGeocodeRequestIdRef.current) return;
        const pincode = getIndianPostalCode(result?.addressComponents);
        setDraftPincode(pincode);
        setPincodeLookupFailed(!pincode);
      })
      .catch(() => {
        if (requestId !== reverseGeocodeRequestIdRef.current) return;
        setDraftPincode(null);
        setPincodeLookupFailed(true);
      })
      .finally(() => {
        if (requestId === reverseGeocodeRequestIdRef.current) setIsLookingUpPincode(false);
      });
  }, []);

  const useCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Location access isn't available. Tap the map to choose a spot.");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = getValidAddressCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (!next) {
          setLocationStatus("error");
          setLocationError("Couldn't get a valid location. Tap the map to choose a spot.");
          return;
        }
        placePin(next);
        setLocationStatus("idle");
      },
      (error) => {
        setLocationStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Allow location access or choose a spot on the map.");
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Couldn't find your location. Try again or tap the map.");
        } else {
          setLocationError("Location unavailable. Choose a spot on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const openPicker = () => {
    const initialCoordinates = getValidAddressCoordinates(coordinates);
    initialCoordinatesRef.current = initialCoordinates;
    setDraftCoordinates(initialCoordinates);
    setSearchQuery("");
    setSearchResults([]);
    setSearchStatus("idle");
    setDraftPincode(null);
    setIsLookingUpPincode(false);
    setPincodeLookupFailed(false);
    setMapError("");
    setLocationStatus("idle");
    setLocationError("");
    placesSessionTokenRef.current = null;
    setOpen(true);
  };

  const clearPin = () => {
    reverseGeocodeRequestIdRef.current += 1;
    setDraftCoordinates(null);
    setDraftPincode(null);
    setIsLookingUpPincode(false);
    setPincodeLookupFailed(false);
    markerDragCleanupRef.current?.();
    markerDragCleanupRef.current = null;
    if (markerRef.current) markerRef.current.map = null;
    markerRef.current = null;
  };

  const handleResultSelect = async (suggestion: GooglePlaceSuggestion) => {
    searchRequestIdRef.current += 1;
    setSearchStatus("loading");
    try {
      const place = await fetchSelectedPlace(suggestion.placePrediction);
      const latitude = typeof place.location?.lat === "function" ? place.location.lat() : place.location?.lat;
      const longitude = typeof place.location?.lng === "function" ? place.location.lng() : place.location?.lng;
      const next = getValidAddressCoordinates({ latitude, longitude });
      if (!next) throw new Error("The selected place does not have a usable map location.");
      placePin(next);
    } catch {
      setSearchStatus("error");
      return;
    }
    setSearchQuery("");
    setSearchResults([]);
    setSearchStatus("idle");
    placesSessionTokenRef.current = null;
  };

  useEffect(() => {
    if (!open || !mapElement || !mapsReady) return;

    const initialCoordinates = initialCoordinatesRef.current;
    const initialPosition = initialCoordinates
      ? { lat: initialCoordinates.latitude, lng: initialCoordinates.longitude }
      : { lat: DEFAULT_MAP_CENTER.latitude, lng: DEFAULT_MAP_CENTER.longitude };
    let map: any = null;
    setMapError("");
    try {
      map = new window.google.maps.Map(mapElement, {
        center: initialPosition,
        zoom: initialCoordinates ? 15 : 11,
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID || undefined,
        gestureHandling: "greedy",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;

      if (initialCoordinates) {
        const pin = createDeliveryPin(map, initialPosition, "Saved delivery pin", placePin);
        markerRef.current = pin.marker;
        markerDragCleanupRef.current = pin.cleanup;
      }
    } catch (error) {
      console.error("[AddressMapPicker] Failed to initialize Google Map:", error);
      if (map) window.google?.maps?.event?.clearInstanceListeners(map);
      markerDragCleanupRef.current?.();
      markerDragCleanupRef.current = null;
      if (markerRef.current) markerRef.current.map = null;
      mapRef.current = null;
      markerRef.current = null;
      setMapError("Google Maps could not start. Check the API key, billing, and enabled services.");
      return;
    }

    const mapClickListener = map.addListener("click", (event: any) => {
      const location = event.latLng;
      if (location) placePin({ latitude: location.lat(), longitude: location.lng() });
    });

    const activeMap = map;
    const resizeFrame = window.requestAnimationFrame(() => {
      window.google.maps.event.trigger(activeMap, "resize");
      activeMap.setCenter(initialPosition);
    });
    return () => {
      window.cancelAnimationFrame(resizeFrame);
      mapClickListener.remove();
      window.google.maps.event.clearInstanceListeners(activeMap);
      markerDragCleanupRef.current?.();
      markerDragCleanupRef.current = null;
      if (markerRef.current) markerRef.current.map = null;
      if (mapRef.current === activeMap) mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapElement, mapsReady, open, placePin]);

  useEffect(() => {
    if (!open) return;
    const query = searchQuery.trim();
    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchStatus(mapsLoadError ? "error" : "idle");
      if (!query) placesSessionTokenRef.current = null;
      return;
    }
    if (!mapsReady) {
      setSearchResults([]);
      setSearchStatus(mapsLoadError ? "error" : "loading");
      return;
    }
    const requestId = ++searchRequestIdRef.current;
    const searchTimer = window.setTimeout(async () => {
      setSearchStatus("loading");
      try {
        if (!placesSessionTokenRef.current) {
          placesSessionTokenRef.current = createPlacesSessionToken();
        }
        const suggestions = await fetchPlaceSuggestions(query, placesSessionTokenRef.current);
        if (requestId !== searchRequestIdRef.current) return;
        setSearchResults(suggestions);
        setSearchStatus(suggestions.length > 0 ? "results" : "empty");
      } catch {
        if (requestId !== searchRequestIdRef.current) return;
        setSearchResults([]);
        setSearchStatus("error");
      }
    }, 350);

    return () => {
      window.clearTimeout(searchTimer);
      if (searchRequestIdRef.current === requestId) searchRequestIdRef.current += 1;
    };
  }, [mapsLoadError, mapsReady, open, searchQuery]);

  return (
    <>
      <div className={compact ? "w-full" : "flex flex-wrap items-center gap-2"}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPicker}
          className={compact
            ? "h-10 w-full justify-center rounded-xl border-[#d9c1ac] bg-white px-2 text-xs font-semibold text-[#7b3a14] hover:bg-[#fff7ed] hover:text-[#7b3a14]"
            : "h-9 rounded-xl border-[#d9c1ac] bg-white px-3 text-sm font-semibold text-[#7b3a14] hover:bg-[#fff7ed] hover:text-[#7b3a14]"}
          aria-label={getValidAddressCoordinates(coordinates) ? "Edit delivery location" : "Choose delivery location"}
          aria-required={required}
          data-testid="button-address-map"
        >
          <MapPin className="mr-1.5 h-4 w-4" />
          {getValidAddressCoordinates(coordinates)
            ? compact ? "Location selected" : "Edit location"
            : compact ? "Choose location" : "Choose location"}
        </Button>
        {!compact && getValidAddressCoordinates(coordinates) && (
          <span className="text-xs font-semibold text-emerald-700">Exact location selected</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="!fixed !inset-0 !left-0 !top-0 !z-[100] !flex !h-[100dvh] !max-h-none !w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 overflow-hidden !rounded-none border-0 bg-[#fbf1e6] p-0 font-sans text-[#542813] shadow-none sm:!rounded-none [&>button:last-child]:!right-4 [&>button:last-child]:!top-4 [&>button:last-child]:!z-10 [&>button:last-child]:!bg-[#c8651b] [&>button:last-child]:hover:!bg-[#a84d12]"
        >
          <header className="footer-wood-bg shrink-0 px-5 py-5 pr-16 text-white sm:px-8 sm:py-6">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle className="flex items-center gap-2 font-display text-2xl font-bold text-white sm:text-3xl">
                <MapPin className="h-6 w-6 text-[#f0a458]" />
                Choose delivery location
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-white/85 sm:text-base">
                Tap the map to mark the exact delivery spot.
              </DialogDescription>
            </DialogHeader>
          </header>

          <div className="shrink-0 space-y-2.5 bg-[#fbf1e6] px-4 py-3 sm:px-8 sm:py-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label htmlFor="address-map-search" className="sr-only">
                Search a public place or area
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b6a53]" />
                <input
                  id="address-map-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value.slice(0, 160))}
                  placeholder="Search a public place or area"
                  autoComplete="off"
                  maxLength={160}
                  className="h-12 w-full rounded-xl border border-[#d9c1ac] bg-white pl-11 pr-4 text-sm font-medium text-[#542813] outline-none transition focus:border-[#c8651b] focus:ring-2 focus:ring-[#c8651b]/15 sm:text-base"
                  data-testid="input-address-map-search"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={useCurrentLocation}
                disabled={locationStatus === "loading"}
                className="h-12 rounded-xl border-[#d9c1ac] bg-white px-4 text-sm font-semibold text-[#7b3a14] hover:bg-[#fff7ed] hover:text-[#7b3a14]"
                data-testid="button-use-current-location"
              >
                {locationStatus === "loading" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Crosshair className="mr-2 h-4 w-4" />
                )}
                {locationStatus === "loading" ? "Finding your location…" : "Use current location"}
              </Button>
            </div>

            {locationError && (
              <p className="text-sm font-medium text-red-700" role="alert" data-testid="text-current-location-error">
                {locationError}
              </p>
            )}

            {(searchStatus === "loading" ||
              searchStatus === "results" ||
              searchStatus === "empty" ||
              searchStatus === "error") && (
              <div
                className="max-h-36 overflow-y-auto rounded-xl border border-[#e6c7a9] bg-white shadow-sm"
                role="listbox"
                aria-label="Place search results"
                aria-live="polite"
              >
                {searchStatus === "loading" && (
                  <p className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#80634e]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding places…
                  </p>
                )}
                {searchStatus === "empty" && (
                  <p className="px-4 py-3 text-sm font-medium text-[#80634e]">
                    No places found. Try another area or tap the map.
                  </p>
                )}
                {searchStatus === "error" && (
                  <p className="px-4 py-3 text-sm font-medium text-red-700" title={mapsLoadError ? mapsErrorMessage : undefined}>
                    {mapsLoadError
                      ? "Place search is unavailable. You can still tap the map."
                      : "Place search failed. You can still tap the map."}
                  </p>
                )}
                {searchStatus === "results" &&
                  searchResults.map((suggestion, index) => {
                    const placePrediction = suggestion.placePrediction;
                    const title = getPlaceSuggestionText(suggestion);
                    return (
                      <button
                        key={`${placePrediction?.placeId ?? title}-${index}`}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => void handleResultSelect(suggestion)}
                        className="block w-full border-b border-[#f0dfcf] px-4 py-3 text-left last:border-b-0 hover:bg-[#fff7ed]"
                      >
                        <span className="block text-sm font-semibold text-[#542813]">
                          {title || "Nearby place"}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="relative z-0 min-h-0 flex-1 px-3 pb-3 sm:px-6">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-[#e6c7a9] bg-[#eadfd3] sm:rounded-2xl">
              <div
                ref={mapElementRef}
                className="h-full w-full"
                aria-label="Map for choosing the exact delivery location"
              />
              {(mapError || mapsLoadError) && (
                <div
                  className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[#fbf1e6]/95 px-6 text-center text-[#542813]"
                  title={mapError || mapsErrorMessage}
                >
                  <MapPin className="mb-2 h-8 w-8 text-[#c8651b]" />
                  <p className="text-lg font-bold">Map unavailable</p>
                  <p className="mt-1 max-w-sm text-sm font-medium text-[#80634e]">
                    Check your connection or map settings, then try again.
                  </p>
                </div>
              )}
              {!mapsReady && !mapsLoadError && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#fbf1e6]/85 text-sm font-semibold text-[#80634e]">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading map…
                </div>
              )}
            </div>
          </div>

          <footer className="shrink-0 border-t border-[#e6c7a9] bg-[#fffaf4] px-4 py-3 shadow-[0_-5px_16px_rgba(76,35,13,.08)] sm:px-8 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-h-5 text-sm font-semibold text-[#7b3a14]" aria-live="polite">
                {draftCoordinates ? "Exact location selected" : "Tap the map to choose the delivery spot."}
                {isLookingUpPincode && <span className="ml-2 font-medium text-[#80634e]">Finding pincode…</span>}
                {!isLookingUpPincode && draftPincode && <span className="ml-2 text-[#80634e]">Pincode {draftPincode}</span>}
                {!isLookingUpPincode && pincodeLookupFailed && (
                  <span className="ml-2 font-medium text-[#80634e]">Enter the pincode manually.</span>
                )}
              </p>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearPin}
                  disabled={!draftCoordinates}
                  className="rounded-full px-3 text-sm font-semibold text-[#7b3a14] hover:bg-[#f3dfca] hover:text-[#7b3a14]"
                  data-testid="button-clear-map-pin"
                >
                  Clear location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-full border-[#d9c1ac] bg-white px-5 text-sm font-semibold text-[#7b3a14] hover:bg-[#fff7ed] hover:text-[#7b3a14]"
                  data-testid="button-cancel-map-pin"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    onSavePin(draftCoordinates, draftPincode);
                    setOpen(false);
                  }}
                  disabled={isLookingUpPincode || (required && !draftCoordinates)}
                  className="rounded-full bg-[#c8651b] px-5 text-sm font-bold text-white hover:bg-[#a84d12]"
                  data-testid="button-save-map-pin"
                >
                  Use this location
                </Button>
              </div>
            </div>
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
