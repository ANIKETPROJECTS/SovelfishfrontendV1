import type { CustomerAddress } from "@shared/schema";
import {
  findCityAreaOption,
  type CityAreaOption,
} from "@shared/cityAreaPricing";
import { getValidAddressCoordinates } from "@shared/addressCoordinates";
import type { CustomerAddressDraft } from "@/components/storefront/CustomerAddressFields";

export type AddressFormError = {
  title: string;
  description?: string;
};

export function validateCustomerAddressDraft(
  form: CustomerAddressDraft,
  options: {
    cityAreas: readonly CityAreaOption[];
    isCityAreasLoading: boolean;
    cityAreasError: string | null;
  },
): AddressFormError | null {
  if (
    !form.name.trim() ||
    !form.phone.trim() ||
    !form.building.trim() ||
    !form.pincode.trim() ||
    !(form.cityArea || form.area).trim()
  ) {
    return { title: "Please fill all required fields" };
  }
  if (!/^\d{6}$/.test(form.pincode)) {
    return { title: "Enter a valid 6-digit pincode" };
  }
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    return { title: "Enter a valid 10-digit mobile number" };
  }
  if (!getValidAddressCoordinates(form)) {
    return { title: "Choose the exact delivery location on the map" };
  }
  if (
    options.isCityAreasLoading ||
    options.cityAreasError ||
    !findCityAreaOption(options.cityAreas, form.cityArea || form.area)
  ) {
    return {
      title: "Choose an active delivery Area/City",
      description: options.cityAreasError ?? "Select an area from the available list.",
    };
  }
  return null;
}

export function normalizeCustomerAddressDraft(
  form: CustomerAddressDraft,
  cityAreas: readonly CityAreaOption[],
): Omit<CustomerAddress, "id"> | null {
  const activeArea = findCityAreaOption(cityAreas, form.cityArea || form.area);
  if (!activeArea) return null;

  return {
    ...form,
    name: form.name.trim(),
    phone: form.phone.trim(),
    building: form.building.trim(),
    street: form.street.trim(),
    area: activeArea.name,
    cityArea: activeArea.name,
    city: activeArea.name,
    label:
      form.type === "other"
        ? form.label.trim() || "Other"
        : form.type === "house"
          ? "Home"
          : "Office",
  };
}
