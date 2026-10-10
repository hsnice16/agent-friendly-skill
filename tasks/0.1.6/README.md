# 0.1.6 — AGENTS.md check stops crediting Cursor files; best-fit agent in the description

**Status**: shipped (2026-10-10)

Mirrors the upstream scorer change in [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) into the vendored scorer.

The AGENTS.md / CLAUDE.md check also passed on `.cursor/rules` and `.cursorrules`, a leftover from before Cursor rules had their own check. Every agent got instruction-file credit for a file only Cursor reads, Cursor was counted twice, and a `.cursor/rules` directory read as an empty instructions file.

## What shipped

- **AGENTS.md / CLAUDE.md check** matches `AGENTS.md`, `CLAUDE.md` and `AGENT.md` only.
- **Rationales and source links** for Cursor, Devin, Kimi CLI, OpenHands and Pi follow those agents' current docs. No weights changed.
- **`SKILL.md` description** names the best-fit agent alongside the model class and adds "which agent or model should I use here?" as a trigger phrase.
- **Project-root warning** no longer reads as a closed list of four files.

## Impact on scores

A repo whose only instruction file is a Cursor rules file loses this check for every agent; its Cursor-rules check is unchanged. One repo in the upstream tracked set was affected (`trpc/trpc`). Repos with an `AGENTS.md` or `CLAUDE.md` score as before.
