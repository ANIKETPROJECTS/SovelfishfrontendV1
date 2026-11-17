import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
    __freshStockGoogleMapsReady?: () => void;
  }
}

const SCRIPT_ID = "google-maps-js";
type MapsStatus = "loading" | "ready" | "error";
type MapsState = { status: MapsStatus; error: string };

const INITIAL_STATE: MapsState = { status: "loading", error: "" };
let state = INITIAL_STATE;
let loadPromise: Promise<boolean> | null = null;
const listeners = new Set<(next: MapsState) => void>();

function getSafeDiagnostics() {
  const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  let scriptOrigin: string | null = null;
  let scriptHasKey = false;
  if (script?.src) {
    try {
      const scriptUrl = new URL(script.src);
      scriptOrigin = scriptUrl.origin;
      scriptHasKey = scriptUrl.searchParams.has("key");
    } catch {
      // Do not include the raw script URL; it can contain the public API key.
    }
  }
  return {
    pageOrigin: window.location.origin,
    buildMode: import.meta.env.MODE,
    keyConfigured: Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()),
    keySource: import.meta.env.VITE_GOOGLE_MAPS_KEY_SOURCE || "unknown",
    scriptOrigin,
    scriptHasKey,
    googleMapsGlobalAvailable: Boolean(window.google?.maps),
    importLibraryAvailable: typeof window.google?.maps?.importLibrary === "function",
  };
}

function logDiagnostics(message: string, details: Record<string, unknown> = {}) {
  console.info("[GoogleMaps diagnostics]", message, {
    ...getSafeDiagnostics(),
    ...details,
  });
}

function getSafeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/([?&]key=)[^&\s]+/gi, "$1[redacted]");
}

function notify(next: MapsState) {
  state = next;
  listeners.forEach((listener) => listener(next));
}

if (typeof window !== "undefined") {
  window.gm_authFailure = () => {
    console.error(
      "[GoogleMaps diagnostics] Google invoked gm_authFailure. Check the Google Maps API error immediately above this log; this diagnostic intentionally does not print the API key.",
      getSafeDiagnostics(),
    );
    notify({
      status: "error",
      error: "Google Maps authorization failed. Check the key’s website restrictions, billing, and enabled APIs.",
    });
  };
}

async function importRequiredLibraries(): Promise<boolean> {
  try {
    if (!window.google?.maps?.importLibrary) {
      throw new Error("Google Maps initialized without exposing importLibrary.");
    }
    const libraries = ["maps", "places", "geocoding"];
    logDiagnostics("Importing required Google Maps libraries.", { libraries });
    await Promise.all(
      libraries.map((library) =>
        window.google.maps
          .importLibrary(library)
          .then(() => logDiagnostics("Google Maps library loaded.", { library }))
          .catch((error: unknown) => {
            console.error("[GoogleMaps diagnostics] Library import failed.", {
              ...getSafeDiagnostics(),
              library,
              error: getSafeErrorMessage(error),
            });
            throw error;
          }),
      ),
    );
    return true;
  } catch (error) {
    const message = getSafeErrorMessage(error) || "A required Google Maps library could not load.";
    console.error("[GoogleMaps diagnostics] Maps initialization failed.", {
      ...getSafeDiagnostics(),
      error: message,
    });
    notify({ status: "error", error: message });
    return false;
  }
}

function loadMaps(): Promise<boolean> {
  if (state.status === "ready") return Promise.resolve(true);
  if (state.status === "error") return Promise.resolve(false);
  if (loadPromise) return loadPromise;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    const error = "Google Maps is not configured. The frontend build is missing VITE_GOOGLE_MAPS_API_KEY.";
    console.error("[GoogleMaps diagnostics] No API key is configured for this frontend build.", {
      ...getSafeDiagnostics(),
      expectedVariable: "VITE_GOOGLE_MAPS_API_KEY",
    });
    notify({ status: "error", error });
    return Promise.resolve(false);
  }

  loadPromise = new Promise<boolean>((resolve) => {
    logDiagnostics("Starting Google Maps JavaScript API request.", {
      expectedVariable: "VITE_GOOGLE_MAPS_API_KEY",
      requestedLibraries: ["maps", "places", "geocoding"],
      apiKeyValueLogged: false,
    });
    const finish = async (loaded: boolean) => {
      if (!loaded) {
        const error = "Google Maps could not load. Check the network, API restrictions, billing, and enabled services.";
        console.error("[GoogleMaps diagnostics] Google Maps script request failed.", {
          ...getSafeDiagnostics(),
          error,
        });
        notify({ status: "error", error });
        resolve(false);
        return;
      }
      const imported = await importRequiredLibraries();
      if (!imported) {
        resolve(false);
        return;
      }
      window.setTimeout(() => {
        if (state.status === "error") {
          resolve(false);
          return;
        }
        notify({ status: "ready", error: "" });
        resolve(true);
      }, 300);
    };

    if (window.google?.maps?.importLibrary) {
      void finish(true);
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      console.error("[GoogleMaps diagnostics] Timed out waiting for the Google Maps ready callback.", {
        ...getSafeDiagnostics(),
      });
      notify({
        status: "error",
        error: "Google Maps timed out while loading. Check network access, API restrictions, and enabled services.",
      });
      resolve(false);
    }, 15000);
    const finishScriptLoad = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      void finish(loaded);
    };
    window.__freshStockGoogleMapsReady = () => {
      logDiagnostics("Google Maps ready callback fired.");
      finishScriptLoad(true);
    };
    script.async = true;
    script.defer = true;
    script.id = SCRIPT_ID;
    const params = new URLSearchParams({
      key,
      v: "weekly",
      loading: "async",
      callback: "__freshStockGoogleMapsReady",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.addEventListener(
      "error",
      (event) => {
        console.error("[GoogleMaps diagnostics] Maps JavaScript script element emitted an error.", {
          ...getSafeDiagnostics(),
          eventType: event.type,
        });
        finishScriptLoad(false);
      },
      { once: true },
    );
    if (!existingScript) document.head.appendChild(script);
  });

  return loadPromise;
}

export function waitForMapsReady(timeoutMs = 15000): Promise<boolean> {
  if (state.status === "ready") return Promise.resolve(true);
  if (state.status === "error") return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    const timeout = window.setTimeout(() => resolve(false), timeoutMs);
    loadMaps().then((ready) => {
      window.clearTimeout(timeout);
      resolve(ready);
    });
  });
}

export function useGoogleMaps(enabled = true): { ready: boolean; error: boolean; errorMessage: string } {
  const [localState, setLocalState] = useState<MapsState>(() => state);

  useEffect(() => {
    const listener = (next: MapsState) => setLocalState(next);
    listeners.add(listener);
    setLocalState(state);
    if (enabled) void loadMaps();
    return () => {
      listeners.delete(listener);
    };
  }, [enabled]);

  return {
    ready: localState.status === "ready",
    error: localState.status === "error",
    errorMessage: localState.error,
  };
}
