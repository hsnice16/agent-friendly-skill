# 0.1.12 — runs in ESM repos, hostile trees can't stall it, stricter CLI arguments

**Status**: shipped (2026-11-27)

Fixes the crash in repos whose `package.json` sets `"type": "module"` ([#4](https://github.com/hsnice16/agent-friendly-skill/pull/4)), keeps folder links and wide trees from stalling the scorer, and tightens the CLI. The full list is in [CHANGELOG.md](../../CHANGELOG.md#0112---2026-11-27).

## Impact on scores

Repos with `"type": "module"` now get a score instead of an error. Only a repo with links to folders can score differently.
