import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHub } from "@/context/HubContext";
import type { CityAreaOption } from "@shared/cityAreaPricing";
import { findCityAreaOption } from "@shared/cityAreaPricing";

interface CityAreaContextValue {
  cityAreas: CityAreaOption[];
  selectedCityArea: CityAreaOption | null;
  setSelectedCityArea: (name: string | null) => void;
  isCityAreasLoading: boolean;
  cityAreasError: string | null;
  reloadCityAreas: () => void;
}

const CityAreaContext = createContext<CityAreaContextValue | null>(null);

export function CityAreaProvider({ children }: { children: React.ReactNode }) {
  const { selectedSubHub, isHubReady } = useHub();
  const subHubId = selectedSubHub?.id ?? null;
  const [selection, setSelection] = useState<{ subHubId: string; name: string } | null>(null);

  const cityAreasQuery = useQuery<CityAreaOption[]>({
    queryKey: ["/api/hubs/sub", subHubId, "city-areas"],
    enabled: Boolean(isHubReady && subHubId),
    queryFn: async () => {
      const response = await fetch(`/api/hubs/sub/${encodeURIComponent(subHubId!)}/city-areas`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Could not load delivery areas.");
      }
      if (!Array.isArray(data?.options)) {
        throw new Error("Delivery-area options could not be verified.");
      }
      return data.options as CityAreaOption[];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const cityAreas = cityAreasQuery.data ?? [];

  useEffect(() => {
    if (!subHubId) {
      setSelection(null);
      return;
    }
    if (!cityAreasQuery.isSuccess) return;
    const storageKey = `freshstock_city_area:${subHubId}`;
    const cachedName = localStorage.getItem(storageKey);
    const cached = findCityAreaOption(cityAreas, cachedName);
    if (cached) {
      setSelection({ subHubId, name: cached.name });
    } else {
      localStorage.removeItem(storageKey);
      setSelection((current) => current?.subHubId === subHubId ? null : current);
    }
  }, [subHubId, cityAreasQuery.isSuccess, cityAreas]);

  const selectedCityArea = useMemo(() => {
    if (!subHubId || selection?.subHubId !== subHubId) return null;
    return findCityAreaOption(cityAreas, selection.name);
  }, [subHubId, selection, cityAreas]);

  const setSelectedCityArea = useCallback((name: string | null) => {
    if (!subHubId) return;
    const option = findCityAreaOption(cityAreas, name);
    if (!option) {
      localStorage.removeItem(`freshstock_city_area:${subHubId}`);
      setSelection((current) => current?.subHubId === subHubId ? null : current);
      return;
    }
    localStorage.setItem(`freshstock_city_area:${subHubId}`, option.name);
    setSelection({ subHubId, name: option.name });
  }, [subHubId, cityAreas]);

  return (
    <CityAreaContext.Provider value={{
      cityAreas,
      selectedCityArea,
      setSelectedCityArea,
      isCityAreasLoading: Boolean(isHubReady && subHubId && cityAreasQuery.isLoading),
      cityAreasError: cityAreasQuery.isError
        ? (cityAreasQuery.error instanceof Error ? cityAreasQuery.error.message : "Could not load delivery areas.")
        : !isHubReady || !subHubId
          ? "Choose a delivery hub to load delivery areas."
          : null,
      reloadCityAreas: () => { void cityAreasQuery.refetch(); },
    }}>
      {children}
    </CityAreaContext.Provider>
  );
}

export function useCityArea() {
  const context = useContext(CityAreaContext);
  if (!context) throw new Error("useCityArea must be used within a CityAreaProvider");
  return context;
}
