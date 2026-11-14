---
name: Product cutting choices
description: Ownership and order-shape rules for storefront cutting options.
---

FishTokri Admin owns each product's allowed cutting methods in its hub MongoDB product document. The FTW storefront reads that product's `cuttingMethods` array and stores the customer's choices as `cuttingMethods: string[]` on the matching order item.

**Why:** The storefront and Admin share the product and order records; a duplicated or hardcoded list can show invalid choices or lose selections in Admin.

**How to apply:** Load options from the selected hub's product record, validate submitted names against that record before checkout, and preserve the order-item array through payment finalization and retries.
