import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Search } from "lucide-react";
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

type PhotonFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    locality?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

type SearchStatus = "idle" | "loading" | "results" | "empty" | "error";

const DEFAULT_MAP_CENTER: L.LatLngExpression = [19.2183, 72.9781];
const MIN_SEARCH_LENGTH = 3;

const selectedPinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#69D84F;border:2px solid #000035;box-shadow:0 2px 8px rgba(0,0,0,.28);transform:rotate(-45deg)"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function getResultTitle(feature: PhotonFeature): string {
  const properties = feature.properties;
  return (
    properties.name ||
    properties.street ||
    properties.locality ||
    properties.district ||
    properties.city ||
    "Nearby place"
  );
}

function getResultDetails(feature: PhotonFeature): string {
  const properties = feature.properties;
  const title = getResultTitle(feature);
  return [
    properties.street,
    properties.locality,
    properties.district,
    properties.city,
    properties.state,
    properties.country,
  ]
    .filter((part, index, parts): part is string => Boolean(part) && parts.indexOf(part) === index && part !== title)
    .join(", ");
}

export function AddressMapPicker({
  coordinates,
  onSavePin,
}: {
  coordinates?: AddressCoordinates | null;
  onSavePin: (coordinates: AddressCoordinates | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftCoordinates, setDraftCoordinates] = useState<AddressCoordinates | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PhotonFeature[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const initialCoordinatesRef = useRef<AddressCoordinates | null>(null);
  const mapElementRef = useCallback((element: HTMLDivElement | null) => {
    setMapElement(element);
  }, []);

  const placePin = useCallback((next: AddressCoordinates) => {
    setDraftCoordinates(next);
    const map = mapRef.current;
    if (!map) return;

    const position: L.LatLngExpression = [next.latitude, next.longitude];
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position, {
        icon: selectedPinIcon,
        title: "Selected delivery pin",
        keyboard: true,
      }).addTo(map);
    }
    map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
  }, []);

  const openPicker = () => {
    const initialCoordinates = getValidAddressCoordinates(coordinates);
    initialCoordinatesRef.current = initialCoordinates;
    setDraftCoordinates(initialCoordinates);
    setSearchQuery("");
    setSearchResults([]);
    setSearchStatus("idle");
    setOpen(true);
  };

  const clearPin = () => {
    setDraftCoordinates(null);
    markerRef.current?.remove();
    markerRef.current = null;
  };

  const handleResultSelect = (feature: PhotonFeature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const next = getValidAddressCoordinates({ latitude, longitude });
    if (!next) return;
    placePin(next);
    setSearchQuery("");
    setSearchResults([]);
    setSearchStatus("idle");
  };

  useEffect(() => {
    if (!open || !mapElement) return;

    const initialCoordinates = initialCoordinatesRef.current;
    const initialPosition: L.LatLngExpression = initialCoordinates
      ? [initialCoordinates.latitude, initialCoordinates.longitude]
      : DEFAULT_MAP_CENTER;
    let map: L.Map | null = null;
    setMapError(false);
    try {
      map = L.map(mapElement, {
        center: initialPosition,
        zoom: initialCoordinates ? 15 : 11,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);

      if (initialCoordinates) {
        markerRef.current = L.marker(initialPosition, {
          icon: selectedPinIcon,
          title: "Saved delivery pin",
          keyboard: true,
        }).addTo(map);
      }
    } catch (error) {
      console.error("[AddressMapPicker] Failed to initialize Leaflet map:", error);
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapError(true);
      return;
    }

    map.on("click", (event: L.LeafletMouseEvent) => {
      placePin({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    });

    const activeMap = map;
    const resizeFrame = window.requestAnimationFrame(() => activeMap.invalidateSize());
    const resizeTimer = window.setTimeout(() => activeMap.invalidateSize(), 250);
    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(resizeTimer);
      activeMap.remove();
      if (mapRef.current === activeMap) mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapElement, open, placePin]);

  useEffect(() => {
    if (!open) return;
    const query = searchQuery.trim();
    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchStatus("idle");
      return;
    }

    const controller = new AbortController();
    const searchTimer = window.setTimeout(async () => {
      setSearchStatus("loading");
      try {
        const url =
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}` +
          "&limit=6&lang=en&bbox=68.7,8.4,97.3,37.1";
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        });
        if (!response.ok) throw new Error("Place search failed");
        const data = await response.json();
        const features = Array.isArray(data.features)
          ? (data.features as PhotonFeature[]).filter((feature) => {
              const country = feature.properties?.country;
              const [longitude, latitude] = feature.geometry?.coordinates ?? [];
              return (
                (country === "India" || !country) &&
                getValidAddressCoordinates({ latitude, longitude }) !== null
              );
            })
          : [];
        setSearchResults(features);
        setSearchStatus(features.length > 0 ? "results" : "empty");
      } catch {
        if (controller.signal.aborted) return;
        setSearchResults([]);
        setSearchStatus("error");
      }
    }, 450);

    return () => {
      window.clearTimeout(searchTimer);
      controller.abort();
    };
  }, [open, searchQuery]);

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
                    Place search is unavailable. You can still tap the map to place a pin.
                  </p>
                )}
                {searchStatus === "results" &&
                  searchResults.map((feature, index) => (
                    <button
                      key={`${feature.properties.osm_id ?? "place"}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => handleResultSelect(feature)}
                      className="block w-full border-b border-border/40 px-3 py-2 text-left last:border-b-0 hover:bg-muted/50"
                    >
                      <span className="block text-sm font-medium text-foreground">
                        {getResultTitle(feature)}
                      </span>
                      {getResultDetails(feature) && (
                        <span className="block text-xs text-muted-foreground">
                          {getResultDetails(feature)}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="relative z-0 h-[42vh] min-h-[16rem] max-h-[420px] w-full overflow-hidden rounded-xl border border-border/60">
            <div
              ref={mapElementRef}
              className="h-full w-full"
              aria-label="Map for selecting a delivery pin"
            />
            {mapError && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-muted/95 px-6 text-center text-sm text-muted-foreground">
                The map could not start. Try searching for a place or close and reopen the map.
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 flex-1 text-xs text-muted-foreground" aria-live="polite">
              {draftCoordinates
                ? `Pin: ${draftCoordinates.latitude.toFixed(5)}, ${draftCoordinates.longitude.toFixed(5)}`
                : "No pin selected. Pinning the map is optional."}
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
                  onSavePin(draftCoordinates);
                  setOpen(false);
                }}
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
