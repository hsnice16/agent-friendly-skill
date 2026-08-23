# 0.1.5 — match repo file lookups case-insensitively

**Status**: shipped (2026-08-23)

Mirrors upstream [`9371d6c`](https://github.com/hsnice16/agent-friendly-code/commit/9371d6c) into the vendored scorer.

Candidate paths were looked up with exact-match `existsSync`, but README / LICENSE / CONTRIBUTING casing varies genuinely in the wild (`readme.md`, `Readme.md`, `README.MD`). On a case-sensitive filesystem those files read as missing, so the skill reported a different score on Linux than on macOS for the same commit — and Linux was the wrong one.

## What shipped

- **Case-insensitive path resolution** — `firstExisting` now resolves each path segment against a case-folded directory index, joined by `resolveRelative` (single lookup) and `resolveAllRelative` (deduped by resolved path). Exact spelling wins, so an exact match is never shadowed by a differently-cased sibling; entries are sorted so a genuine `README.md` + `readme.md` collision resolves identically on every run.
- **Nine signals** moved off raw `existsSync(join(repo, …))`; `gemini-md`'s hand-rolled case-insensitive scan folded into the shared resolver; glob regexes for `.csproj` / `.cabal` / `.nimble` / `.mdc` / `.ya?ml` made case-insensitive.
- **`dev_env` no longer double-counts one file.** Its candidate list carried both `Makefile` and `makefile`; with case-insensitive resolution both would have matched the same file and pushed the signal from 0.7 to a full 1.0. `resolveAllRelative` dedupes by resolved path and the redundant spelling is gone.

## Impact on scores

Repos missing all three of README / LICENSE / CONTRIBUTING for this reason gain up to **18 points**. Eight repos in the upstream tracked set were affected, including `vercel/next.js`, `expressjs/express`, and `nestjs/nest`.

Widening a matcher can only turn a miss into a hit, so no repo loses a signal it previously passed.

## Not covered

`PROJECT_ROOT_MARKERS` in `src/index.ts` is this repo's own code rather than vendored scorer, and still matches case-sensitively. It only gates the "doesn't look like a project root" warning — never a score — and `.git` is in the list, so a real checkout is unaffected.
