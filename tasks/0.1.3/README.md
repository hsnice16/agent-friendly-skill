# 0.1.3 — broaden tests signal to PHP, Ruby, C#

**Status**: shipped (2026-05-08)

Single-purpose patch release that mirrors upstream [`90b650d`](https://github.com/hsnice16/agent-friendly-code/commit/90b650d) into the vendored scorer. Mirrored in the [`agent-friendly-action`](https://github.com/hsnice16/agent-friendly-action) sibling at the same version.

The 0.1.2 sweep extended the `tests` signal to JVM, Swift, Elixir, Dart, and Scala but left three mainstream ecosystems on the JS/TS-biased file regex — PHP, Ruby, and C#. Repos that nest test files in subdirectories (canonical for ASP.NET Core and Rails) only matched if a recognised root-level test directory was also present, so well-scaffolded monorepos in those stacks under-scored.

## What shipped

Vendored signal update (copied verbatim from upstream `lib/scoring/signals/tests.ts`, modulo the documented prunes in `AGENTS.md` — none apply to this file):

- **`tests`** file regex now also recognises:
  - `*Test.php` — PHPUnit convention.
  - `*_test.rb` / `*_spec.rb` — Minitest / RSpec.
  - `*Tests?.cs` — xUnit / NUnit / MSTest (covers both `FooTest.cs` and `FooTests.cs`).

The directory list (`tests`, `test`, `__tests__`, `spec`, `specs`, `Tests`, `src/test`) is unchanged — Rails (`spec/`, `test/`) and ASP.NET Core (`*.Tests/` projects nested under `tests/`) already match via the existing entries plus the new file regex.

## Tracking task

Upstream: [`tasks/0.5.0/03-agent-skill.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/03-agent-skill.md).

Upstream commit: [`90b650d`](https://github.com/hsnice16/agent-friendly-code/commit/90b650d) — `feat: broaden tests signal to PHP, Ruby, C#`.
