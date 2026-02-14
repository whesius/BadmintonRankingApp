import { POINTS_TABLE } from "../constants/c700.ts";
import type { MatchRecord } from "../types/index.ts";

export function calculatePoints(match: Pick<MatchRecord, "result" | "walkover" | "discipline" | "opponentLevel" | "opponent1Level" | "opponent2Level">): number {
  if (match.walkover) return 0;
  if (match.result === "loss") return 0;

  if (match.discipline === "singles") {
    const level = match.opponentLevel;
    if (!level || level < 1 || level > 12) return 0;
    return POINTS_TABLE[level];
  }

  // Doubles or mixed
  const l1 = match.opponent1Level;
  const l2 = match.opponent2Level;
  if (!l1 || !l2 || l1 < 1 || l1 > 12 || l2 < 1 || l2 > 12) return 0;
  return (POINTS_TABLE[l1] + POINTS_TABLE[l2]) / 2;
}
