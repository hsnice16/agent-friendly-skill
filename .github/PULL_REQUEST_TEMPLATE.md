<!-- Replace the italic hints below with your content. See CONTRIBUTING.md for the full rules. -->

## Summary

_1–3 bullets. What changed, in consumer-observable terms — not a log of work done._

## Motivation

_Why this change. Link to the `tasks/<file>.md` it ships, or the upstream `agent-friendly-code` change being mirrored. If it's a vendored-scorer sync, link the upstream commit/PR._

## Changes

_Bulleted list of what this PR modifies. Keep it scoped to the summary._

## Testing

_How you verified this. Commands run (`npm run typecheck`, `npm test`, `npm run build`). For skill-runtime changes: include sample output (`node skills/agent-friendly/dist/index.js .` and `... --summary`)._

## Docs + changelog sync

_Confirm one of:_

- _"Consumer-affecting (scorer / runtime / SKILL.md body) — `## [Unreleased]` bullet added to `CHANGELOG.md`."_
- _"N/A — CI / build / lint / docs-only; no changelog entry."_

_Plus, if applicable: "AGENTS.md updated (stack / layout / conventions / sync rule changed)."_

## `dist/` sync

_Confirm one of:_

- _"`npm run build` ran; `skills/agent-friendly/dist/` committed."_
- _"N/A — no `src/` change."_

## Risks / rollback

_What could break for consumers? How do we roll back? Leave blank if genuinely trivial._
