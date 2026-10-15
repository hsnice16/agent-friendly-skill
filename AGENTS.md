# AGENTS.md

Instructions for AI coding agents working on `agent-friendly-skill`.

## What this project is

An agent skill (`npx skills add hsnice16/agent-friendly-skill#v0`) that scores the user's current repo locally for the nine agents [Agent Friendly Code](https://agentfriendlycode.com) profiles, reports the best fit and recommends a model class. Any [`vercel-labs/skills`](https://github.com/vercel-labs/skills)-compatible agent can run it; agents without a profile get the same score-driven answer.

The scorer is vendored from [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code), the source of truth, and bundled so the skill never needs the website. [agent-friendly-action](https://github.com/hsnice16/agent-friendly-action) vendors the same scorer for PR comments.

## Stack

- **Node ≥ 20.9.0** runtime — matches `engines.node`.
- **TypeScript** — strict mode.
- **`@vercel/ncc`** — bundles `src/index.ts` + scorer into a single `skills/agent-friendly/dist/index.js`. That bundle is what `npx skills add` ships to consumers.
- **Biome** — formatter + linter. Config at `biome.json` (lineWidth 120, parent-aligned). Vendored `src/scoring/` and `src/constants/` are excluded — upstream owns their style.
- **Lefthook** — git pre-commit hooks run Biome / `tsc --noEmit` / tests / a 300-line file-length cap on `src/**/*.ts`.

## Layout

```text
skills/agent-friendly/  # the directory the vercel-labs/skills CLI installs
  SKILL.md              # frontmatter + body (instructions to the agent)
  dist/
    index.js            # ncc-bundled scorer (committed — this is what gets installed)
src/
  index.ts              # entry point — orchestration
  args.ts               # argv parsing
  format.ts             # one-line summary formatter for --summary
  scoring/              # vendored from upstream lib/scoring/ (do not reformat — sync rule below)
  constants/            # vendored from upstream lib/constants/scoring.ts
tests/
  args.test.ts
  cli.test.ts
  format.test.ts
biome.json              # formatter + linter config
lefthook.yml            # pre-commit jobs (biome, typecheck, test, file-length)
package.json            # private; build / typecheck / test scripts
tasks/
  <version>/            # one folder per release (README, plus per-task files for multi-task releases)
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

Semver tags plus a floating major tag. A precise tag (`v0.1.6`) never moves; the floating tag (`v0`, later `v1`) is repointed to the latest release of that major. Consumers pick a ref with the CLI's `#<ref>` fragment — `@` is its skill-name filter. The skill's version is independent of upstream's: a `tasks/0.5.0/...` link on upstream is upstream's milestone.

Every release tag gets a dated `CHANGELOG.md` section (bullets moved out of `## [Unreleased]`); [CONTRIBUTING.md](./CONTRIBUTING.md#release-flow) has the steps.

`#<ref>` support lives in [`source-parser.ts`](https://github.com/vercel-labs/skills/blob/main/src/source-parser.ts) (`parseFragmentRef`) and [`git.ts`](https://github.com/vercel-labs/skills/blob/main/src/git.ts) and is undocumented in their README (checked against `skills@1.7.2`) — re-check on a CLI upgrade.

## Self-containment rule

The skill must keep working with no network access to the [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code) web app. Bundle whatever scoring code is required. The web app is **not** contacted at runtime.

## Vendored scorer (sync rule)

`src/scoring/` and `src/constants/` are vendored copies of `lib/scoring/` and `lib/constants/scoring.ts` from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. There is no automatic sync — when upstream changes a signal, weight, or `scorer.ts` shape, those changes are copied here by hand and logged under `## [Unreleased]` in `CHANGELOG.md`.

Upstream's [`AGENTS.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/AGENTS.md) (under "Sibling repos") owns the propagation rule — agents working over there are instructed to mirror their scorer changes into this repo **and** into `agent-friendly-action`. If you find drift, the upstream is the source of truth — **except** for the deliberate prunes listed below.

**Local prunes from upstream** (intentional, do not re-add on sync):

- `src/constants/scoring.ts` — only `SCORE_THRESHOLD_MID`, `SCORE_THRESHOLD_GOOD`, and `DEFAULT_SUGGESTION_LIMIT` are kept. Every other upstream constant sizes website UI (pagination, list limits, search length); nothing in `lib/scoring/` imports them.
- `src/scoring/weights.ts` — `MODEL_BY_ID` (a `Record<ModelId, ModelProfile>`) is dropped; the skill iterates `MODELS` and never indexes by id, and ncc does not tree-shake the eager `Object.fromEntries` call.

When syncing upstream changes, copy the substantive change (new signal, weight tweak, scoring-logic edit) and re-apply these prunes on top.

Extracting the scorer to a standalone npm package (`agent-friendly-scorer`) is on the upstream's `1.0.0/03` benchmark-harness task. When that lands, this repo will install the package instead of vendoring, and the sync rule plus these prunes both disappear.

## Security

The skill reads files under the resolved repo root and nothing else: no writes, no network, no credentials, no code from the scored repo is run. The scorer treats the tree as untrusted — symlinks that leave the root are not followed, only regular files are read, and each read stops at 1 MiB.

Report a vulnerability — e.g. a way to execute code from the scored repo or read outside its root — to <hsnice16@gmail.com>, not a public issue.
