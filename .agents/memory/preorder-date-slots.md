---
name: Preorder date eligibility
description: Preorder checkout uses product schedules to choose an eligible future date, without requiring a delivery timeslot.
---

Preorder carts default to the first future date allowed by every cart product; unavailable dates are disabled. Product schedules support all dates, weekdays, and inclusive date ranges with optional weekday restrictions inside the range. Checkout does not request or require delivery timeslots. Normal delivery orders use automatic next-day scheduling after 5:00 PM Asia/Kolkata; customers do not choose a next-day toggle.

**Why:** Preorder eligibility remains product-driven. On 2026-11-13, the user requested automatic next-day scheduling for normal delivery orders while keeping preorder date selection.

**How to apply:** Preserve preorder intent on cart items added from preorder sections, normalize external-admin payloads where `type: "all"` may coexist with restrictive weekdays/date fields, show each product's friendly availability label, disable dates that fail any product schedule, send `orderType: "preorder"` with the selected `deliveryDate`, and validate current product schedules server-side. Normal delivery uses the shared 5:00 PM cutoff helper; compute and persist `deliveryDate` plus `nextDayOrder` at payment initiation, and let trusted payment finalizers reuse that frozen schedule across retries and midnight. Preserve explicit future dates, takeaway, and custom scheduled orders.