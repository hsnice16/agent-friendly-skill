# AGENTS.md

Instructions for AI coding agents working on `agent-friendly-skill`.

## What this project is

A portable agent skill — installable via `npx skills add hsnice16/agent-friendly-skill` into any [`vercel-labs/skills`](https://github.com/vercel-labs/skills)-compatible agent — that scores the user's current repo locally and recommends a model class. Profiles **8 agents** (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi) — the same set the upstream [Agent Friendly Code](https://github.com/hsnice16/agent-friendly-code) dashboard scores against. Agents outside the 8 (Cline, Copilot, Continue, Roo Code, …) still install and run fine — the recommendation is score-driven and provider-neutral, so the overall score and the score → model-class mapping apply regardless of which agent invoked the skill. Their own profile isn't computed; the best-fit shown is whichever of the 8 profiled agents scored highest against the repo. Self-contained: the scorer is vendored into `skills/agent-friendly/dist/` so the skill keeps working independently of the upstream web app.

Companion to the [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code) web app and the [agent-friendly-action](https://github.com/hsnice16/agent-friendly-action) GitHub Action. The skill is read-only (local stdout); the web app is the source of truth for the leaderboard and the canonical scorer; the action posts PR-diff comments.

## Stack

- **Node ≥ 20.9.0** runtime — matches `engines.node`. Bundle is built against Node 20.
- **TypeScript** — strict mode.
- **`@vercel/ncc`** — bundles `src/index.ts` + scorer into a single `skills/agent-friendly/dist/index.js`. That bundle is what `npx skills add` ships to consumers.
- **Biome** — formatter + linter. Config at `biome.json` (lineWidth 120, parent-aligned). Vendored `src/scoring/` and `src/constants/` are excluded — upstream owns their style.
- **Lefthook** — git pre-commit hooks run Biome / `tsc --noEmit` / tests / a 300-line file-length cap on `src/**/*.ts`.

## Layout

```text
SKILL.md ↔ skills/agent-friendly/SKILL.md   # Skill content. The vercel-labs/skills CLI installs this directory.
skills/agent-friendly/
  SKILL.md              # frontmatter + body (instructions to the agent)
  dist/
    index.js            # ncc-bundled scorer (committed — this is what gets installed)
src/
  index.ts              # entry point — argv parsing + orchestration
  format.ts             # one-line summary formatter for --summary
  scoring/              # vendored from upstream lib/scoring/ (do not reformat — sync rule below)
  constants/            # vendored from upstream lib/constants/scoring.ts
tests/
  format.test.ts
biome.json              # formatter + linter config
lefthook.yml            # pre-commit jobs (biome, typecheck, test, file-length)
package.json            # private; build / typecheck / test scripts
tasks/
  0.1.0/                # version plans (per-task files + README)
CHANGELOG.md            # consumer-facing release log
LICENSE                 # MIT
```

## Build + dev loop

```bash
npm install
npm run prepare-hooks   # once — installs lefthook git hooks
npm run typecheck
npm test
npm run build           # ncc → skills/agent-friendly/dist/index.js
npm run format          # biome check --write (full repo)
npm run lint            # biome check (read-only)
```

`skills/agent-friendly/dist/` is **committed**. CI verifies it's in sync on every push so what `npx skills add` ships always matches the source.

## Conventions

- **Exact-pinned deps** in `package.json` (no `^`, no `latest`). Mirrors the upstream rule — deterministic builds, reproducible bundles.
- **File length**: `src/**/*.ts` stays ≤ 300 lines. Enforced by the lefthook `file-length` job.
- **No comments** explaining _what_ the code does. Only _why_.
- **Vendored code is exempt** from this repo's biome config (see `biome.json`'s ignore list). Do not run `npm run format` against `src/scoring/` or `src/constants/`.

## Why `skills/agent-friendly/SKILL.md` and not root SKILL.md?

The `vercel-labs/skills` CLI installs the **directory containing SKILL.md**. If SKILL.md lived at repo root, every sibling file (package.json, src/, tests/, node_modules/, …) would be copied into the user's agent skill directory on `npx skills add`. By scoping the SKILL.md to a subdirectory, only the things consumers actually need (SKILL.md + the bundled scorer in `dist/`) ship.

The CLI's repo-layout discovery supports both — `skills/<name>/SKILL.md` is one of several documented layouts. See <https://github.com/vercel-labs/skills>.

## Versioning

> **Two kinds of tags, don't confuse them:**
>
> - **Precise** (e.g. `v0.1.0`) — immutable. Points at exactly one commit, forever.
> - **Floating** (e.g. `v0`) — mutable. The number after `v` is the **major version**, not "release N". `v0` always points at the latest 0.x.y release.

Semver tags with a major-version floating tag:

- Each release gets a precise tag: `v0.1.0`, `v0.2.0`, …, `v1.0.0`, `v1.1.0`, …
- The floating tag tracks the latest release within a single major version.
- Consumers pin a tag using the `vercel-labs/skills` CLI's `#<ref>` fragment syntax (**not** `@<ref>`, which the CLI reserves for skill-name filters). `npx skills add hsnice16/agent-friendly-skill#v0` floats on the latest 0.x.y; `#v0.1.0` pins precisely. Tags + branches both work; commit SHAs don't (the CLI clones with `--branch <ref>`).

Every release tag must be reflected in [`CHANGELOG.md`](./CHANGELOG.md). Move the relevant bullets out of `## [Unreleased]` into a new dated version section as part of the release commit.

**This skill's version is independent from upstream `agent-friendly-code`.** When docs or task plans link a `tasks/0.5.0/...` path on upstream (e.g. the tracking task), the `0.5.0` is **upstream's milestone**, not this skill's version. This skill is at `0.1.3`; pin it with `#v0.1.3` (precise) or `#v0` (floating major).

The CLI's git-ref support is implemented in [`vercel-labs/skills/src/source-parser.ts`](https://github.com/vercel-labs/skills/blob/main/src/source-parser.ts) (`parseFragmentRef`) and [`src/git.ts`](https://github.com/vercel-labs/skills/blob/main/src/git.ts) (clones with `--branch <ref>`). Verified — but undocumented in their README, so worth re-checking on a CLI upgrade.

## Self-containment rule

The skill must keep working with no network access to the [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code) web app. Bundle whatever scoring code is required. The web app is **not** contacted at runtime.

## Vendored scorer (sync rule)

`src/scoring/` and `src/constants/` are vendored copies of `lib/scoring/` and `lib/constants/scoring.ts` from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. There is no automatic sync — when upstream changes a signal, weight, or `scorer.ts` shape, those changes are copied here by hand and logged under `## [Unreleased]` in `CHANGELOG.md`.

Upstream's [`AGENTS.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/AGENTS.md) (under "Sibling repos") owns the propagation rule — agents working over there are instructed to mirror their scorer changes into this repo **and** into `agent-friendly-action`. If you find drift, the upstream is the source of truth — **except** for the deliberate prunes listed below.

**Local prunes from upstream** (intentional, do not re-add on sync):

- `src/constants/scoring.ts` — only `SCORE_THRESHOLD_MID`, `SCORE_THRESHOLD_GOOD`, and `DEFAULT_SUGGESTION_LIMIT` are kept. Upstream's `LEADERBOARD_PAGE_SIZE`, `LEADERBOARD_PAGE_SIZE_MOBILE`, and `STRENGTHS_GAPS_VISIBLE_LIMIT` are dashboard-UI-only and not used by the skill.
- `src/scoring/weights.ts` — `MODEL_BY_ID` (a `Record<ModelId, ModelProfile>`) is dropped; the skill iterates `MODELS` and never indexes by id, and ncc does not tree-shake the eager `Object.fromEntries` call.

When syncing upstream changes, copy the substantive change (new signal, weight tweak, scoring-logic edit) and re-apply these prunes on top.

Extracting the scorer to a standalone npm package (`agent-friendly-scorer`) is on the upstream's `1.0.0/03` benchmark-harness task. When that lands, this repo will install the package instead of vendoring, and the sync rule plus these prunes both disappear.

## Security

The skill runs locally on the user's machine, reading file contents from the resolved repo root. It does not write files, does not contact any external service, and does not handle credentials. The bundled scorer follows the same conventions as upstream — no `npm install`, no script execution, only file reads.

If you spot a vulnerability — e.g. a way to make the bundle execute code from the scored repo, exfiltrate file contents, or read paths outside the resolved root — email <hsnice16@gmail.com> rather than opening a public issue. Coordinated disclosure preferred.
