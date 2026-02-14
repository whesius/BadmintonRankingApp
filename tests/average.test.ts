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

  it("includes low wins when count < 7 for rising (min-7 divisor fix)", () => {
    // 2 losses (0 pts) + wins: 313, 217, 217, 50
    // Start with 2 losses: count=2, total=0, avg=0
    // +313: count=3, avg=104.3 → improving
    // +217: count=4, avg=132.5 → improving
    // +217: count=5, avg=149.4 → improving
    // +50:  count=6, avg=132.8 → per-match avg drops, BUT count(6) <= 7
    //       and rising uses min-7 divisor, so always include (797/7 > 747/7)
    // All 6 matches included. Since 6 < 7 (rising), divide by 7: 797/7 = 113.9
    const matches = [
      makeMatch("loss", 0),
      makeMatch("loss", 0),
      makeMatch("win", 313),
      makeMatch("win", 217),
      makeMatch("win", 217),
      makeMatch("win", 50),
    ];
    const avg = calculateOptimizedAverage(matches, "rising");
    expect(avg).toBeCloseTo(797 / 7, 1); // 113.9
  });

  it("includes all wins for rising when count < 7 (min-7 divisor fix)", () => {
    // Only 2 wins (313, 217), no losses
    // Per-match: 313 alone gives avg 313, adding 217 lowers to 265 → old code excluded it
    // But with min-7 divisor: 530/7 = 75.7 > 313/7 = 44.7 → include both
    const matches = [makeMatch("win", 313), makeMatch("win", 217)];
    const avg = calculateOptimizedAverage(matches, "rising");
    expect(avg).toBeCloseTo(530 / 7, 1); // 75.7
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

  it("falling average still excludes low wins when count < 7", () => {
    // Falling average uses actual count as divisor, so normal optimization applies
    // 0 losses, wins [313, 217]: 313 alone = 313/1 = 313. Adding 217 = 530/2 = 265 < 313 → exclude
    const matches = [makeMatch("win", 313), makeMatch("win", 217)];
    const avg = calculateOptimizedAverage(matches, "falling");
    expect(avg).toBeCloseTo(313 / 1, 1); // 313
  });

  it("normal optimization kicks in once count reaches 7 (rising)", () => {
    // 5 losses + wins [313, 217, 150, 50]
    // All losses: count=5, avg=0
    // +313: count=6, avg=52.2 → include
    // +217: count=7, avg=75.7 → include (count hits 7)
    // +150: count=8, avg=85.0 → 85.0 > 75.7 → include (normal optimization, count > 7)
    // +50:  count=9, avg=81.1 → 81.1 < 85.0 → BREAK (normal optimization, count > 7)
    // count=8 >= 7, avg = 680/8 = 85.0
    const matches = [
      ...Array.from({ length: 5 }, () => makeMatch("loss", 0)),
      makeMatch("win", 313),
      makeMatch("win", 217),
      makeMatch("win", 150),
      makeMatch("win", 50),
    ];
    const avg = calculateOptimizedAverage(matches, "rising");
    expect(avg).toBeCloseTo(680 / 8, 1); // 85.0
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
