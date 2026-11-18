---
name: Automatic next-day delivery
description: The server-owned 5 PM India-time cutoff and payment-safe persistence for normal storefront deliveries.
---

For normal delivery orders, the cutoff is 5:00 PM Asia/Kolkata. Before the cutoff, customers may choose same-day (default) or next-day delivery; an explicit next-day choice persists tomorrow's `deliveryDate` and `nextDayOrder: true`. At and after the cutoff, force tomorrow's date and lock out same-day delivery. Keep preorder, takeaway, custom scheduled orders, and explicit future dates unchanged.

**Why:** The user requires the existing Admin Orders page to classify the same FTW order by its persisted date, and the storefront prompt specifies an optional next-day choice before the cutoff plus automatic next-day scheduling afterward. Payment can finish after the cutoff or midnight, so recalculating during callbacks could move an order away from the date the customer saw when payment began.

**How to apply:** Persist the customer's pre-cutoff choice with the cart session and show its date in the cart. Normalize the schedule on the server at payment initiation and at trusted non-payment order creation. Persist both fields on the shared order document and in the pending checkout payload. Trusted payment callbacks/retries must reuse that stored date and flag rather than recalculate. Keep calendar calculations in `Asia/Kolkata`, refresh checkout state when its time boundary passes or the page regains focus, and do not test by placing a real delivery order.
