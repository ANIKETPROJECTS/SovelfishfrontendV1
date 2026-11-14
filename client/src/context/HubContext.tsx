import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { setActiveHubDb, queryClient } from "@/lib/queryClient";

export interface SuperHub {
  id: string;
  name: string;
  location: string | null;
  imageUrl: string | null;
}

export interface PincodeEntry {
  pincode: string;
  charge: number;
  timeDelay: number;
}

export interface SubHub {
  id: string;
  superHubId: string | null;
  name: string;
  location: string | null;
  imageUrl: string | null;
  dbName: string;
  pincodes: PincodeEntry[];
}

interface HubContextValue {
  selectedSuperHub: SuperHub | null;
  selectedSubHub: SubHub | null;
  isLocationSelected: boolean;
  // True once the selected hub has been loaded from cache or network and is ready
  // to supply its catalog and delivery-area configuration.
  isHubReady: boolean;
  setHub: (superHub: SuperHub, subHub: SubHub) => void;
  clearHub: () => void;
  isPickerOpen: boolean;
  isPickerRequired: boolean;
  openPicker: () => void;
  closePicker: () => void;
  skipPicker: () => void;
}

const HubContext = createContext<HubContextValue>({
  selectedSuperHub: null,
  selectedSubHub: null,
  isLocationSelected: false,
  isHubReady: false,
  setHub: () => {},
  clearHub: () => {},
  isPickerOpen: false,
  isPickerRequired: false,
  openPicker: () => {},
  closePicker: () => {},
  skipPicker: () => {},
});

const STORAGE_KEY = "fishtokri_hub";
const USER_PICKED_KEY = "fishtokri_user_picked";

const DEFAULT_SUPER_HUB_NAME = "Mumbai";
const DEFAULT_SUB_HUB_NAME = "Thane";

async function fetchDefaultHub(): Promise<{ superHub: SuperHub; subHub: SubHub } | null> {
  try {
    const superRes = await fetch("/api/hubs/super");
    if (!superRes.ok) return null;
    const superHubs: SuperHub[] = await superRes.json();
    const superHub = superHubs.find((h) => h.name === DEFAULT_SUPER_HUB_NAME) ?? superHubs[0];
    if (!superHub) return null;

    const subRes = await fetch(`/api/hubs/sub?superHubId=${superHub.id}`);
    if (!subRes.ok) return null;
    const subHubs: SubHub[] = await subRes.json();
    const subHub = subHubs.find((h) => h.name === DEFAULT_SUB_HUB_NAME) ?? subHubs[0];
    if (!subHub) return null;

    return { superHub, subHub };
  } catch {
    return null;
  }
}

export function HubProvider({ children }: { children: ReactNode }) {
  const [selectedSuperHub, setSelectedSuperHub] = useState<SuperHub | null>(null);
  const [selectedSubHub, setSelectedSubHub] = useState<SubHub | null>(null);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPickerRequired, setIsPickerRequired] = useState(false);
  const [isHubReady, setIsHubReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const userPicked = localStorage.getItem(USER_PICKED_KEY);
        if (saved && userPicked) {
          const { superHub, subHub } = JSON.parse(saved);
          // Load cached data immediately so the app renders fast
          setSelectedSuperHub(superHub);
          setSelectedSubHub(subHub);
          setIsLocationSelected(true);
          setActiveHubDb(subHub.dbName);
          // The cached hub is immediately usable; refresh its configuration below.
          setIsHubReady(true);

          // Refresh sub-hub data in the background so updated hub configuration
          // is picked up without clearing the browser cache.
          try {
            const subRes = await fetch(`/api/hubs/sub?superHubId=${superHub.id}`);
            if (subRes.ok) {
              const freshSubHubs: SubHub[] = await subRes.json();
              const freshSubHub = freshSubHubs.find((h) => h.id === subHub.id) ?? null;
              if (freshSubHub) {
                setSelectedSubHub(freshSubHub);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ superHub, subHub: freshSubHub }));
              }
            }
          } catch {}

          return; // returning user has already picked — skip forced picker
        }
      } catch {}

      const defaults = await fetchDefaultHub();
      if (defaults) {
        const { superHub, subHub } = defaults;
        setSelectedSuperHub(superHub);
        setSelectedSubHub(subHub);
        setActiveHubDb(subHub.dbName);
        setIsHubReady(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ superHub, subHub }));
        queryClient.invalidateQueries();
      }
      // Show the picker on first visit; users can dismiss it to browse without ordering.
      setIsPickerOpen(true);
      setIsPickerRequired(true);
    };

    init();
  }, []);

  const setHub = useCallback((superHub: SuperHub, subHub: SubHub) => {
    setSelectedSuperHub(superHub);
    setSelectedSubHub(subHub);
    setIsLocationSelected(true);
    setActiveHubDb(subHub.dbName);
    setIsHubReady(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ superHub, subHub }));
    localStorage.setItem(USER_PICKED_KEY, "1"); // mark user as having explicitly picked
    queryClient.invalidateQueries();
    setIsPickerOpen(false);
    setIsPickerRequired(false);
  }, []);

  const clearHub = useCallback(() => {
    setSelectedSuperHub(null);
    setSelectedSubHub(null);
    setIsLocationSelected(false);
    setActiveHubDb(null);
    setIsHubReady(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_PICKED_KEY);
    queryClient.invalidateQueries();
  }, []);

  return (
    <HubContext.Provider value={{
      selectedSuperHub, selectedSubHub, isLocationSelected, isHubReady, setHub, clearHub,
      isPickerOpen, isPickerRequired,
      openPicker: () => setIsPickerOpen(true),
      closePicker: () => { if (!isPickerRequired) setIsPickerOpen(false); },
      skipPicker: () => {
        setIsPickerOpen(false);
        setIsPickerRequired(false);
        // Remember that this visitor has handled the first-visit location prompt,
        // so a fresh browser session does not ask for it again.
        localStorage.setItem(USER_PICKED_KEY, "1");
      },
    }}>
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  return useContext(HubContext);
}
