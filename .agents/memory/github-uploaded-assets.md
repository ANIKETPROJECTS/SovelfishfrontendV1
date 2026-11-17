---
name: GitHub uploaded assets
description: Project policy for tracking uploaded files and protecting credentials.
---

Keep user-uploaded project attachments available to GitHub, using Git LFS for large images, videos, and document binaries. Keep attachment-only reference files out of deployments when the app does not serve them.

Never include `.env` files or pasted console/server logs that may contain credentials. A diagnostic attachment matched a possible API-key pattern, so pasted text logs stay excluded until they are reviewed and safely redacted.

**Why:** the user asked for every uploaded attachment to be included with future GitHub pushes, while protecting credentials from accidental publication.

**How to apply:** preserve Git ignore protections for environment files and pasted logs, use Git LFS for large binaries, and avoid committing or pushing externally unless the user asks.
