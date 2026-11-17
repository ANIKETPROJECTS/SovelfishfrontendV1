---
name: Environment precedence
description: Imported ecosystem defaults must remain intact while runtime Replit Secrets override them.
---

Keep values in `ecosystem.config.cjs` for compatibility, but merge runtime environment variables after ecosystem defaults so Replit Secrets win when both define a key.

**Why:** The user needs the imported ecosystem configuration preserved while switching the active development connection to the newly configured secret.

For the storefront's Google Maps frontend key only, a non-empty project `.env` value takes precedence over a conflicting process-level value. If no `.env` value exists, keep using the process environment, including Replit Secrets.

**Why:** The production build was sending a process-level Maps key that Google rejected, while the user had verified the project `.env` value as the intended key.

**How to apply:** Keep the general environment precedence for other settings; preserve this explicit Maps-key exception and continue reporting its source without logging the key.

**How to apply:** Do not delete ecosystem entries to change general runtime behavior; adjust the launcher's merge precedence instead. Both development and production launchers must load ecosystem defaults before applying runtime environment variables.