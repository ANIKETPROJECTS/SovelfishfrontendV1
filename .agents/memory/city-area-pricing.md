---
name: City-area delivery pricing
description: Source of truth for how active subhub areas affect catalog prices and checkout totals.
---

Use only active entries from the selected subhub's `city_areas` collection. The configured area charge is added to each cart unit, multiplied by quantity, and retained separately from the item's base price for order transparency. Pincodes continue to determine serviceability, but do not add delivery charges. Keep the delivery fee at zero; any instant-slot surcharge remains separate.

**Why:** Hub-specific area charges must not be replaced by a pincode fee or differ across payment methods.

**How to apply:** Recalculate area pricing from the active subhub configuration before COD or payment initiation. Store the normalized area, base price, and per-unit charge with the order. Trusted payment finalizers must reuse the normalized pending checkout rather than recomputing against possibly changed area configuration.
