import { v4 as uuidv4 } from "uuid";
import { calculatePoints } from "./points.ts";
import { evaluateDiscipline } from "./classification.ts";
import type { MatchRecord, PlayerProfile, Discipline, SimulationMatch, ClassificationResult } from "../types/index.ts";

export function simulateMatches(
  player: PlayerProfile,
  existingMatches: MatchRecord[],
  hypotheticalMatches: SimulationMatch[],
  discipline: Discipline,
  referenceDate: Date = new Date()
): ClassificationResult {
  const today = referenceDate.toISOString().split("T")[0];

  const simulated: MatchRecord[] = hypotheticalMatches.map((m) => {
    const record: MatchRecord = {
      id: uuidv4(),
      date: today,
      discipline: m.discipline,
      result: m.result,
      walkover: false,
      competition: "tournament",
      opponentLevel: m.opponentLevel,
      partnerLevel: m.partnerLevel,
      opponent1Level: m.opponent1Level,
      opponent2Level: m.opponent2Level,
      points: 0,
      playerLevelAtTime: player.classifications[m.discipline],
    };
    record.points = calculatePoints(record);
    return record;
  });

  const allMatches = [...existingMatches, ...simulated];
  return evaluateDiscipline(player, allMatches, discipline, referenceDate);
}

export function winsNeededToPromote(
  player: PlayerProfile,
  existingMatches: MatchRecord[],
  discipline: Discipline,
  opponentLevel: number,
  referenceDate: Date = new Date()
): number {
  for (let n = 1; n <= 20; n++) {
    const hypothetical: SimulationMatch[] = Array.from({ length: n }, () => ({
      discipline,
      result: "win" as const,
      opponentLevel,
    }));
    const result = simulateMatches(player, existingMatches, hypothetical, discipline, referenceDate);
    if (result.action === "promote") return n;
  }
  return -1; // Cannot promote with 20 wins at this level
}
