---
name: Preorder date eligibility
description: Preorder checkout uses product schedules to choose an eligible future date, without requiring a delivery timeslot.
---

Preorder carts default to the first future date allowed by every cart product; unavailable dates are disabled. Product schedules support all dates, weekdays, and inclusive date ranges with optional weekday restrictions inside the range. Checkout does not request or require delivery timeslots. Normal orders use today's date automatically, with no next-day selector.

**Why:** The user requested removing timeslot selection and next-day delivery from checkout, while retaining date selection for preorder products.

**How to apply:** Preserve preorder intent on cart items added from preorder sections, normalize external-admin payloads where `type: "all"` may coexist with restrictive weekdays/date fields, show each product's friendly availability label, disable dates that fail any product schedule, send `orderType: "preorder"` with the selected `deliveryDate`, and validate current product schedules server-side. Do not couple date eligibility to configured timeslots. Keep the cart exclusive: adding one mode removes items from the other mode before adding the new item.