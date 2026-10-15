#!/usr/bin/env node
import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { argv, exit, stderr, stdout } from "node:process";

import { parseArgs } from "./args";
import { formatSummary } from "./format";
import { scoreRepo, topImprovements } from "./scoring/scorer";
import type { ModelId } from "./scoring/weights";

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

function bestModelId(scores: ReturnType<typeof scoreRepo>["modelScores"]): ModelId | undefined {
  const sorted = scores.slice().sort((a, b) => b.score - a.score);
  return sorted[0]?.modelId;
}

function buildWarnings(target: string): string[] {
  const hasMarker = PROJECT_ROOT_MARKERS.some((m) => existsSync(join(target, m)));

  if (hasMarker) {
    return [];
  }

  return [
    `${target} doesn't look like a project root (no package.json, README.md, AGENTS.md, .git, or other project marker found at this path). The score will be low. Run from your project root, or pass the project root path explicitly.`,
  ];
}

const KNOWN_FLAGS = new Set(["--summary", "--json", "--help", "-h"]);

const USAGE = [
  "Usage: agent-friendly-skill [path] [--summary] [--json]",
  "",
  "Scores the repo at <path> (default: cwd) and prints the result.",
  "",
  "  --summary   one-line human summary (for SessionStart hooks)",
  "  --json      JSON output (the default)",
  "  -h, --help  print this help",
  "",
].join("\n");

function main(): void {
  const { flags, positional } = parseArgs(argv.slice(2));

  if (flags.has("--help") || flags.has("-h")) {
    stdout.write(USAGE);
    exit(0);
  }

  // A mistyped `--summary` would otherwise print JSON into a hook that expects one line.
  const unknown = [...flags].filter((f) => !KNOWN_FLAGS.has(f));
  if (unknown.length > 0) {
    stderr.write(`agent-friendly: unknown option ${unknown.join(", ")}\n\n${USAGE}`);
    exit(2);
  }

  const target = resolve(positional[0] ?? process.cwd());

  if (!existsSync(target) || !statSync(target).isDirectory()) {
    stderr.write(`agent-friendly: not a directory: ${target}\n`);
    exit(2);
  }

  const score = scoreRepo(target);
  const warnings = buildWarnings(target);
  const topModel = bestModelId(score.modelScores);
  const improvements = topModel ? topImprovements(topModel, score.signals) : [];

  if (flags.has("--summary")) {
    for (const w of warnings) {
      stderr.write(`agent-friendly: ${w}\n`);
    }

    stdout.write(formatSummary(score));
    return;
  }

  stdout.write(`${JSON.stringify({ ...score, topImprovements: improvements, warnings }, null, 2)}\n`);
}

main();
