# agent-friendly-skill

Portable agent skill that scores the current repo's agent-friendliness on disk and recommends a model class to use for it. Profiles eight agents — **Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, and Pi** — the same set the [Agent Friendly Code](https://github.com/hsnice16/agent-friendly-code) dashboard scores against. Installs into any [`vercel-labs/skills`](https://github.com/vercel-labs/skills)-compatible agent; agents without a profile (Cline, Copilot, Continue, Roo Code, …) still install and run fine — the recommendation is score-driven and provider-neutral, so the overall score and the score → model-class mapping apply regardless of which agent invoked the skill.

> **Version**: `v0.1.3` — plans live in [`tasks/`](./tasks/). Pin `#v0` to track the latest 0.x release; pin a precise tag (`#v0.1.3`) to opt out of automatic minor/patch updates — see [Pinning a version](#pinning-a-version) below. Tracking task in the parent project: [`tasks/0.5.0/03-agent-skill.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/03-agent-skill.md).

## What it does

When the user invokes `/agent-friendly` (or however their agent triggers skills), the skill:

1. Tells the user upfront that it scores the current working directory — so they're at the project root, or pass an explicit path. The agent surfaces this; the CLI also emits a `warnings[]` entry when the cwd has no project markers (`package.json` / `README.md` / `AGENTS.md` / `.git`) so a wrong path can't silently produce a low score.
2. Runs the bundled scorer locally — 16 static signals × 8 agent profiles.
3. Picks the highest-scoring agent as the **best-fit** for this repo (score-driven, regardless of which agent invoked the skill).
4. Maps the overall score to a band (high / mid / low) and recommends a model **class** (frontier / standard / small) for the user to switch to manually — the skill never switches the model programmatically.
5. Prints the overall score, best-fit agent, runner-up if close, top improvements.

The scorer is **vendored from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo** and bundled into `skills/agent-friendly/dist/index.js` via `@vercel/ncc`. The skill never makes an HTTP request — if the upstream dashboard goes offline tomorrow, this skill keeps producing recommendations unchanged.

## Install

```bash
npx skills add hsnice16/agent-friendly-skill
```

The [`vercel-labs/skills`](https://github.com/vercel-labs/skills) CLI autodetects which agents are configured locally and writes `SKILL.md` plus `dist/index.js` to each one's skill directory. Pass `--agent <name>` to scope, or `--agent '*'` for every detected agent. Default install is a symlink to a canonical copy, so `npx skills update` propagates to every agent at once.

After install, ask your agent something like _"is this repo agent-friendly?"_ or invoke `/agent-friendly` directly.

## Pinning a version

The `vercel-labs/skills` CLI uses `#<ref>` (a URL fragment) to pick a git ref — **not** `@<ref>`. The `@` syntax is reserved for filtering by skill name in multi-skill repos.

```bash
npx skills add hsnice16/agent-friendly-skill          # tracks main — auto-updates via `npx skills update`
npx skills add hsnice16/agent-friendly-skill#v0       # floating major tag — auto-updates within 0.x.y
npx skills add hsnice16/agent-friendly-skill#v0.1.3   # precise tag — never updates
```

Branches and tags are both accepted. Commit SHAs are not (the CLI clones with `--branch <ref>` under the hood, which doesn't accept raw SHAs).

## Score → model mapping

| Band | Score   | Recommendation                                                                                         |
| ---- | ------- | ------------------------------------------------------------------------------------------------------ |
| High | ≥ 80    | Frontier — Opus / GPT-5 / Gemini 2.5 Pro. Repo is well-prepped, the model can leverage it.             |
| Mid  | 60 – 79 | Standard — Sonnet / GPT-5 Codex / Gemini 2.5 Flash. Solid baseline; frontier optional.                 |
| Low  | < 60    | Small / fast — Haiku / GPT-4o-mini / Gemini 2.5 Flash-Lite. Repo lacks scaffolding for a frontier run. |

Provider-neutral. The skill recommends a model **class** — the user picks the actual ID for their agent.

## Optional — auto-score every session

For agents that support session-start hooks, drop the matching snippet from <https://www.agentfriendlycode.com/skill> into your settings file. The hook runs `node <skill-dir>/dist/index.js . --summary` and prints a one-line score at the top of every session.

## Usage outside the skill

The bundled CLI also runs standalone:

```bash
node skills/agent-friendly/dist/index.js .            # JSON output (default)
node skills/agent-friendly/dist/index.js . --summary  # one-line human summary
```

Useful in CI checks, status-line scripts, or anywhere you want a portable agent-friendliness score without installing the skill.

## Self-contained

The scorer + weights live inside `skills/agent-friendly/dist/index.js`. No network call to the upstream dashboard at runtime. The vendored scorer stays in sync with upstream by hand — see [AGENTS.md](./AGENTS.md) "Vendored scorer" for the propagation rule.

## Family

Three repos, one scorer:

- **[`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code)** — the public dashboard at <https://www.agentfriendlycode.com>, source of truth for the scorer and the per-model weights.
- **[`agent-friendly-action`](https://github.com/hsnice16/agent-friendly-action)** — GitHub Action that scores PR head + base inside maintainer CI and posts a single delta comment on every PR. Same vendored scorer, different surface.
- **`agent-friendly-skill`** (this repo) — local in-editor counterpart for any [`vercel-labs/skills`](https://github.com/vercel-labs/skills)-compatible agent.

When the upstream scorer changes, the action and skill mirror by hand — see each repo's `AGENTS.md` "Vendored scorer" section for the propagation rule.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for what shipped per release.

## Sponsor

If this skill is useful to you, consider sponsoring its development: [github.com/sponsors/hsnice16](https://github.com/sponsors/hsnice16).

## License

[MIT](./LICENSE)
