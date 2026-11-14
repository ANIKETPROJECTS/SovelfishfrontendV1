---
name: Pieces and serves by option
description: FTW portion details must follow the selected catalog option and remain historical on orders.
---

**Rule:** For standard weight variants, use the selected variant product record. For whole fish, use the exact selected batch. For bulk portions, use the exact selected pack option. Do not fall back to parent Pieces or Serves values for whole-fish or bulk inventory. Resolve the values from the selected hub's current catalog on the trusted server and save them on the same order item Admin reads. Missing values are optional and must not block checkout.

**Why:** The user requires portion details to match the selected weight or batch and to remain unchanged on historical orders if catalog metadata is edited later.

**How to apply:** Keep the exact option identity with the selection through detail, cart, and payment payloads; have the server resolve the final values; do not change price, stock, delivery, payment, or scheduling behavior.
