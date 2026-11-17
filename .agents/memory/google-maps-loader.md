---
name: Google Maps async loading
description: How the storefront's shared Google Maps JavaScript loader waits for the API to initialize.
---

When loading Maps JavaScript with `loading=async`, use the configured global callback to know the API is initialized before calling `google.maps.importLibrary()`. Do not treat the script element's `load` event as proof that Maps has finished bootstrapping.

**Why:** the address map rendered an initialization error because the script request completed before `google.maps.importLibrary` was available.

**How to apply:** keep a single shared loader, pass its callback in the Maps script URL, and only mark Maps ready after required libraries import successfully.
