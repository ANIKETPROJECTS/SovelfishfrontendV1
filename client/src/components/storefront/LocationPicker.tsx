import { useEffect, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { useHub } from "@/context/HubContext";
import { useCityArea } from "@/context/CityAreaContext";
import { findCityAreaOption } from "@shared/cityAreaPricing";
import { SearchableCityAreaSelect } from "@/components/storefront/SearchableCityAreaSelect";

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
  const {
    cityAreas,
    selectedCityArea,
    setSelectedCityArea,
    isCityAreasLoading,
    cityAreasError,
    reloadCityAreas,
  } = useCityArea();
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    if (isPickerOpen) setLocationName(selectedCityArea?.name ?? "");
  }, [isPickerOpen, selectedCityArea?.name]);

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

  const canContinue =
    Boolean(findCityAreaOption(cityAreas, locationName)) &&
    Boolean(selectedSuperHub && selectedSubHub && isHubReady);

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
        className="relative w-full max-w-sm overflow-visible rounded-3xl bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Continue browsing without selecting a location"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          data-testid="button-skip-location"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1E4]">
            <MapPin className="h-7 w-7 text-[#C8651B]" />
          </div>
        </div>

        <div className="mb-5 text-center">
          <h2 id="location-picker-title" className="mb-1 text-lg font-semibold text-slate-900">
            Select your location
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Choose your area to see local availability and prices.
          </p>
          {selectedSubHub?.name && (
            <p className="mt-1 text-xs text-slate-500">
              Delivery locations near {selectedSubHub.name}
            </p>
          )}
        </div>

        <div className="mb-5 space-y-2">
          <label htmlFor="initial-location-select" className="text-xs font-medium text-slate-700">
            Location *
          </label>
          {!isHubReady || isCityAreasLoading ? (
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm text-slate-500">
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
              onValueChange={setLocationName}
              placeholder="Choose your location"
              searchPlaceholder="Search locations..."
              className="h-11 rounded-xl"
              popoverClassName="!z-[400]"
              testId="select-initial-location"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C8651B] text-sm font-semibold text-white transition-colors hover:bg-[#A84F13] disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="button-confirm-location"
        >
          Continue
        </button>
      </section>
    </div>
  );
}
