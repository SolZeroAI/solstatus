---
name: tegami
description: Version and publish SolStatus with Tegami. Use when adding a release note, choosing the release:none label, or changing VERSION, CHANGELOG, the publish lock, or the release workflow.
---

# Tegami

SolStatus uses Tegami for changelog entries, versioning, and publishing. The program is `scripts/tegami.mts`. It calls `tegami()`, `github()`, and `runCli` from the `tegami` package. Run that program with `nub run tegami`.

Read `docs/releasing.md` before you change a release note or the release workflow.

## Release entry

Add a Markdown file under `.tegami/` when a change has an observable effect on a deployment. Target only `"release:solstatus"`. Use `patch`, `minor`, or `major`. Write the note for the people who deploy and run SolStatus.

```md
---
packages:
  "release:solstatus": patch
---

## Fix monitor interval parsing

The CLI now rejects a check interval below 30 seconds.
```

`nub run tegami` can create the file. Keep this format.

## No observable effect

A change with no observable effect on a deployment uses the `release:none` label. Explain that choice in the pull request. Do not add a `.tegami/` file for that change.

## Files the version pull request owns

Do not edit `VERSION`, `CHANGELOG.md`, or `.tegami/publish-lock.yaml` on a feature branch. Tegami writes those files when Release runs `nub run tegami version` and `nub run tegami ci`.

## Publish path

Merging the version pull request is what publishes. Do not run a registry publish from a feature branch. Do not deploy production Cloudflare infrastructure from a feature branch.
