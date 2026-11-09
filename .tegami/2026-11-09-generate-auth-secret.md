---
packages:
  "release:solstatus": patch
---

## Generate the session signing secret on alchemy.new

A one-click deploy on alchemy.new now generates `BETTER_AUTH_SECRET` when the field is empty. The registry rejects a package with a required parameter that has no default and no generate rule, so SolStatus 4.1.0 did not publish. Enter the same value on later deploys to keep existing sessions.
