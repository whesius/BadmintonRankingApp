import { describe, it, expect } from "vitest";
import { filterValidMatches } from "../src/engine/filter.ts";
import { calculateOptimizedAverage } from "../src/engine/average.ts";
import type { MatchRecord } from "../src/types/index.ts";

// Worked example from badmintonRankingRules.md section 13
// Player: Level 8 in singles, 10 matches

const baseDate = "2026-01-15";
const refDate = new Date("2026-02-01");

function m(id: number, opLevel: number, result: "win" | "loss", points: number): MatchRecord {
  return {
    id: String(id),
    date: baseDate,
    discipline: "singles",
    result,
    walkover: false,
    competition: "interclub",
    opponentLevel: opLevel,
    points,
    playerLevelAtTime: 8,
  };
}

const matches: MatchRecord[] = [
  m(1,  8, "win",  217),
  m(2,  9, "win",  150),
  m(3,  7, "loss", 0),
  m(4,  8, "win",  217),
  m(5,  8, "loss", 0),
  m(6,  9, "win",  150),
  m(7,  6, "loss", 0),
  m(8,  8, "win",  217),
  m(9,  7, "win",  313),
  m(10, 9, "loss", 0),
];

describe("Worked Example from C700 Rules", () => {
  it("filters rising average matches correctly", () => {
    const valid = filterValidMatches(matches, 8, "singles", "rising", refDate);
    // Should include: all 6 wins + 3 losses (vs 7, 8, 9)
    // Should exclude: loss vs level 6 (2 levels higher)
    expect(valid.length).toBe(9);

    // Match 7 (loss vs level 6) should be excluded
    expect(valid.find((v) => v.id === "7")).toBeUndefined();
  });

  it("calculates rising average = ~140.4", () => {
    const valid = filterValidMatches(matches, 8, "singles", "rising", refDate);
    const avg = calculateOptimizedAverage(valid, "rising");
    // Expected: all 9 matches counted (3 losses + 6 wins all improve avg)
    // Total = 313 + 217 + 217 + 217 + 150 + 150 = 1264
    // Count = 9 (3 losses + 6 wins)
    // Avg = 1264 / 9 = 140.4
    expect(avg).toBeCloseTo(140.4, 0);
  });

  it("rising average < promotion threshold (152)", () => {
    const valid = filterValidMatches(matches, 8, "singles", "rising", refDate);
    const avg = calculateOptimizedAverage(valid, "rising");
    expect(avg).toBeLessThan(152); // Level 7 rise threshold
  });

  it("filters falling average matches correctly", () => {
    const valid = filterValidMatches(matches, 8, "singles", "falling", refDate);
    // Falling: exclude losses vs any higher classification
    // Losses vs level 7 (higher) → excluded
    // Losses vs level 6 (higher) → excluded
    // Losses vs level 8 (same) → included
    // Losses vs level 9 (lower) → included
    // So: 6 wins + 2 losses = 8 valid
    expect(valid.length).toBe(8);

    // Match 3 (loss vs 7) and match 7 (loss vs 6) excluded
    expect(valid.find((v) => v.id === "3")).toBeUndefined();
    expect(valid.find((v) => v.id === "7")).toBeUndefined();
  });
});
