import type { CustomerAddress } from "@shared/schema";
import type { CityAreaOption } from "@shared/cityAreaPricing";
import { getValidAddressCoordinates } from "@shared/addressCoordinates";
import { AddressMapPicker } from "@/components/storefront/AddressMapPicker";
import { SearchableCityAreaSelect } from "@/components/storefront/SearchableCityAreaSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import iconBriefcaseImg from "@assets/briefcase_1776927648499.png";
import iconHomeImg from "@assets/home_1776927604826.png";
import type { AddressCoordinates } from "@shared/addressCoordinates";

export type CustomerAddressDraft = Omit<CustomerAddress, "id">;

const TYPE_OPTIONS = [
  { value: "house" as const, icon: iconHomeImg, label: "House" },
  { value: "office" as const, icon: iconBriefcaseImg, label: "Office" },
  { value: "other" as const, icon: null, label: "Other" },
];

const inputClassName =
  "h-10 rounded-xl border-[#d9c1ac] bg-white text-sm text-[#542813] placeholder:text-[#9b806c] focus-visible:ring-[#c8651b]";

export function CustomerAddressFields({
  form,
  onChange,
  cityAreas,
  isCityAreasLoading,
  cityAreasError,
  onRetryCityAreas,
  areaSelectId,
  onMapPinChange,
}: {
  form: CustomerAddressDraft;
  onChange: (form: CustomerAddressDraft) => void;
  cityAreas: readonly CityAreaOption[];
  isCityAreasLoading: boolean;
  cityAreasError: string | null;
  onRetryCityAreas: () => void;
  areaSelectId: string;
  onMapPinChange?: (coordinates: AddressCoordinates | null) => void;
}) {
  const updateField = <K extends keyof CustomerAddressDraft>(
    field: K,
    value: CustomerAddressDraft[K],
  ) => onChange({ ...form, [field]: value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(132px,0.8fr)] items-end gap-3">
        <div className="min-w-0 space-y-1">
          <Label htmlFor={`${areaSelectId}-pincode`} className="text-xs text-[#80634e]">
            Pincode *
          </Label>
          <Input
            id={`${areaSelectId}-pincode`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={form.pincode}
            onChange={(event) =>
              updateField("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="400601"
            className={inputClassName}
            data-testid="input-address-pincode"
          />
        </div>
        <div className="min-w-0 space-y-1">
          <Label className="text-xs text-[#80634e]">Exact location *</Label>
          <AddressMapPicker
            compact
            required
            coordinates={getValidAddressCoordinates(form)}
            onSavePin={(coordinates, pincode) => {
              const next: CustomerAddressDraft = { ...form };
              delete next.latitude;
              delete next.longitude;
              onChange({
                ...next,
                ...(coordinates ?? {}),
                ...(pincode ? { pincode } : {}),
              });
              onMapPinChange?.(coordinates);
            }}
          />
        </div>
      </div>
      <p className="text-[11px] font-medium text-[#80634e]">
        Select the exact delivery spot on the map.
      </p>

      <div className="space-y-1">
        <Label htmlFor={`${areaSelectId}-name`} className="text-xs text-[#80634e]">
          Recipient name *
        </Label>
        <Input
          id={`${areaSelectId}-name`}
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Name of the person receiving the order"
          className={inputClassName}
          data-testid="input-address-name"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${areaSelectId}-phone`} className="text-xs text-[#80634e]">
          Phone *
        </Label>
        <Input
          id={`${areaSelectId}-phone`}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={form.phone}
          onChange={(event) =>
            updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="10-digit mobile number"
          className={inputClassName}
          data-testid="input-address-phone"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${areaSelectId}-building`} className="text-xs text-[#80634e]">
          Building / Flat No. *
        </Label>
        <Input
          id={`${areaSelectId}-building`}
          value={form.building}
          onChange={(event) => updateField("building", event.target.value)}
          placeholder="Wing A, Flat 302, Building Name"
          className={inputClassName}
          data-testid="input-address-building"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${areaSelectId}-street`} className="text-xs text-[#80634e]">
          Street / Locality
        </Label>
        <Input
          id={`${areaSelectId}-street`}
          value={form.street}
          onChange={(event) => updateField("street", event.target.value)}
          placeholder="Street name or society"
          className={inputClassName}
          data-testid="input-address-street"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={areaSelectId} className="text-xs text-[#80634e]">
          Area/City *
        </Label>
        {isCityAreasLoading ? (
          <p className="py-2 text-xs text-muted-foreground">Loading active areas…</p>
        ) : cityAreasError ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-red-700">{cityAreasError}</p>
            <Button type="button" size="sm" variant="outline" onClick={onRetryCityAreas}>
              Retry
            </Button>
          </div>
        ) : cityAreas.length === 0 ? (
          <p className="py-2 text-xs text-red-700">
            No active delivery areas are configured for this hub.
          </p>
        ) : (
          <SearchableCityAreaSelect
            id={areaSelectId}
            value={form.cityArea || form.area || ""}
            options={cityAreas}
            onValueChange={(value) => {
              const option = cityAreas.find((area) => area.name === value);
              onChange({
                ...form,
                area: option?.name ?? "",
                cityArea: option?.name ?? "",
                city: option?.name ?? "",
              });
            }}
            testId="select-address-area-city"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-[#80634e]">Address type *</Label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((option) => {
            const selected = form.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...form,
                    type: option.value,
                    label:
                      option.value === "house"
                        ? "Home"
                        : option.value === "office"
                          ? "Office"
                          : form.label,
                  })
                }
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 ${
                  selected ? "border-[#7b3a14] bg-[#7b3a14]" : "border-[#c8651b] bg-[#c8651b]"
                }`}
                data-testid={`button-address-type-${option.value}`}
              >
                {option.icon && (
                  <img src={option.icon} alt="" className="h-3.5 w-3.5 object-contain brightness-0 invert" />
                )}
                {option.label}
              </button>
            );
          })}
        </div>
        {form.type === "other" && (
          <Input
            value={form.label}
            onChange={(event) => updateField("label", event.target.value)}
            placeholder='Custom label (e.g. "Parents Home")'
            className={inputClassName}
            data-testid="input-address-custom-label"
          />
        )}
      </div>
    </div>
  );
}
