# agent-friendly-skill

[![Listed on skills.sh](https://img.shields.io/badge/listed_on-skills.sh-000000?style=flat-square&logo=vercel&logoColor=white)](https://www.skills.sh/hsnice16/agent-friendly-skill/agent-friendly)

Agent skill that scores the repo you are in for nine AI coding agents, shows which one it is best set up for, and recommends a model class. Runs locally; no network calls.

## What it does

When you invoke `/agent-friendly` (or ask your agent whether the repo is agent-ready), the skill:

1. Scores the current directory with the bundled scorer — [16 static checks](https://agentfriendlycode.com/check) × 9 agent profiles, weighted as [/methodology](https://agentfriendlycode.com/methodology) describes. It warns when the directory doesn't look like a project root, since a subdirectory scores misleadingly low.
2. Picks the highest-scoring agent as the **best fit** for this repo, whichever agent invoked the skill.
3. Maps the overall score to a band and recommends a model **class**. It never switches the model for you.
4. Prints the overall score, best fit, a close runner-up and the top improvements.

The nine profiled agents are [Claude Code](https://agentfriendlycode.com/model/claude-code), [Cursor](https://agentfriendlycode.com/model/cursor), [Devin](https://agentfriendlycode.com/model/devin), [Codex](https://agentfriendlycode.com/model/gpt-5-codex), [Gemini CLI](https://agentfriendlycode.com/model/gemini-cli), [Kimi Code CLI](https://agentfriendlycode.com/model/kimi-cli), [Aider](https://agentfriendlycode.com/model/aider), [OpenHands](https://agentfriendlycode.com/model/openhands) and [Pi](https://agentfriendlycode.com/model/pi) — the same set [Agent Friendly Code](https://agentfriendlycode.com) ranks. Agents without a profile (Cline, Copilot, Continue, Roo Code, …) install and run it too; the recommendation depends only on the scores.

## Install

```bash
npx skills add hsnice16/agent-friendly-skill#v0
```

The [`vercel-labs/skills`](https://github.com/vercel-labs/skills) CLI detects your local agents and installs `SKILL.md` plus `dist/index.js` into each one's skill directory. Pass `--agent <name>` to pick one.

Then ask your agent _"is this repo agent-friendly?"_ or run `/agent-friendly`.

## Pinning a version

The CLI selects a git ref with `#<ref>`, not `@<ref>` — `@` filters by skill name in multi-skill repos.

```bash
npx skills add hsnice16/agent-friendly-skill          # main
npx skills add hsnice16/agent-friendly-skill#v0       # latest 0.x.y release
npx skills add hsnice16/agent-friendly-skill#v0.1.8   # one exact release
```

Branches, tags and full 40-character SHAs work; abbreviated SHAs don't.

## Score → model class

| Band | Score      | Recommendation                                         |
| ---- | ---------- | ------------------------------------------------------ |
| High | ≥ 80       | Frontier (Opus, GPT-5, Gemini Pro)                     |
| Mid  | ≥ 60, < 80 | Standard (Sonnet, GPT-5 mini, Gemini Flash)            |
| Low  | < 60       | Small and fast (Haiku, GPT-5 nano, Gemini Flash-Lite)  |

A well-scaffolded repo lets a frontier model deliver; in a poorly scaffolded one its extra reasoning has little to work with, so a faster model is the better trade.

The skill names a class; you pick the model.

## Auto-score every session

Agents with a session-start hook can run `node <skill-dir>/dist/index.js . --summary` to print a one-line score each session. Snippets: <https://agentfriendlycode.com/skill>.

## Standalone CLI

```bash
node skills/agent-friendly/dist/index.js .            # JSON
node skills/agent-friendly/dist/index.js . --summary  # one line
```

## Self-contained

The scorer is vendored from [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) and bundled into `skills/agent-friendly/dist/index.js`, so the skill keeps working if the website is down. [AGENTS.md](./AGENTS.md#vendored-scorer-sync-rule) has the sync rule.

## Related

- [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) — the website and the canonical scorer.
- [`agent-friendly-action`](https://github.com/hsnice16/agent-friendly-action) — comments each PR with its score change. Setup: <https://agentfriendlycode.com/action>.

## Changelog

[`CHANGELOG.md`](./CHANGELOG.md).

## Sponsor

[github.com/sponsors/hsnice16](https://github.com/sponsors/hsnice16).

## License

[MIT](./LICENSE)
