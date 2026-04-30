import { strict as assert } from "node:assert";
import { test } from "node:test";

import { bandFor, formatSummary } from "../src/format";
import type { RepoScore } from "../src/scoring/scorer";

test("bandFor maps to high/mid/low at the documented thresholds", () => {
  assert.equal(bandFor(80), "high");
  assert.equal(bandFor(79.9), "mid");
  assert.equal(bandFor(60), "mid");
  assert.equal(bandFor(59.9), "low");
  assert.equal(bandFor(0), "low");
  assert.equal(bandFor(100), "high");
});

test("formatSummary renders overall + best model on a single line", () => {
  const score: RepoScore = {
    overall: 87.4,
    signals: [],
    modelScores: [
      { modelId: "claude-code", modelLabel: "Claude Code", score: 89.2, contributions: [] },
      { modelId: "cursor", modelLabel: "Cursor", score: 78.1, contributions: [] },
    ],
  };

  const out = formatSummary(score);
  assert.equal(out, "agent-friendly: 87.4 (high) · best: Claude Code 89.2\n");
});

test("formatSummary handles empty modelScores without throwing", () => {
  const score: RepoScore = {
    overall: 0,
    signals: [],
    modelScores: [],
  };

  const out = formatSummary(score);
  assert.equal(out, "agent-friendly: 0 (low)\n");
});
