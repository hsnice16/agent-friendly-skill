# 0.1.4 — add Kimi CLI as the 9th scored agent

**Status**: shipped (2026-07-21)

Mirrors upstream [`e165a00`](https://github.com/hsnice16/agent-friendly-code/commit/e165a00) into the vendored scorer. Moonshot AI's Kimi Code CLI gets a weight profile, and Aider is reweighted in the same pass.

This is the first release that changes the **cardinality** of `modelScores` — every prior 0.1.x release broadened signal matching within a fixed set of 8 profiles. Consumers parsing the JSON should not assume a fixed length.

## What shipped

Vendored weights update (copied verbatim from upstream `lib/scoring/weights.ts`, modulo the documented `MODEL_BY_ID` prune in `AGENTS.md`):

- **`kimi-cli` profile added** — `modelScores` now returns 9 entries and Kimi CLI can be picked as best-fit.
  - `agents_md` **1.0** — AGENTS.md is Kimi's only instruction surface (root or `.kimi-code/AGENTS.md`). Unlike Claude Code there is no CLAUDE.md fallback, and `/init` generates one, so its absence is a harder failure than for any other profiled agent.
  - `tests` 0.9, `deps_manifest` / `dev_env` / `readme` 0.7, `type_config` 0.6, `linter` 0.6.
  - `ci` / `size` 0.4 — Kimi runs shell commands step-by-step behind an approval gate rather than in a sandbox VM, and dispatches `explore` sub-agents with isolated contexts to map a codebase, so a large tree costs it less than a single-context agent.
- **`aider` reweighted** — `aider_conf` 0.8 → 1.0, `agents_md` 0.8 → 0.3. Aider does not natively read AGENTS.md or CONVENTIONS.md; those load only when wired through `.aider.conf.yml`'s `read:` key, so the config file is what actually determines whether Aider sees repo conventions.

Rationale/source-string refreshes came along in the same upstream sync (GPT-5 Codex source URL moved to `learn.chatgpt.com`; OpenHands microagents → Skills rename). Neither is emitted by the CLI — `ModelScore` carries only `modelId`, `modelLabel`, `score`, `contributions` — so they are deliberately absent from `CHANGELOG.md`.

## Score impact

Measured on this repo:

| | 0.1.3 | 0.1.4 | Δ |
| --- | --- | --- | --- |
| `overall` | 89.7 | 90.3 | +0.6 |
| `aider` | 85.9 | 82.5 | −3.4 |
| `kimi-cli` | — | 95.5 | new |

`overall` is the mean across all profiled agents, so **every** repo's overall score moves on this release even when nothing about the repo changed. The shift is bounded by `|kimi_score − mean_of_other_8| / 9`, and Kimi's profile sits close to Claude Code's, so the numerator stays small in practice: swept across 34 local repos, the largest shift was **0.8 points** and **no repo changed band** (closest were 77.4 → 78.2 and 77.6 → 78.0, both well short of 80). Worth re-checking if a future profile lands far from the pack.

The −3.4 Aider delta matches what upstream measured on `agent-friendly-code`.

## Docs kept in step

Hard-coded agent lists/counts don't derive from `MODELS`, so they were updated by hand (per upstream's "Adding a model" step 3):

- `README.md` — "nine agents" + the 16 × 9 line.
- `AGENTS.md` — "Profiles **9 agents**" and the two "outside the 8" / "whichever of the 8" references.
- `skills/agent-friendly/SKILL.md` — the "profiles **9 agents**" line and the `// 8 more models...` comment in the JSON example.

`tasks/0.1.0/README.md` still says 8 — historical record, stays as-shipped.

## Not mirrored to the sibling in this release

`agent-friendly-action` carries the same vendored change but is released separately this time, breaking the same-version convention of 0.1.3. The major stays in lockstep (`v0`), which is what upstream's `SIBLING_VERSION` rule actually requires.

## Tracking task

Upstream: [`tasks/0.5.0/03-agent-skill.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/03-agent-skill.md).

Upstream commit: [`e165a00`](https://github.com/hsnice16/agent-friendly-code/commit/e165a00) — `feat: add Kimi CLI as the 9th scored agent`.
