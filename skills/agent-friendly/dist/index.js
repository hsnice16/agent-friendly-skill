#!/usr/bin/env node
require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 792:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_SUGGESTION_LIMIT = exports.SCORE_THRESHOLD_GOOD = exports.SCORE_THRESHOLD_MID = void 0;
exports.SCORE_THRESHOLD_MID = 60;
exports.SCORE_THRESHOLD_GOOD = 80;
exports.DEFAULT_SUGGESTION_LIMIT = 3;


/***/ }),

/***/ 264:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bandFor = bandFor;
exports.formatSummary = formatSummary;
const scoring_1 = __nccwpck_require__(792);
function bandFor(overall) {
    if (overall >= scoring_1.SCORE_THRESHOLD_GOOD) {
        return "high";
    }
    if (overall >= scoring_1.SCORE_THRESHOLD_MID) {
        return "mid";
    }
    return "low";
}
function formatSummary(score) {
    const band = bandFor(score.overall);
    const sorted = score.modelScores.slice().sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const head = `agent-friendly: ${score.overall} (${band})`;
    const tail = best ? ` · best: ${best.modelLabel} ${best.score}` : "";
    return `${head}${tail}\n`;
}


/***/ }),

/***/ 789:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.scoreRepo = scoreRepo;
exports.topImprovements = topImprovements;
const node_path_1 = __nccwpck_require__(760);
const scoring_1 = __nccwpck_require__(792);
const signals_1 = __nccwpck_require__(607);
const weights_1 = __nccwpck_require__(300);
function scoreOneModel(profile, signals) {
    let earned = 0;
    const contributions = [];
    const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0);
    for (const s of signals) {
        const w = profile.weights[s.id] ?? 0;
        const contribution = s.pass * w;
        earned += contribution;
        contributions.push({
            weight: w,
            contribution,
            pass: s.pass,
            signalId: s.id,
        });
    }
    const score = weightSum === 0 ? 0 : (earned / weightSum) * 100;
    return {
        contributions,
        modelId: profile.id,
        modelLabel: profile.label,
        score: Math.round(score * 10) / 10,
    };
}
// Strip the absolute repo-root prefix so persisted/rendered paths never leak
// the scanner's local filesystem layout. Signals are written individually —
// some already return relative paths, some don't — normalising once here is
// the reliable belt-and-braces.
function toRelative(repoPath, p) {
    if (!p) {
        return p;
    }
    const rel = (0, node_path_1.relative)(repoPath, p);
    return rel.startsWith("..") ? p : rel || ".";
}
function scoreRepo(repoPath, models = weights_1.MODELS) {
    const rawSignals = (0, signals_1.runAllSignals)(repoPath);
    const signals = rawSignals.map((s) => ({
        ...s,
        matchedPath: toRelative(repoPath, s.matchedPath),
    }));
    const modelScores = models.map((m) => scoreOneModel(m, signals));
    const overall = modelScores.length === 0
        ? 0
        : Math.round((modelScores.reduce((a, b) => a + b.score, 0) / modelScores.length) * 10) / 10;
    return { signals, modelScores, overall };
}
function topImprovements(modelId, signals, limit = scoring_1.DEFAULT_SUGGESTION_LIMIT, models = weights_1.MODELS) {
    const profile = models.find((m) => m.id === modelId);
    if (!profile) {
        return [];
    }
    const weightSum = Object.values(profile.weights).reduce((a, b) => a + b, 0) || 1;
    return signals
        .map((s) => {
        const w = profile.weights[s.id] ?? 0;
        const scoreGain = (((1 - s.pass) * w) / weightSum) * 100;
        return { signalResult: s, scoreGain };
    })
        .filter((x) => x.scoreGain > 0)
        .sort((a, b) => b.scoreGain - a.scoreGain)
        .slice(0, limit)
        .map(({ signalResult, scoreGain }) => ({
        label: signalResult.label,
        signalId: signalResult.id,
        scoreGain: Math.round(scoreGain * 10) / 10,
        suggestion: signals_1.SIGNAL_BY_ID[signalResult.id]?.improveSuggestion ?? "",
    }));
}


/***/ }),

/***/ 299:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.agentsMd = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["AGENTS.md", "CLAUDE.md", "AGENT.md", ".cursor/rules", ".cursorrules"];
const LABEL = "AGENTS.md / CLAUDE.md";
exports.agentsMd = {
    label: LABEL,
    id: "agents_md",
    description: "Presence of an agent-oriented instructions file, with substantive content.",
    improveSuggestion: "Add an AGENTS.md covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
    check: (repo) => {
        const matched = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (!matched) {
            return {
                pass: 0,
                label: LABEL,
                id: "agents_md",
                detail: "No agent instructions file found",
            };
        }
        const len = (0, helpers_1.readSafe)(matched).trim().length;
        if (len === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                id: "agents_md",
                matchedPath: matched,
                detail: "File exists but empty",
            };
        }
        if (len < 200) {
            return {
                pass: 0.5,
                label: LABEL,
                id: "agents_md",
                matchedPath: matched,
                detail: `File exists (${len} chars) — thin`,
            };
        }
        if (len < 800) {
            return {
                pass: 0.8,
                label: LABEL,
                id: "agents_md",
                matchedPath: matched,
                detail: `File exists (${len} chars)`,
            };
        }
        return {
            pass: 1,
            label: LABEL,
            id: "agents_md",
            matchedPath: matched,
            detail: `Substantive (${len} chars)`,
        };
    },
};


/***/ }),

/***/ 585:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.aiderConf = void 0;
const helpers_1 = __nccwpck_require__(742);
const LABEL = ".aider.conf.yml";
const CANDIDATES = [".aider.conf.yml", ".aider.conf.yaml"];
exports.aiderConf = {
    label: LABEL,
    id: "aider_conf",
    description: "Aider reads `.aider.conf.yml` (or `.yaml`) for repo-level config — model, lint command, test command.",
    improveSuggestion: "Add a `.aider.conf.yml` at the repo root pinning Aider's `test-cmd` and `lint-cmd` so it auto-runs them after edits.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                label: LABEL,
                matchedPath: m,
                id: "aider_conf",
                detail: "Aider config present",
            };
        }
        return {
            pass: 0,
            label: LABEL,
            id: "aider_conf",
            detail: "No .aider.conf.yml at repo root",
        };
    },
};


/***/ }),

/***/ 543:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ci = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const OTHER_CI = [
    ".gitlab-ci.yml",
    ".circleci/config.yml",
    "azure-pipelines.yml",
    ".travis.yml",
    "Jenkinsfile",
    ".buildkite/pipeline.yml",
];
exports.ci = {
    id: "ci",
    label: "CI configuration",
    description: "Defined pipeline the agent can reason about / emulate locally.",
    improveSuggestion: "Add a CI workflow (e.g. .github/workflows/ci.yml or .gitlab-ci.yml) that runs tests + linter on every PR.",
    check: (repo) => {
        const ghWf = (0, node_path_1.join)(repo, ".github", "workflows");
        if ((0, node_fs_1.existsSync)(ghWf) && (0, node_fs_1.statSync)(ghWf).isDirectory()) {
            const files = (0, node_fs_1.readdirSync)(ghWf).filter((f) => /\.ya?ml$/.test(f));
            if (files.length > 0) {
                return {
                    pass: 1,
                    id: "ci",
                    label: "CI configuration",
                    matchedPath: ".github/workflows",
                    detail: `${files.length} GitHub Actions workflow(s)`,
                };
            }
        }
        const m = (0, helpers_1.firstExisting)(repo, OTHER_CI);
        if (m) {
            return {
                id: "ci",
                pass: 0.9,
                matchedPath: m,
                label: "CI configuration",
                detail: "CI config present",
            };
        }
        return {
            pass: 0,
            id: "ci",
            label: "CI configuration",
            detail: "No CI config found",
        };
    },
};


/***/ }),

/***/ 259:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.contributing = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["CONTRIBUTING.md", "CONTRIBUTING", ".github/CONTRIBUTING.md", "docs/CONTRIBUTING.md"];
exports.contributing = {
    id: "contributing",
    label: "CONTRIBUTING guide",
    description: "Explicit contribution workflow an agent can follow.",
    improveSuggestion: "Add CONTRIBUTING.md describing branch naming, commit style, test commands, and the PR process.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "contributing",
                detail: "Guide present",
                label: "CONTRIBUTING guide",
            };
        }
        return {
            pass: 0,
            id: "contributing",
            label: "CONTRIBUTING guide",
            detail: "No CONTRIBUTING file",
        };
    },
};


/***/ }),

/***/ 567:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cursorRules = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const LABEL = "Cursor rules (.cursor/rules)";
exports.cursorRules = {
    label: LABEL,
    id: "cursor_rules",
    description: "Cursor's canonical instruction surface — `.cursor/rules/*.mdc` (modern) or `.cursorrules` (legacy).",
    improveSuggestion: "Add `.cursor/rules/*.mdc` files describing how Cursor should work in this repo (architecture, conventions, naming). The legacy `.cursorrules` file is still read but is deprecated.",
    check: (repo) => {
        const dir = (0, node_path_1.join)(repo, ".cursor", "rules");
        if ((0, node_fs_1.existsSync)(dir)) {
            try {
                if ((0, node_fs_1.statSync)(dir).isDirectory()) {
                    const mdc = (0, node_fs_1.readdirSync)(dir).filter((f) => f.endsWith(".mdc"));
                    if (mdc.length > 0) {
                        return {
                            pass: 1,
                            label: LABEL,
                            id: "cursor_rules",
                            matchedPath: `.cursor/rules/${mdc[0]}`,
                            detail: `${mdc.length} .mdc file${mdc.length === 1 ? "" : "s"} in .cursor/rules/`,
                        };
                    }
                }
            }
            catch { }
        }
        const legacy = (0, node_path_1.join)(repo, ".cursorrules");
        if ((0, node_fs_1.existsSync)(legacy)) {
            return {
                pass: 0.5,
                label: LABEL,
                id: "cursor_rules",
                matchedPath: ".cursorrules",
                detail: "Legacy .cursorrules — Cursor still reads it, but `.cursor/rules/*.mdc` is preferred",
            };
        }
        return {
            pass: 0,
            label: LABEL,
            id: "cursor_rules",
            detail: "No .cursor/rules/*.mdc or .cursorrules",
        };
    },
};


/***/ }),

/***/ 119:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.depsManifest = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [
    "package.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "pyproject.toml",
    "requirements.txt",
    "Pipfile",
    "poetry.lock",
    "Cargo.toml",
    "go.mod",
    "Gemfile",
    "composer.json",
    "pubspec.yaml",
    "build.gradle",
    "pom.xml",
];
exports.depsManifest = {
    id: "deps_manifest",
    label: "Dependency manifest",
    description: "Machine-readable dependency list so the agent can reproduce the env.",
    improveSuggestion: "Commit a proper manifest (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) plus a lockfile.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "deps_manifest",
                detail: "Manifest present",
                label: "Dependency manifest",
            };
        }
        return {
            pass: 0,
            id: "deps_manifest",
            label: "Dependency manifest",
            detail: "No dependency manifest found",
        };
    },
};


/***/ }),

/***/ 50:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.devEnv = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const ARTIFACTS = [
    "Makefile",
    "makefile",
    ".devcontainer/devcontainer.json",
    ".devcontainer.json",
    "flake.nix",
    "shell.nix",
    "Dockerfile",
    "docker-compose.yml",
    "compose.yml",
    "justfile",
    "Taskfile.yml",
];
exports.devEnv = {
    id: "dev_env",
    label: "Reproducible dev env",
    description: "One-command setup the agent can run (Makefile / devcontainer / Nix / Docker).",
    improveSuggestion: "Add a Makefile or devcontainer or Dockerfile so the agent can set up the project in one command.",
    check: (repo) => {
        const matches = ARTIFACTS.filter((c) => (0, node_fs_1.existsSync)((0, node_path_1.join)(repo, c)));
        if (matches.length >= 2) {
            return {
                pass: 1,
                id: "dev_env",
                matchedPath: matches[0],
                label: "Reproducible dev env",
                detail: `${matches.length} env artifacts (${matches.slice(0, 2).join(", ")})`,
            };
        }
        if (matches.length === 1) {
            return {
                pass: 0.7,
                id: "dev_env",
                matchedPath: matches[0],
                detail: `Has ${matches[0]}`,
                label: "Reproducible dev env",
            };
        }
        const pkg = (0, node_path_1.join)(repo, "package.json");
        if ((0, node_fs_1.existsSync)(pkg)) {
            try {
                const j = JSON.parse((0, helpers_1.readSafe)(pkg));
                if (j.scripts && Object.keys(j.scripts).length >= 3) {
                    return {
                        pass: 0.6,
                        id: "dev_env",
                        matchedPath: "package.json",
                        label: "Reproducible dev env",
                        detail: `package.json has ${Object.keys(j.scripts).length} scripts`,
                    };
                }
            }
            catch { }
        }
        return {
            pass: 0,
            id: "dev_env",
            label: "Reproducible dev env",
            detail: "No Makefile / devcontainer / Docker / equivalent found",
        };
    },
};


/***/ }),

/***/ 340:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.geminiMd = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = "GEMINI.md";
function findGeminiMd(repo) {
    let entries = [];
    try {
        entries = (0, node_fs_1.readdirSync)(repo);
    }
    catch {
        return null;
    }
    for (const e of entries) {
        if (e.toLowerCase() === "gemini.md") {
            return (0, node_path_1.join)(repo, e);
        }
    }
    return null;
}
exports.geminiMd = {
    label: LABEL,
    id: "gemini_md",
    description: "Gemini CLI's canonical hierarchical instructions file — read at every prompt.",
    improveSuggestion: "Add a GEMINI.md at the repo root covering project goals, layout, setup commands, and conventions. Aim for 800+ chars of real guidance (not boilerplate).",
    check: (repo) => {
        const matched = findGeminiMd(repo);
        if (!matched) {
            return {
                pass: 0,
                label: LABEL,
                id: "gemini_md",
                detail: "No GEMINI.md at repo root",
            };
        }
        const len = (0, helpers_1.readSafe)(matched).trim().length;
        if (len === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                id: "gemini_md",
                matchedPath: matched,
                detail: "GEMINI.md exists but empty",
            };
        }
        if (len < 200) {
            return {
                pass: 0.5,
                label: LABEL,
                id: "gemini_md",
                matchedPath: matched,
                detail: `GEMINI.md exists (${len} chars) — thin`,
            };
        }
        if (len < 800) {
            return {
                pass: 0.8,
                label: LABEL,
                id: "gemini_md",
                matchedPath: matched,
                detail: `GEMINI.md exists (${len} chars)`,
            };
        }
        return {
            pass: 1,
            label: LABEL,
            id: "gemini_md",
            matchedPath: matched,
            detail: `Substantive GEMINI.md (${len} chars)`,
        };
    },
};


/***/ }),

/***/ 742:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.firstExisting = firstExisting;
exports.readSafe = readSafe;
exports.walkFind = walkFind;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
function firstExisting(repo, candidates) {
    for (const c of candidates) {
        const p = (0, node_path_1.join)(repo, c);
        if ((0, node_fs_1.existsSync)(p)) {
            return p;
        }
    }
    return null;
}
function readSafe(p) {
    try {
        return (0, node_fs_1.readFileSync)(p, "utf8");
    }
    catch {
        return "";
    }
}
function walkFind(root, match, maxDepth = 3, maxHits = 1) {
    const hits = [];
    const visit = (dir, depth, rel) => {
        if (hits.length >= maxHits || depth > maxDepth) {
            return;
        }
        let entries = [];
        try {
            entries = (0, node_fs_1.readdirSync)(dir);
        }
        catch {
            return;
        }
        for (const e of entries) {
            if (e === "node_modules" || e === ".git" || e === "vendor" || e === "target") {
                continue;
            }
            const abs = (0, node_path_1.join)(dir, e);
            const relNext = rel ? `${rel}/${e}` : e;
            let st;
            try {
                st = (0, node_fs_1.statSync)(abs);
            }
            catch {
                continue;
            }
            if (st.isDirectory()) {
                visit(abs, depth + 1, relNext);
            }
            else if (match(relNext)) {
                hits.push(relNext);
                if (hits.length >= maxHits) {
                    return;
                }
            }
        }
    };
    visit(root, 0, "");
    return hits;
}


/***/ }),

/***/ 607:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SIGNAL_BY_ID = exports.SIGNALS = void 0;
exports.runAllSignals = runAllSignals;
const agents_md_1 = __nccwpck_require__(299);
const aider_conf_1 = __nccwpck_require__(585);
const ci_1 = __nccwpck_require__(543);
const contributing_1 = __nccwpck_require__(259);
const cursor_rules_1 = __nccwpck_require__(567);
const deps_manifest_1 = __nccwpck_require__(119);
const dev_env_1 = __nccwpck_require__(50);
const gemini_md_1 = __nccwpck_require__(340);
const license_1 = __nccwpck_require__(324);
const linter_1 = __nccwpck_require__(809);
const openhands_setup_1 = __nccwpck_require__(213);
const pre_commit_1 = __nccwpck_require__(406);
const readme_1 = __nccwpck_require__(601);
const size_1 = __nccwpck_require__(746);
const tests_1 = __nccwpck_require__(218);
const type_config_1 = __nccwpck_require__(158);
exports.SIGNALS = [
    agents_md_1.agentsMd,
    cursor_rules_1.cursorRules,
    gemini_md_1.geminiMd,
    openhands_setup_1.openhandsSetup,
    aider_conf_1.aiderConf,
    readme_1.readme,
    tests_1.tests,
    ci_1.ci,
    linter_1.linter,
    deps_manifest_1.depsManifest,
    dev_env_1.devEnv,
    type_config_1.typeConfig,
    license_1.license,
    contributing_1.contributing,
    pre_commit_1.preCommit,
    size_1.size,
];
exports.SIGNAL_BY_ID = Object.fromEntries(exports.SIGNALS.map((s) => [s.id, s]));
function runAllSignals(repoPath) {
    return exports.SIGNALS.map((s) => {
        try {
            return s.check(repoPath);
        }
        catch (err) {
            return {
                pass: 0,
                id: s.id,
                label: s.label,
                detail: `check errored: ${err.message}`,
            };
        }
    });
}


/***/ }),

/***/ 324:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.license = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING", "COPYING.md"];
exports.license = {
    id: "license",
    label: "License file",
    description: "Clarity on what an agent is allowed to do with the code.",
    improveSuggestion: "Add a LICENSE (or COPYING) file — MIT, Apache-2.0, BSD, GPL, etc. — at the repo root.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                id: "license",
                matchedPath: m,
                label: "License file",
                detail: "License present",
            };
        }
        return {
            pass: 0,
            id: "license",
            label: "License file",
            detail: "No LICENSE/COPYING file",
        };
    },
};


/***/ }),

/***/ 809:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.linter = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.json",
    ".eslintrc.cjs",
    "eslint.config.js",
    "eslint.config.mjs",
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.js",
    "prettier.config.js",
    "ruff.toml",
    ".ruff.toml",
    ".pylintrc",
    ".flake8",
    "setup.cfg",
    "rustfmt.toml",
    ".rustfmt.toml",
    "clippy.toml",
    ".golangci.yml",
    ".golangci.yaml",
    "biome.json",
    ".biome.json",
];
const PYPROJECT_RE = /\[tool\.(ruff|black|flake8|pylint|mypy)/;
exports.linter = {
    id: "linter",
    label: "Linter / formatter config",
    description: "Agents get immediate feedback on style rather than ambiguous drift.",
    improveSuggestion: "Configure a linter/formatter (ESLint+Prettier, Biome, Ruff, rustfmt+clippy, golangci-lint) and commit the config.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                id: "linter",
                matchedPath: m,
                detail: "Config detected",
                label: "Linter / formatter config",
            };
        }
        const pyproject = (0, node_path_1.join)(repo, "pyproject.toml");
        if ((0, node_fs_1.existsSync)(pyproject) && PYPROJECT_RE.test((0, helpers_1.readSafe)(pyproject))) {
            return {
                pass: 1,
                id: "linter",
                matchedPath: "pyproject.toml",
                label: "Linter / formatter config",
                detail: "Configured in pyproject.toml",
            };
        }
        return {
            pass: 0,
            id: "linter",
            label: "Linter / formatter config",
            detail: "No linter/formatter config found",
        };
    },
};


/***/ }),

/***/ 213:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.openhandsSetup = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const LABEL = ".openhands/setup.sh";
const REL = ".openhands/setup.sh";
exports.openhandsSetup = {
    label: LABEL,
    id: "openhands_setup",
    description: "OpenHands runs `.openhands/setup.sh` at session start to bootstrap the repo's dev environment.",
    improveSuggestion: "Add a `.openhands/setup.sh` that installs dependencies and prepares the project so OpenHands can run tests and lints out of the box.",
    check: (repo) => {
        const abs = (0, node_path_1.join)(repo, REL);
        if (!(0, node_fs_1.existsSync)(abs)) {
            return {
                pass: 0,
                label: LABEL,
                id: "openhands_setup",
                detail: "No .openhands/setup.sh",
            };
        }
        const len = (0, helpers_1.readSafe)(abs).trim().length;
        if (len === 0) {
            return {
                pass: 0.2,
                label: LABEL,
                matchedPath: abs,
                id: "openhands_setup",
                detail: "Empty .openhands/setup.sh",
            };
        }
        return {
            pass: 1,
            label: LABEL,
            matchedPath: abs,
            id: "openhands_setup",
            detail: `Setup script present (${len} chars)`,
        };
    },
};


/***/ }),

/***/ 406:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.preCommit = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = [".pre-commit-config.yaml", ".husky", "lefthook.yml", "lefthook.yaml"];
exports.preCommit = {
    id: "pre_commit",
    label: "Pre-commit / git hooks",
    description: "Catches problems locally before the agent wastes a CI cycle.",
    improveSuggestion: "Set up pre-commit (.pre-commit-config.yaml), husky, or lefthook to run format+lint on every commit.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "pre_commit",
                label: "Pre-commit / git hooks",
                detail: "Hook framework configured",
            };
        }
        return {
            pass: 0,
            id: "pre_commit",
            label: "Pre-commit / git hooks",
            detail: "No pre-commit / husky / lefthook found",
        };
    },
};


/***/ }),

/***/ 601:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readme = void 0;
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["README.md", "README.rst", "README.txt", "README"];
exports.readme = {
    id: "readme",
    label: "README",
    description: "Non-trivial README so the agent can learn the project quickly.",
    improveSuggestion: "Expand your README to cover what the project does, how to install, the common commands, and the high-level layout.",
    check: (repo) => {
        const p = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (!p) {
            return {
                pass: 0,
                id: "readme",
                label: "README",
                detail: "No README found",
            };
        }
        const len = (0, helpers_1.readSafe)(p).trim().length;
        if (len < 200) {
            return {
                id: "readme",
                label: "README",
                pass: 0.3,
                detail: `README thin (${len} chars)`,
                matchedPath: p,
            };
        }
        if (len < 1000) {
            return {
                pass: 0.7,
                id: "readme",
                matchedPath: p,
                label: "README",
                detail: `README present (${len} chars)`,
            };
        }
        return {
            pass: 1,
            id: "readme",
            matchedPath: p,
            label: "README",
            detail: `README detailed (${len} chars)`,
        };
    },
};


/***/ }),

/***/ 746:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.size = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const IGNORE = new Set(["node_modules", ".git", "vendor", "target", "dist", "build", ".next"]);
const CAP = 10000;
const MAX_DEPTH = 8;
exports.size = {
    id: "size",
    label: "Manageable size",
    description: "Very large repos strain an agent's context window.",
    improveSuggestion: "If possible, split into smaller modules or carve out a focused entry path. Document where to start in AGENTS.md.",
    check: (repo) => {
        let count = 0;
        const visit = (dir, depth) => {
            if (count > CAP || depth > MAX_DEPTH) {
                return;
            }
            let entries = [];
            try {
                entries = (0, node_fs_1.readdirSync)(dir);
            }
            catch {
                return;
            }
            for (const e of entries) {
                if (IGNORE.has(e) || e.startsWith(".")) {
                    continue;
                }
                const abs = (0, node_path_1.join)(dir, e);
                let st;
                try {
                    st = (0, node_fs_1.statSync)(abs);
                }
                catch {
                    continue;
                }
                if (st.isDirectory()) {
                    visit(abs, depth + 1);
                }
                else {
                    count++;
                }
                if (count > CAP) {
                    return;
                }
            }
        };
        visit(repo, 0);
        if (count < 50) {
            return {
                pass: 0.9,
                id: "size",
                label: "Manageable size",
                detail: `${count} files — very small`,
            };
        }
        if (count < 500) {
            return {
                pass: 1,
                id: "size",
                detail: `${count} files`,
                label: "Manageable size",
            };
        }
        if (count < 2000) {
            return {
                pass: 0.8,
                id: "size",
                detail: `${count} files`,
                label: "Manageable size",
            };
        }
        if (count < 5000) {
            return {
                pass: 0.5,
                id: "size",
                label: "Manageable size",
                detail: `${count} files — large`,
            };
        }
        return {
            pass: 0.2,
            id: "size",
            label: "Manageable size",
            detail: `${count}+ files — very large`,
        };
    },
};


/***/ }),

/***/ 218:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tests = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const DIRS = ["tests", "test", "__tests__", "spec", "specs"];
const FILE_RE = /(^|\/)(.*\.test\.|.*\.spec\.|test_.*\.py$|.*_test\.go$|.*_test\.rs$)/;
exports.tests = {
    id: "tests",
    label: "Test suite",
    description: "Detectable tests — agents rely on feedback loops.",
    improveSuggestion: "Add a tests/ (or test/, __tests__/, spec/) directory with runnable tests. Document how to run them in AGENTS.md.",
    check: (repo) => {
        for (const d of DIRS) {
            const p = (0, node_path_1.join)(repo, d);
            if ((0, node_fs_1.existsSync)(p) && (0, node_fs_1.statSync)(p).isDirectory()) {
                return {
                    pass: 1,
                    id: "tests",
                    matchedPath: d,
                    label: "Test suite",
                    detail: `Found /${d}`,
                };
            }
        }
        const hits = (0, helpers_1.walkFind)(repo, (rel) => FILE_RE.test(rel), 3, 1);
        if (hits.length > 0) {
            return {
                pass: 0.7,
                id: "tests",
                label: "Test suite",
                matchedPath: hits[0],
                detail: `Test files detected (${hits[0]})`,
            };
        }
        return {
            pass: 0,
            id: "tests",
            label: "Test suite",
            detail: "No test directory or test files found",
        };
    },
};


/***/ }),

/***/ 158:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.typeConfig = void 0;
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const helpers_1 = __nccwpck_require__(742);
const CANDIDATES = ["tsconfig.json", "jsconfig.json", "mypy.ini", ".mypy.ini", "pyrightconfig.json"];
const PYPROJECT_RE = /\[tool\.(mypy|pyright)/;
exports.typeConfig = {
    id: "type_config",
    label: "Type configuration",
    description: "Static types help agents reason about call sites without running code.",
    improveSuggestion: "Add a type config (tsconfig.json for JS/TS, mypy.ini or pyrightconfig.json for Python). Rust/Go are typed by default.",
    check: (repo) => {
        const m = (0, helpers_1.firstExisting)(repo, CANDIDATES);
        if (m) {
            return {
                pass: 1,
                matchedPath: m,
                id: "type_config",
                label: "Type configuration",
                detail: "Type config present",
            };
        }
        const pyproject = (0, node_path_1.join)(repo, "pyproject.toml");
        if ((0, node_fs_1.existsSync)(pyproject) && PYPROJECT_RE.test((0, helpers_1.readSafe)(pyproject))) {
            return {
                pass: 1,
                id: "type_config",
                label: "Type configuration",
                matchedPath: "pyproject.toml",
                detail: "Configured in pyproject.toml",
            };
        }
        if ((0, node_fs_1.existsSync)((0, node_path_1.join)(repo, "Cargo.toml")) || (0, node_fs_1.existsSync)((0, node_path_1.join)(repo, "go.mod"))) {
            return {
                pass: 1,
                id: "type_config",
                label: "Type configuration",
                detail: "Typed language (Rust/Go)",
            };
        }
        return {
            pass: 0,
            id: "type_config",
            label: "Type configuration",
            detail: "No type config found",
        };
    },
};


/***/ }),

/***/ 300:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MODELS = void 0;
exports.MODELS = [
    {
        id: "claude-code",
        label: "Claude Code",
        rationale: "Loads CLAUDE.md at the start of every conversation per Anthropic's memory docs, so AGENTS.md / CLAUDE.md and a fast test loop carry the most weight.",
        sources: ["https://code.claude.com/docs/en/memory"],
        weights: {
            ci: 0.5,
            size: 0.5,
            tests: 1.0,
            readme: 0.7,
            linter: 0.6,
            dev_env: 0.9,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 1.0,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.6,
            contributing: 0.4,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "cursor",
        label: "Cursor",
        rationale: "Per Cursor's Rules docs, reads `.cursor/rules/*.mdc` and AGENTS.md as the canonical repo-side input. Type config and a clean README still aid the codebase index but aren't the docs-cited signal.",
        sources: ["https://cursor.com/docs/context/rules"],
        weights: {
            ci: 0.4,
            size: 0.4,
            tests: 0.7,
            linter: 0.8,
            readme: 1.0,
            dev_env: 0.5,
            gemini_md: 0,
            license: 0.3,
            aider_conf: 0,
            agents_md: 0.8,
            pre_commit: 0.3,
            type_config: 1.0,
            contributing: 0.3,
            cursor_rules: 1.0,
            deps_manifest: 0.8,
            openhands_setup: 0,
        },
    },
    {
        id: "devin",
        label: "Devin",
        rationale: "Operates from a sandboxed Ubuntu VM and runs an 8-step machine setup (deps, secrets, language versions, lint/test commands) per Cognition's repo-setup docs. CI config files alone aren't what the docs ask for — a runnable dev environment is.",
        sources: ["https://docs.devin.ai/onboard-devin/repo-setup"],
        weights: {
            ci: 0.7,
            size: 0.6,
            tests: 0.9,
            linter: 0.5,
            readme: 0.7,
            dev_env: 1.0,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 0.6,
            cursor_rules: 0,
            pre_commit: 0.5,
            type_config: 0.5,
            contributing: 0.5,
            deps_manifest: 0.9,
            openhands_setup: 0,
        },
    },
    {
        id: "gpt-5-codex",
        label: "GPT-5 Codex",
        rationale: "Reads AGENTS.md before doing any work per OpenAI's Codex docs — the strictest AGENTS.md adherent of any agent here. Hierarchical (per-directory) AGENTS.md and AGENTS.override.md are first-class.",
        sources: ["https://developers.openai.com/codex/guides/agents-md"],
        weights: {
            ci: 0.7,
            size: 0.5,
            tests: 0.8,
            linter: 0.6,
            readme: 0.8,
            dev_env: 0.7,
            license: 0.3,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 0.9,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.7,
            contributing: 0.4,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "gemini-cli",
        label: "Gemini CLI",
        rationale: "Reads hierarchical `GEMINI.md` (global → workspace → component-level) at every prompt per Gemini CLI's docs. The long-context advantage favors repos that split context per directory rather than docs-heavy in general.",
        sources: ["https://geminicli.com/docs/cli/gemini-md/"],
        weights: {
            ci: 0.6,
            size: 0.5,
            tests: 0.9,
            linter: 0.7,
            readme: 0.9,
            dev_env: 0.7,
            license: 0.3,
            aider_conf: 0,
            agents_md: 0.7,
            gemini_md: 1.0,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.9,
            contributing: 0.4,
            deps_manifest: 0.8,
            openhands_setup: 0,
        },
    },
    {
        id: "aider",
        label: "Aider",
        rationale: "Auto-lints on every edit by default; runs the configured test command after edits when `--test-cmd` is set (per Aider's lint/test docs). A green linter and a declared test command translate directly into successful commits.",
        sources: ["https://aider.chat/docs/usage/lint-test.html"],
        weights: {
            ci: 0.3,
            size: 0.4,
            tests: 1.0,
            linter: 1.0,
            readme: 0.6,
            dev_env: 0.5,
            license: 0.2,
            gemini_md: 0,
            agents_md: 0.8,
            aider_conf: 0.8,
            cursor_rules: 0,
            pre_commit: 0.3,
            type_config: 0.5,
            contributing: 0.3,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
    {
        id: "openhands",
        label: "OpenHands",
        rationale: "Runs in a sandboxed container and executes `.openhands/setup.sh` at session start per OpenHands' repo-customization docs. Root AGENTS.md is now the preferred always-on instruction surface (microagents are deprecated in favor of it).",
        sources: [
            "https://docs.openhands.dev/usage/prompting/repository",
            "https://docs.openhands.dev/usage/prompting/microagents-overview",
        ],
        weights: {
            ci: 1.0,
            size: 0.7,
            tests: 0.9,
            linter: 0.6,
            readme: 0.7,
            dev_env: 1.0,
            license: 0.4,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 0.5,
            cursor_rules: 0,
            pre_commit: 0.6,
            type_config: 0.5,
            contributing: 0.7,
            deps_manifest: 1.0,
            openhands_setup: 1.0,
        },
    },
    {
        id: "pi",
        label: "Pi",
        rationale: "Minimal terminal coding harness. Loads `AGENTS.md` (or `CLAUDE.md`) at startup — global, parent dirs, then cwd — per the Pi coding-agent README. Sandboxing is deferred to user-installed extensions.",
        sources: ["https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md"],
        weights: {
            ci: 0.4,
            size: 0.5,
            tests: 0.9,
            linter: 0.8,
            readme: 0.7,
            dev_env: 0.6,
            license: 0.2,
            gemini_md: 0,
            aider_conf: 0,
            agents_md: 1.0,
            cursor_rules: 0,
            pre_commit: 0.4,
            type_config: 0.6,
            contributing: 0.3,
            deps_manifest: 0.7,
            openhands_setup: 0,
        },
    },
];


/***/ }),

/***/ 24:
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ 760:
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ 708:
/***/ ((module) => {

module.exports = require("node:process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const node_fs_1 = __nccwpck_require__(24);
const node_path_1 = __nccwpck_require__(760);
const node_process_1 = __nccwpck_require__(708);
const format_1 = __nccwpck_require__(264);
const scorer_1 = __nccwpck_require__(789);
const PROJECT_ROOT_MARKERS = [
    ".git",
    "go.mod",
    "Gemfile",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "readme.md",
    "Cargo.toml",
    "package.json",
    "pyproject.toml",
];
function parseArgs(args) {
    const flags = new Set();
    const positional = [];
    for (const a of args) {
        if (a.startsWith("--")) {
            flags.add(a);
        }
        else {
            positional.push(a);
        }
    }
    return { flags, positional };
}
function bestModelId(scores) {
    const sorted = scores.slice().sort((a, b) => b.score - a.score);
    return sorted[0]?.modelId;
}
function buildWarnings(target) {
    const hasMarker = PROJECT_ROOT_MARKERS.some((m) => (0, node_fs_1.existsSync)((0, node_path_1.join)(target, m)));
    if (hasMarker) {
        return [];
    }
    return [
        `${target} doesn't look like a project root (no package.json / README.md / AGENTS.md / .git found at this path). The score will be low. Run from your project root, or pass the project root path explicitly.`,
    ];
}
function main() {
    const { flags, positional } = parseArgs(node_process_1.argv.slice(2));
    if (flags.has("--help") || flags.has("-h")) {
        node_process_1.stdout.write([
            "Usage: agent-friendly-skill [path] [--summary] [--json]",
            "",
            "Scores the repo at <path> (default: cwd) and prints the result.",
            "",
            "  --summary   one-line human summary (for SessionStart hooks)",
            "  --json      explicit JSON output (default when no flags given)",
            "  -h, --help  print this help",
            "",
        ].join("\n"));
        (0, node_process_1.exit)(0);
    }
    const target = (0, node_path_1.resolve)(positional[0] ?? process.cwd());
    if (!(0, node_fs_1.existsSync)(target)) {
        node_process_1.stderr.write(`agent-friendly: path does not exist: ${target}\n`);
        (0, node_process_1.exit)(2);
    }
    const score = (0, scorer_1.scoreRepo)(target);
    const warnings = buildWarnings(target);
    const topModel = bestModelId(score.modelScores);
    const improvements = topModel ? (0, scorer_1.topImprovements)(topModel, score.signals) : [];
    if (flags.has("--summary")) {
        for (const w of warnings) {
            node_process_1.stderr.write(`agent-friendly: ${w}\n`);
        }
        node_process_1.stdout.write((0, format_1.formatSummary)(score));
        return;
    }
    node_process_1.stdout.write(`${JSON.stringify({ ...score, topImprovements: improvements, warnings }, null, 2)}\n`);
}
main();

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map