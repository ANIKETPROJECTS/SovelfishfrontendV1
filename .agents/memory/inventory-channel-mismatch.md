---
name: Cross-channel inventory mismatch
description: FTS and FTW must share one atomic stock field; external batches and storefront inventoryBatches are not interchangeable.
---

FTW checkout uses `inventoryBatches` when present, otherwise top-level `quantity`; it intentionally does not read the POS-managed `batches` array. Storefront availability and quantity caps must use that same checkout calculation. Adding quantities from both arrays can overstate what checkout can fulfill.

For sale presentation, POS `batches` can supply whole-fish choices only when each choice retains its batch ID, weight, rounded per-fish price, active expiry, and batch quantity. Bulk fish choices come from `bulkPortionOptions` (legacy exact weights are a fallback) and use the configured effective weight to calculate whole-rupee prices. Keep these sale details on the order, but do not decrement POS batches from the storefront; Admin remains the inventory owner until a shared atomic order flow exists.

**Why:** A displayed maximum must not encourage an order the checkout guard will reject, and separate applications can accept the same last unit when they decrement different fields.

**How to apply:** Before changing checkout or stock display, identify the canonical shared counter. Keep display, client caps, and checkout validation aligned; do not sum independent batch arrays unless they represent distinct stock and both channels decrement them atomically. For whole fish, carry the selected batch ID and validate it against the live POS batch without treating that batch array as the storefront's aggregate stock counter.