# Contributing

Read [AGENTS.md](./AGENTS.md) first: stack, commands, layout, the vendored-scorer sync rule and conventions. AI coding agents and humans are held to the same rules.

Run `npm run prepare-hooks` once after cloning; the hooks are in `lefthook.yml`, and CI (`.github/workflows/ci.yml`) repeats them plus a `dist/` drift check. Run `npm run build` before pushing source changes: `npx skills add` installs the committed `skills/agent-friendly/dist/index.js`.

## Branches and commits

- Branches: `feat/`, `fix/`, `chore/`, `docs/` or `refactor/` plus a short kebab-case name.
- Commits: one logical change, imperative subject ≤ 72 characters, a body only when the why isn't obvious.
- Never skip hooks (`--no-verify`) or rewrite published commits.

## Pull requests

Open against `main` and keep the branch rebased. The description follows [the PR template](./.github/PULL_REQUEST_TEMPLATE.md). Aim for under ~300 changed lines; split larger work by layer (vendored scorer sync → skill runtime → CI).

A change that alters the score, the CLI output, or how `SKILL.md` tells agents to render the result gets a bullet under `## [Unreleased]` in [`CHANGELOG.md`](./CHANGELOG.md); its preamble says what doesn't.

Ready to merge when CI is green, a reviewer has approved, no comments are open, and the description is complete.

## Release flow

1. Set `version` in `package.json` (and `package-lock.json`) to `X.Y.Z`, and move bullets from `## [Unreleased]` into a new `## [X.Y.Z] - YYYY-MM-DD` section in `CHANGELOG.md`. Commit.
2. Tag the precise release: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.
3. Repoint the floating major tag (`v0` during pre-1.0; `v1` after 1.0.0): `git tag -fa v0 -m "v0 → vX.Y.Z" && git push origin v0 --force`. Force-push is allowed for the **floating** tag only — never for the precise tag.
4. Open a GitHub Release for the tag, mirror the changelog section into the description.

## Issues

- **Bugs**: use the bug-report template. Include the `npx skills add` ref you installed (`#v0.1.9` or `#v0`), your agent and its version, and the skill's JSON output if relevant.
- **Features**: open an issue before sending a PR for non-trivial changes.

## Security

Threat model: [AGENTS.md → Security](./AGENTS.md#security). Report vulnerabilities to <hsnice16@gmail.com>, not in a public issue.

## Conduct

Be decent. Disagree about code, not people.
