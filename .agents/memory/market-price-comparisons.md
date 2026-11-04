---
name: Market price comparisons
description: Product requirements for the storefront's market-style price board.
---

The market board must show actual MongoDB catalog prices in every environment, including the Replit preview. Only report movements created by admin-saved price changes. Compare the first price update in an India-local day with the prior close; compare later updates that day with the first update's price. Daily low/high and sparklines must use recorded price history only. When history is absent, show the current catalog rate with a neutral trend and no fabricated range or movement.

**Why:** The displayed preview prices did not match MongoDB catalog rates, so the client requested accurate values instead of demo market figures.

**How to apply:** Keep storefront prices, ranges, trends, and sparklines tied to the connected hub's saved catalog and price history. Show an honest neutral state when no history exists.
