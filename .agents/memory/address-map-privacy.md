---
name: Address map privacy
description: Privacy rules for customer address map-pin search
---

Map-pin lookup must use a separate public-place search field or a point the customer selects directly on the map. Never auto-geocode profile address fields or include the customer's name, phone number, flat, or apartment details in a geocoder query.

**Why:** A separate location-only query avoids sending personal contact and private delivery details to an external place-search provider.

**How to apply:** Keep map search independent from profile and checkout form values, even if the geocoder provider or address form changes.
