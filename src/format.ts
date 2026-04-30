import { SCORE_THRESHOLD_GOOD, SCORE_THRESHOLD_MID } from "./constants/scoring";
import type { RepoScore } from "./scoring/scorer";

export function bandFor(overall: number): "high" | "mid" | "low" {
  if (overall >= SCORE_THRESHOLD_GOOD) {
    return "high";
  }

  if (overall >= SCORE_THRESHOLD_MID) {
    return "mid";
  }

  return "low";
}

export function formatSummary(score: RepoScore): string {
  const band = bandFor(score.overall);
  const sorted = score.modelScores.slice().sort((a, b) => b.score - a.score);
  const best = sorted[0];

  const head = `agent-friendly: ${score.overall} (${band})`;
  const tail = best ? ` · best: ${best.modelLabel} ${best.score}` : "";

  return `${head}${tail}\n`;
}
