#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { argv, exit, stderr, stdout } from "node:process";

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

function parseArgs(args: string[]): {
  flags: Set<string>;
  positional: string[];
} {
  const flags = new Set<string>();
  const positional: string[] = [];

  for (const a of args) {
    if (a.startsWith("--")) {
      flags.add(a);
    } else {
      positional.push(a);
    }
  }

  return { flags, positional };
}

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
    `${target} doesn't look like a project root (no package.json / README.md / AGENTS.md / .git found at this path). The score will be low. Run from your project root, or pass the project root path explicitly.`,
  ];
}

function main(): void {
  const { flags, positional } = parseArgs(argv.slice(2));

  if (flags.has("--help") || flags.has("-h")) {
    stdout.write(
      [
        "Usage: agent-friendly-skill [path] [--summary] [--json]",
        "",
        "Scores the repo at <path> (default: cwd) and prints the result.",
        "",
        "  --summary   one-line human summary (for SessionStart hooks)",
        "  --json      explicit JSON output (default when no flags given)",
        "  -h, --help  print this help",
        "",
      ].join("\n"),
    );
    exit(0);
  }

  const target = resolve(positional[0] ?? process.cwd());

  if (!existsSync(target)) {
    stderr.write(`agent-friendly: path does not exist: ${target}\n`);
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
