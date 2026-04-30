# 0.1.0 — first release

**Status**: shipped (2026-05-01)

The initial cut of `agent-friendly-skill`. Vendors the scorer (8 agent profiles: Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi) from upstream `agent-friendly-code`, exposes it via a tiny CLI bundled with `@vercel/ncc`, and ships a `SKILL.md` that the [`vercel-labs/skills`](https://github.com/vercel-labs/skills) CLI installs into any compatible agent. Agents outside the 8 still install and run fine — the recommendation is score-driven and provider-neutral, so the overall score and the score → model-class mapping apply regardless of which agent invoked the skill.

## What shipped

- **Vendored scorer** — `lib/scoring/` + `lib/constants/scoring.ts` from upstream copied into `src/scoring/` + `src/constants/`. Bundled to a single file with `@vercel/ncc`. 16 signals × 8 agent profiles, no network at runtime.
- **Skill runtime** — `src/index.ts` entry point (argv → cwd default, `--summary` flag, `--help`, exit code 2 on missing path). `src/format.ts` for the one-line human summary. `warnings[]` field for non-project-root cwds.
- **`SKILL.md`** — `skills/agent-friendly/SKILL.md` with frontmatter, invocation guidance, JSON parsing instructions, the score → model-class mapping table, first-invocation `SessionStart` hook nudge, and failure modes.
- **CI + release flow** — `ci.yml` (lint / typecheck / test / build / `dist/` drift check), `smoke.yml` (run the bundle against this repo's own checkout on every PR). Semver tags (`v0.1.0`) plus a floating major tag (`v0`) per the release flow in `CONTRIBUTING.md`.

## Tracking task

Upstream: [`tasks/0.5.0/03-agent-skill.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/03-agent-skill.md).
