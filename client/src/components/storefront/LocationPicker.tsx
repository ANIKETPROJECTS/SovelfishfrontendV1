import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useHub } from "@/context/HubContext";
import { useCityArea } from "@/context/CityAreaContext";
import { useCustomer } from "@/context/CustomerContext";
import { findCityAreaOption } from "@shared/cityAreaPricing";
import { SearchableCityAreaSelect } from "@/components/storefront/SearchableCityAreaSelect";
import homeAddressPin from "@/assets/home-address-pin.png";

export function LocationPicker() {
  const {
    selectedSuperHub,
    selectedSubHub,
    isHubReady,
    isPickerOpen,
    isPickerRequired,
    setHub,
    skipPicker,
  } = useHub();
  const { customer, isLoading: isCustomerLoading } = useCustomer();
  const {
    cityAreas,
    selectedCityArea,
    setSelectedCityArea,
    isCityAreasLoading,
    cityAreasError,
    reloadCityAreas,
  } = useCityArea();
  const [locationName, setLocationName] = useState("");
  const savedLocationHandledRef = useRef(false);
  const hasUserChangedLocationRef = useRef(false);
  const savedAddressArea = useMemo(
    () => {
      for (const address of customer?.addresses ?? []) {
        for (const name of [address.cityArea, address.area, address.city]) {
          const option = findCityAreaOption(cityAreas, name);
          if (option) return option;
        }
      }
      return null;
    },
    [customer?.addresses, cityAreas],
  );
  const isCheckingSavedLocation =
    isPickerOpen &&
    isPickerRequired &&
    (isCustomerLoading ||
      (isHubReady && isCityAreasLoading) ||
      (!cityAreasError &&
        Boolean(savedAddressArea && selectedSuperHub && selectedSubHub)));

  useEffect(() => {
    if (!isPickerOpen) {
      hasUserChangedLocationRef.current = false;
      return;
    }
    if (hasUserChangedLocationRef.current) return;
    const storedName =
      selectedCityArea?.name ??
      (selectedSubHub
        ? localStorage.getItem(`freshstock_city_area:${selectedSubHub.id}`)
        : null);
    setLocationName(findCityAreaOption(cityAreas, storedName)?.name ?? "");
  }, [isPickerOpen, selectedCityArea?.name, selectedSubHub?.id, cityAreas]);

  useEffect(() => {
    if (!isPickerOpen || !isPickerRequired || savedLocationHandledRef.current) return;
    if (isCustomerLoading || !isHubReady || isCityAreasLoading) return;

    if (!cityAreasError && savedAddressArea && selectedSuperHub && selectedSubHub) {
      savedLocationHandledRef.current = true;
      setSelectedCityArea(savedAddressArea.name);
      setHub(selectedSuperHub, selectedSubHub);
    }
  }, [
    isPickerOpen,
    isPickerRequired,
    isCustomerLoading,
    isHubReady,
    isCityAreasLoading,
    cityAreasError,
    savedAddressArea,
    selectedSuperHub,
    selectedSubHub,
    setSelectedCityArea,
    setHub,
  ]);

  useEffect(() => {
    if (!isPickerOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      const savedTop = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (savedTop) window.scrollTo(0, -parseInt(savedTop, 10));
    };
  }, [isPickerOpen]);

  if (!isPickerOpen) return null;

  if (isCheckingSavedLocation && isPickerRequired) {
    return (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-[#EAD9C7] bg-white px-5 py-4 text-sm text-[#7B3A14] shadow-2xl">
          <Loader2 className="h-5 w-5 animate-spin text-[#C8651B]" />
          Checking your saved delivery location…
        </div>
      </div>
    );
  }

  const canContinue =
    Boolean(findCityAreaOption(cityAreas, locationName)) &&
    Boolean(selectedSuperHub && selectedSubHub && isHubReady);

  const handleLocationChange = (value: string) => {
    const option = findCityAreaOption(cityAreas, value);
    if (!option) return;
    hasUserChangedLocationRef.current = true;
    setLocationName(option.name);
    setSelectedCityArea(option.name);
  };

  const handleContinue = () => {
    const option = findCityAreaOption(cityAreas, locationName);
    if (!option || !selectedSuperHub || !selectedSubHub || !isHubReady) return;
    setSelectedCityArea(option.name);
    setHub(selectedSuperHub, selectedSubHub);
  };

  const handleClose = () => skipPicker();

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isPickerRequired ? undefined : handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
        className="relative w-full max-w-sm overflow-visible rounded-3xl border border-[#EAD9C7] bg-white p-6 shadow-2xl"
      >
        {!isPickerRequired && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close location picker"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#7B3A14] transition-colors hover:bg-[#FFF1E4] hover:text-[#8B3A0F]"
            data-testid="button-skip-location"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E4]">
            <img
              src={homeAddressPin}
              alt=""
              aria-hidden="true"
              className="h-[68px] w-[68px] object-contain"
            />
          </div>
        </div>

        <div className="mb-5 text-center">
          <h2 id="location-picker-title" className="mb-1 font-display text-2xl font-bold tracking-[-0.03em] text-[#7B3A14] sm:text-3xl">
            Select your location
          </h2>
          <p className="text-sm leading-relaxed text-[#6D4B37] sm:text-base">
            Choose your area to see local availability and prices.
          </p>
          {selectedSubHub?.name && (
            <p className="mt-1 text-xs font-medium text-[#8B3A0F]/80">
              Delivery locations near {selectedSubHub.name}
            </p>
          )}
        </div>

        <div className="mb-5 space-y-2">
          <label htmlFor="initial-location-select" className="text-sm font-semibold text-[#7B3A14]">
            Location *
          </label>
          {!isHubReady || isCityAreasLoading ? (
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D8B99F] text-sm text-[#7B3A14]/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available locations…
            </div>
          ) : cityAreasError ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">{cityAreasError}</p>
              <button
                type="button"
                onClick={reloadCityAreas}
                className="shrink-0 text-xs font-semibold text-[#8B3A0F] underline"
              >
                Retry
              </button>
            </div>
          ) : cityAreas.length === 0 ? (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              No active locations are available right now.
            </p>
          ) : (
            <SearchableCityAreaSelect
              id="initial-location-select"
              value={locationName}
              options={cityAreas}
              onValueChange={handleLocationChange}
              placeholder="Choose your location"
              searchPlaceholder="Search locations..."
              className="h-12 rounded-xl border-[#CDA98E] text-base font-medium text-[#7B3A14] hover:bg-[#FFF8F2] focus-visible:ring-[#C8651B]"
              popoverClassName="!z-[400]"
              testId="select-initial-location"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C8651B] text-base font-bold tracking-wide text-white transition-colors hover:bg-[#A84F13] disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="button-confirm-location"
        >
          Continue
        </button>
      </section>
    </div>
  );
}
