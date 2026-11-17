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

function createDeliveryPinIcon() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">' +
    '<path d="M16 39S2 22.7 2 15.2a14 14 0 1 1 28 0C30 22.7 16 39 16 39Z" fill="#C8651B" stroke="#7B3A14" stroke-width="2"/>' +
    '<circle cx="16" cy="15" r="5" fill="#fff"/>' +
    "</svg>";
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(32, 40),
    anchor: new window.google.maps.Point(16, 40),
  };
}

export function AddressMapPicker({
  coordinates,
  onSavePin,
}: {
  coordinates?: AddressCoordinates | null;
  onSavePin: (coordinates: AddressCoordinates | null, pincode?: string | null) => void;
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
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new window.google.maps.Marker({
          map,
          position,
          title: "Selected delivery pin",
          draggable: true,
          icon: createDeliveryPinIcon(),
        });
        markerRef.current.addListener("dragend", () => {
          const draggedPosition = markerRef.current?.getPosition();
          if (draggedPosition) {
            placePin({ latitude: draggedPosition.lat(), longitude: draggedPosition.lng() });
          }
        });
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
      setLocationError("Your browser does not support device location.");
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
          setLocationError("The device returned an invalid location. Please try again.");
          return;
        }
        placePin(next);
        setLocationStatus("idle");
      },
      (error) => {
        setLocationStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location access was blocked. Allow location access in your browser and try again.");
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Your location could not be found in time. Please try again.");
        } else {
          setLocationError("Unable to get your location. Check your device settings and try again.");
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
    markerRef.current?.setMap(null);
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
        gestureHandling: "greedy",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;

      if (initialCoordinates) {
        markerRef.current = new window.google.maps.Marker({
          map,
          position: initialPosition,
          title: "Saved delivery pin",
          draggable: true,
          icon: createDeliveryPinIcon(),
        });
        markerRef.current.addListener("dragend", () => {
          const draggedPosition = markerRef.current?.getPosition();
          if (draggedPosition) {
            placePin({ latitude: draggedPosition.lat(), longitude: draggedPosition.lng() });
          }
        });
      }
    } catch (error) {
      console.error("[AddressMapPicker] Failed to initialize Google Map:", error);
      if (map) window.google?.maps?.event?.clearInstanceListeners(map);
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
      markerRef.current?.setMap(null);
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
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPicker}
          className="h-9 rounded-xl border-border/70 px-3 text-sm"
          aria-label={coordinates ? "Edit map pin" : "Add map pin"}
          data-testid="button-address-map"
        >
          <MapPin className="mr-1.5 h-4 w-4" />
          Map
        </Button>
        {getValidAddressCoordinates(coordinates) && (
          <span className="text-xs text-emerald-700">Pin saved</span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-3xl flex-col gap-4 overflow-y-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Set delivery pin
            </DialogTitle>
            <DialogDescription>
              Search for a public place, street, or locality—not a name, phone number, or flat number. You can also tap the map.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="address-map-search" className="sr-only">
              Search public places
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="address-map-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value.slice(0, 160))}
                placeholder="Search a place or area"
                autoComplete="off"
                maxLength={160}
                className="h-10 w-full rounded-xl border border-border/70 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
                data-testid="input-address-map-search"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={useCurrentLocation}
                disabled={locationStatus === "loading" || !mapsReady}
                className="h-9 rounded-xl border-border/70 px-3"
                data-testid="button-use-current-location"
              >
                {locationStatus === "loading" || (!mapsReady && !mapsLoadError) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Crosshair className="mr-2 h-4 w-4" />
                )}
                {locationStatus === "loading" || (!mapsReady && !mapsLoadError)
                  ? "Getting map ready…"
                  : "Use current location"}
              </Button>
            </div>
            {locationError && (
              <p className="text-sm text-destructive" role="alert" data-testid="text-current-location-error">
                {locationError}
              </p>
            )}

            {(searchStatus === "loading" ||
              searchStatus === "results" ||
              searchStatus === "empty" ||
              searchStatus === "error") && (
              <div
                className="max-h-28 overflow-y-auto rounded-xl border border-border/60 bg-white"
                role="listbox"
                aria-label="Place search results"
                aria-live="polite"
              >
                {searchStatus === "loading" && (
                  <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching places…
                  </p>
                )}
                {searchStatus === "empty" && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No places found. Try a nearby area or tap the map.
                  </p>
                )}
                {searchStatus === "error" && (
                  <p className="px-3 py-2 text-sm text-destructive">
                    {mapsLoadError
                      ? mapsErrorMessage
                      : "Google Places search or place details are unavailable. Check that Places API (New) is enabled for this key. You can still tap the map."}
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
                      className="block w-full border-b border-border/40 px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                    >
                      <span className="block text-sm font-medium text-foreground">
                        {title || "Nearby place"}
                      </span>
                    </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="relative z-0 h-[42vh] min-h-[16rem] max-h-[420px] w-full overflow-hidden rounded-xl border border-border/60">
            <div
              ref={mapElementRef}
              className="h-full w-full"
              aria-label="Map for selecting a delivery pin"
            />
            {(mapError || mapsLoadError) && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-muted/95 px-6 text-center text-sm text-muted-foreground">
                {mapError || mapsErrorMessage}
              </div>
            )}
            {!mapsReady && !mapsLoadError && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Google Maps…
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 flex-1 text-xs text-muted-foreground" aria-live="polite">
              {draftCoordinates
                ? `Pin: ${draftCoordinates.latitude.toFixed(5)}, ${draftCoordinates.longitude.toFixed(5)}`
                : "No pin selected. Pinning the map is optional."}
              {isLookingUpPincode && <span className="ml-2">Checking pincode…</span>}
              {!isLookingUpPincode && draftPincode && <span className="ml-2">Pincode found: {draftPincode}</span>}
              {!isLookingUpPincode && pincodeLookupFailed && (
                <span className="ml-2">No pincode found; you can enter it manually.</span>
              )}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={clearPin}
                disabled={!draftCoordinates}
                className="rounded-xl"
                data-testid="button-clear-map-pin"
              >
                Clear pin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl"
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
                disabled={isLookingUpPincode}
                className="rounded-xl"
                data-testid="button-save-map-pin"
              >
                Save pin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
