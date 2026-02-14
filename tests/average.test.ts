import { describe, it, expect } from "vitest";
import { calculateOptimizedAverage } from "../src/engine/average.ts";
import type { MatchRecord } from "../src/types/index.ts";

function makeMatch(result: "win" | "loss", points: number): MatchRecord {
  return {
    id: Math.random().toString(),
    date: "2026-01-01",
    discipline: "singles",
    result,
    walkover: false,
    competition: "interclub",
    opponentLevel: 8,
    points,
    playerLevelAtTime: 8,
  };
}

describe("calculateOptimizedAverage", () => {
  it("returns 0 for empty matches", () => {
    expect(calculateOptimizedAverage([], "rising")).toBe(0);
  });

  it("calculates optimized average — drops low wins that lower avg", () => {
    // 2 losses (0 pts) + wins: 313, 217, 217, 50
    // Start with 2 losses: count=2, total=0, avg=0
    // +313: count=3, total=313, avg=104.3 → keeps improving
    // +217: count=4, total=530, avg=132.5 → improving
    // +217: count=5, total=747, avg=149.4 → improving
    // +50:  count=6, total=797, avg=132.8 → LOWER, stop
    // Optimized: 5 matches, total=747. Since 5 < 7 (rising), divide by 7
    const matches = [
      makeMatch("loss", 0),
      makeMatch("loss", 0),
      makeMatch("win", 313),
      makeMatch("win", 217),
      makeMatch("win", 217),
      makeMatch("win", 50),
    ];
    const avg = calculateOptimizedAverage(matches, "rising");
    expect(avg).toBeCloseTo(747 / 7, 1); // 106.7
  });

  it("applies minimum 7 divisor for rising average", () => {
    // Only 2 wins (313, 217), no losses
    // Optimization: only 313 counts (adding 217 lowers avg from 313 to 265)
    // 1 match < 7 → divide by 7: 313/7 = 44.7
    const matches = [makeMatch("win", 313), makeMatch("win", 217)];
    const avg = calculateOptimizedAverage(matches, "rising");
    expect(avg).toBeCloseTo(313 / 7, 1);
  });

  it("uses actual count for falling average when < 7", () => {
    // Only 2 wins (313, 217), no losses
    // Optimization: only 313 counts (adding 217 lowers avg)
    // 1 match < 7, falling: divide by actual count (1)
    const matches = [makeMatch("win", 313), makeMatch("win", 217)];
    const avg = calculateOptimizedAverage(matches, "falling");
    expect(avg).toBeCloseTo(313 / 1, 1); // 313
  });

  it("returns 0 for all losses", () => {
    const matches = [makeMatch("loss", 0), makeMatch("loss", 0), makeMatch("loss", 0)];
    expect(calculateOptimizedAverage(matches, "rising")).toBe(0);
  });

  it("includes all wins when losses create a low base", () => {
    // 5 losses + 3 wins: 313, 217, 150
    // Start with 5 losses: count=5, total=0, avg=0
    // +313: count=6, total=313, avg=52.2 → improving
    // +217: count=7, total=530, avg=75.7 → improving
    // +150: count=8, total=680, avg=85.0 → improving
    // All 8 matches count, >= 7 so no min divisor
    const matches = [
      ...Array.from({ length: 5 }, () => makeMatch("loss", 0)),
      makeMatch("win", 313),
      makeMatch("win", 217),
      makeMatch("win", 150),
    ];
    const avg = calculateOptimizedAverage(matches, "rising");
    expect(avg).toBeCloseTo(680 / 8, 1); // 85.0
  });
});
