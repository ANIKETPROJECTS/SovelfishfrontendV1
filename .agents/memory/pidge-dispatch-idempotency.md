---
name: Pidge dispatch idempotency
description: Safe retry behavior for sending confirmed storefront orders to Pidge.
---

Do not automatically retry a Pidge create-order request when the result is ambiguous. Pidge documentation says a source order ID may be repeated across requests, so it is not an idempotency key. After a timeout, 5xx, or failed save of Pidge's returned ID, mark the order for review and check Pidge before sending again.

**Why:** A second create-order request can produce a second real rider/delivery assignment for the same customer order.

**How to apply:** Any future Pidge retry, webhook, or reconciliation flow must first establish whether Pidge already created the order; only definitely rejected requests are safe for an ordinary retry.
