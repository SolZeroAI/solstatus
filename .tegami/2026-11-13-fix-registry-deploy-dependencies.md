---
packages:
  "release:solstatus": patch
---

## Keep deploy dependencies in the registry archive

alchemy.new deploys the published archive and does not install packages. The archive now keeps `@alchemy.run/cloudflare` for the API and the app, and `@vitejs/plugin-react` for the dashboard build. Deploy this patch of `solzero/solstatus`. No setting change is required.
