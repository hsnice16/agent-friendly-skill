# Changelog

All notable changes to `agent-friendly-skill` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the skill follows [Semantic Versioning](https://semver.org/).

This file is the consumer-facing log: it records what changed in each release of the skill — including changes to the **vendored scorer** (signals, weights, scoring logic) that come in from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. Anything that affects the score the skill produces, or what the skill prints, belongs here.

What does **not** belong here: pure CI / build / lint / test plumbing, dev-only refactors, or doc-only edits that don't change behaviour. Those stay in commit messages and PR descriptions.

## [0.1.1] - 2026-05-01

### Changed

- `size` signal now respects the repo's `.gitignore` in addition to the existing baseline (`node_modules`, `.git`, `vendor`, `target`, `dist`, `build`, `.next`). Local invocations no longer count files in operationally-gitignored dirs (clone workspaces, build caches, generated data), so the skill's score matches the dashboard's fresh-clone score. New runtime dep: `ignore@7.0.5`.

## [0.1.0] - 2026-05-01

### Added

- Vendored scorer from upstream `agent-friendly-code` — 16 signals (`agents_md`, `aider_conf`, `ci`, `contributing`, `cursor_rules`, `deps_manifest`, `dev_env`, `gemini_md`, `license`, `linter`, `openhands_setup`, `pre_commit`, `readme`, `size`, `tests`, `type_config`) and weight profiles for 8 models (Claude Code, Cursor, Devin, OpenHands, Gemini CLI, GPT-5 Codex, Aider, Pi). Lives under `src/scoring/`.
- Skill entrypoint (`src/index.ts`) — resolves a repo path from argv (default cwd), runs the bundled scorer, prints JSON by default or a one-line summary when `--summary` is passed. Exits with code 2 on missing path.
- `SKILL.md` at `skills/agent-friendly/SKILL.md` — frontmatter (`name: agent-friendly`) plus instructions for the agent: how to resolve the repo root, run the bundled CLI, parse the JSON, render score + recommendation, and surface the optional `SessionStart` hook on first invocation. Provider-neutral score → model mapping table embedded.
- ncc-bundled `skills/agent-friendly/dist/index.js` — single-file scorer with no runtime dependencies. CI fails the PR if `dist/` has drifted from `src/`.
- CI workflows — `ci.yml` runs lint / typecheck / tests / `ncc build` on every PR and push to `main`, and fails on `dist/` drift. `smoke.yml` runs the bundled CLI against this repo's own checkout on every PR (skipped on fork PRs).
- Biome + Lefthook tooling — `biome.json` for formatting + linting (vendored `src/scoring/` and `src/constants/` excluded), `lefthook.yml` runs biome / `tsc --noEmit` / tests / a 300-line file-length cap on every commit.
- LICENSE file (MIT) at the repo root.
- `tasks/0.1.0/` version plans documenting the v0.1.0 cut.

[0.1.1]: https://github.com/hsnice16/agent-friendly-skill/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/hsnice16/agent-friendly-skill/releases/tag/v0.1.0
