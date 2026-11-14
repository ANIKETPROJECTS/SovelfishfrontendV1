---
name: Product cutting choices
description: Ownership and order-shape rules for storefront cutting options.
---

FishTokri Admin owns each product's allowed cutting methods in its hub MongoDB product document. If a product has configured methods, FTW requires exactly one and stores it as a one-element `cuttingMethods: string[]` on the matching order item. Products with no configured methods need no selection.

**Why:** The user clarified that cutting is required and single-choice; a duplicated or hardcoded list can still show invalid choices or lose selections in Admin.

**How to apply:** Load options from the selected hub's product record, require and validate exactly one name when options exist, and preserve the order-item array through payment finalization and retries.
