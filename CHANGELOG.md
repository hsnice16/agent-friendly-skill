# Changelog

All notable changes to `agent-friendly-skill` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the skill follows [Semantic Versioning](https://semver.org/).

This file is the consumer-facing log: it records what changed in each release of the skill — including changes to the **vendored scorer** (signals, weights, scoring logic) that come in from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. Anything that affects the score the skill produces, or what the skill prints, belongs here.

What does **not** belong here: pure CI / build / lint / test plumbing, dev-only refactors, or doc-only edits that don't change behaviour. Those stay in commit messages and PR descriptions.

## [0.1.3] - 2026-05-08

### Changed

- `tests` signal file regex now also recognises `*Test.php` (PHPUnit), `*_test.rb` / `*_spec.rb` (Minitest / RSpec), and `*Tests?.cs` (xUnit / NUnit / MSTest). Monorepos that nest tests in subdirectories (e.g. ASP.NET Core, Rails) now correctly hit the test signal even without a recognised root-level test directory.

## [0.1.2] - 2026-05-05

### Changed

- Six static signals now recognise more language-ecosystem conventions, so repos correctly scaffolded in non-Node idioms (JVM, .NET, Swift, Ruby, Elixir, Haskell, OCaml, Erlang, Crystal, Zig, Dart, PHP, Lua, Clojure, Nim, C/C++) no longer score low for the ecosystem-equivalent setup:
  - `contributing` — accepts `CONTRIBUTING.rst` (Python/Sphinx, e.g. pytest/Django) and `CONTRIBUTING.adoc` (AsciiDoc / JVM), in root, `.github/`, and `docs/`.
  - `dev_env` — accepts `tox.ini` and `noxfile.py` (Python), `mvnw` / `gradlew` (JVM build wrappers), `bin/setup` (Ruby/Rails), and `compose.yaml` (the Docker-preferred canonical name, alongside the existing `compose.yml` / `docker-compose.yml`).
  - `deps_manifest` — accepts `mix.exs` (Elixir), `Package.swift` (Swift), `build.gradle.kts` (Kotlin DSL), `build.sbt` (Scala), `deps.edn` / `project.clj` (Clojure), `stack.yaml` + root `*.cabal` (Haskell), `dune-project` (OCaml), `rebar.config` (Erlang), `shard.yml` (Crystal), `build.zig` (Zig), `CMakeLists.txt` / `meson.build` / `conanfile.txt`/`.py` / `vcpkg.json` (C/C++), root-level `*.csproj` / `*.fsproj` / `*.vbproj` / `*.sln` (.NET), and root `*.nimble` (Nim). `global.json` is intentionally **not** counted here — it pins the .NET SDK version, not dependencies (real .NET deps live in `*.csproj`).
  - `type_config` — typed-by-default credit extended to JVM (`pom.xml` / `build.gradle[.kts]`), Scala (`build.sbt`), Swift (`Package.swift`), C# (`global.json` or root `*.csproj` / `.sln`), OCaml (`dune-project`), Haskell (`stack.yaml` / root `*.cabal`), and Zig (`build.zig`), in addition to the existing Rust/Go credit.
  - `linter` — accepts `.rubocop.yml` / `.standard.yml` (Ruby), `.swiftlint.yml` / `.swiftformat` / `.swift-format` (Swift, both Nick Lockwood's and Apple's tools), `detekt.yml` + `config/detekt/detekt.yml` / `.scalafmt.conf` (JVM), `phpstan.neon[.dist]` / `psalm.xml[.dist]` / `.php-cs-fixer.dist.php` (PHP), `.credo.exs` / `.formatter.exs` (Elixir), `stylua.toml` (Lua), `checkstyle.xml` + `config/checkstyle/checkstyle.xml` (Java, including the canonical Gradle plugin path), `analysis_options.yaml` (Dart/Flutter — the canonical lint config), `.clang-format` / `.clang-tidy` (C/C++), and `.clj-kondo/config.edn` (Clojure). Intentionally **not** counted: `.editorconfig` (formatting baseline, no feedback loop) and `.ktlint` (not a real config file — ktlint reads `.editorconfig`).
  - `tests` — adds `Tests/` (Swift convention, case-sensitive filesystems) and `src/test/` (Java/Kotlin) to the directory list. File regex now also recognises `*Test.java`, `*Test[s].kt`, `*_test.exs` (Elixir), `*_test.dart` (Dart), and `*Spec.scala` / `*Test.scala`.

## [0.1.1] - 2026-05-01

### Changed

- `size` signal now respects the repo's `.gitignore` in addition to the existing baseline (`node_modules`, `.git`, `vendor`, `target`, `dist`, `build`, `.next`). Local invocations no longer count files in operationally-gitignored dirs (clone workspaces, build caches, generated data), so the skill's score matches the dashboard's fresh-clone score. New runtime dep: `ignore@7.0.5`.

## [0.1.0] - 2026-05-01

### Added

- Vendored scorer from upstream `agent-friendly-code` — 16 signals (`agents_md`, `aider_conf`, `ci`, `contributing`, `cursor_rules`, `deps_manifest`, `dev_env`, `gemini_md`, `license`, `linter`, `openhands_setup`, `pre_commit`, `readme`, `size`, `tests`, `type_config`) and weight profiles for 8 models (Claude Code, Cursor, Devin, OpenHands, Gemini CLI, GPT-5 Codex, Aider, Pi). Lives under `src/scoring/`.
- Skill entrypoint (`src/index.ts`) — resolves a repo path from argv (default cwd), runs the bundled scorer, prints JSON by default or a one-line summary when `--summary` is passed. Exits with code 2 on missing path.
- `SKILL.md` at `skills/agent-friendly/SKILL.md` — frontmatter (`name: agent-friendly`) plus instructions for the agent: how to resolve the repo root, run the bundled CLI, parse the JSON, render score + recommendation, and surface the optional `SessionStart` hook on first invocation. Provider-neutral score → model mapping table embedded.
- ncc-bundled `skills/agent-friendly/dist/index.js` — single-file scorer with no runtime dependencies. CI fails the PR if `dist/` has drifted from `src/`.
- CI workflows — `ci.yml` runs lint / typecheck / tests / `ncc build` on every PR and push to `main`, and fails on `dist/` drift. `smoke.yml` runs the bundled CLI against this repo's own checkout on every PR (skipped on fork PRs).
- Biome + Lefthook tooling — `biome.json` for formatting + linting (vendored `src/scoring/` and `src/constants/` excluded), `lefthook.yml` runs biome / `tsc --noEmit` / tests / a 300-line file-length cap on every commit.
- LICENSE file (MIT) at the repo root.
- `tasks/0.1.0/` version plans documenting the v0.1.0 cut.

[0.1.3]: https://github.com/hsnice16/agent-friendly-skill/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/hsnice16/agent-friendly-skill/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/hsnice16/agent-friendly-skill/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/hsnice16/agent-friendly-skill/releases/tag/v0.1.0
