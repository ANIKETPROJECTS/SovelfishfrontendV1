---
name: Google Maps async loading
description: How the storefront's shared Google Maps JavaScript loader waits for the API to initialize.
---

When loading Maps JavaScript with `loading=async`, use the configured global callback to know the API is initialized before calling `google.maps.importLibrary()`. Do not treat the script element's `load` event as proof that Maps has finished bootstrapping.

**Why:** the address map rendered an initialization error because the script request completed before `google.maps.importLibrary` was available.

**How to apply:** keep a single shared loader, pass its callback in the Maps script URL, and only mark Maps ready after required libraries import successfully.

The active Replit `.replit.dev` preview hostname must also be allowed in the Maps key's HTTP referrer restrictions. A key can work on production domains and still return `RefererNotAllowedMapError` in the preview.

**Why:** the browser console showed a referrer authorization failure for the Replit preview URL even though the production site was on the allowlist.

**How to apply:** when Maps fails only in preview, add the current preview hostname to the key's website referrers in Google Cloud; keep production host entries too.
