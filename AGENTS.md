# Eve Extension Guide

## Public seam

- This repository contains only the BlitzReels Eve extension.
- The npm SDK is a dependency; its source does not belong here.
- Only this Eve source is MIT. Public npm availability does not make SDK, contracts, or CLI source open source.
- Never add CLI source, broad contracts, backend implementation, infrastructure, database logic,
  secrets, admin tooling, or customer fixtures.

## Verification

- Run `pnpm verify` before handoff.
- Keep tool schemas, approval rules, README documentation, and the published package aligned.
