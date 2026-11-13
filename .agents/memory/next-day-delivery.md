---
name: Automatic next-day delivery
description: The server-owned 5 PM India-time cutoff and payment-safe persistence for normal storefront deliveries.
---

For normal delivery orders, the cutoff is 5:00 PM Asia/Kolkata. At and after the cutoff, persist tomorrow's `deliveryDate` and `nextDayOrder: true`; before it, keep today's date and a false flag. Keep preorder, takeaway, custom scheduled orders, and explicit future dates unchanged. Show the expected date in checkout without a customer-facing toggle.

**Why:** The user requested this automatic scheduling on 2026-11-13 and requires the existing Admin Orders page to classify the same FTW order by its persisted date. Payment can finish after the cutoff or midnight, so recalculating during callbacks could move an order away from the date the customer saw when payment began.

**How to apply:** Normalize the schedule on the server at payment initiation and at trusted non-payment order creation. Persist both fields on the shared order document and in the pending checkout payload. Trusted payment callbacks/retries must reuse that stored date and flag rather than recalculate. Keep calendar calculations in `Asia/Kolkata`, refresh the checkout message when its time boundary passes or the page regains focus, and do not test by placing a real delivery order.
