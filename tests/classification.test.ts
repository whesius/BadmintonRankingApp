import { describe, it, expect } from "vitest";
import { evaluateDiscipline } from "../src/engine/classification.ts";
import { simulateMatches, winsNeededToPromote } from "../src/engine/simulator.ts";
import type { MatchRecord, PlayerProfile } from "../src/types/index.ts";

const refDate = new Date("2026-02-01");
const matchDate = "2026-01-15";

function makePlayer(level: number): PlayerProfile {
  return {
    name: "Test",
    memberId: "12345",
    gender: "M",
    classifications: { singles: level, doubles: level, mixed: level },
    classificationDates: { singles: "2025-01-01", doubles: "2025-01-01", mixed: "2025-01-01" },
    lastDemotion: { singles: null, doubles: null, mixed: null },
  };
}

function makeMatch(id: number, result: "win" | "loss", points: number, playerLevel: number): MatchRecord {
  return {
    id: String(id),
    date: matchDate,
    discipline: "singles",
    result,
    walkover: false,
    competition: "tournament",
    opponentLevel: 8,
    points,
    playerLevelAtTime: playerLevel,
  };
}

describe("Classification — rounding consistency", () => {
  it("promotes when rounded average meets threshold (rounding bug fix)", () => {
    // Construct 7 wins where raw avg = 151.97... which rounds to 152.0
    // Threshold to promote from level 8 to level 7 = 152
    // With 7 identical wins at 151.97 pts: avg = 151.97, rounds to 152.0
    // BUG (before fix): gap rounds to 0.0 but action = "stay" → "Still need 0.0 more"
    // FIX: avg is rounded before comparison, so 152.0 >= 152 → action = "promote"
    const player = makePlayer(8);
    const matches = Array.from({ length: 7 }, (_, i) =>
      makeMatch(i + 1, "win", 151.97, 8)
    );

    const result = evaluateDiscipline(player, matches, "singles", refDate);

    expect(result.risingAverage).toBe(152.0);
    expect(result.gapToPromotion).toBe(0);
    expect(result.action).toBe("promote");
  });

  it("does not promote when rounded average is still below threshold", () => {
    // 7 wins at 151.5 pts: avg = 151.5, rounds to 151.5
    // 151.5 < 152 → stay, gap = 0.5
    const player = makePlayer(8);
    const matches = Array.from({ length: 7 }, (_, i) =>
      makeMatch(i + 1, "win", 151.5, 8)
    );

    const result = evaluateDiscipline(player, matches, "singles", refDate);

    expect(result.risingAverage).toBe(151.5);
    expect(result.gapToPromotion).toBe(0.5);
    expect(result.action).toBe("stay");
  });

  it("gapToPromotion is 0 implies action is promote (invariant)", () => {
    // Clear promotion: 7 wins at 200 pts each → avg = 200
    // Threshold for level 7 = 152 → 200 >= 152 → promote
    const player = makePlayer(8);
    const matches = Array.from({ length: 7 }, (_, i) =>
      makeMatch(i + 1, "win", 200, 8)
    );

    const result = evaluateDiscipline(player, matches, "singles", refDate);

    expect(result.gapToPromotion).toBe(0);
    expect(result.action).toBe("promote");
  });
});

describe("Classification — inactivity in simulator", () => {
  it("simulator promotes even with < 3 matches (inactivity bug fix)", () => {
    // Player at level 12, 0 real matches, simulates 1 win vs level 5 (652 pts)
    // avg = 652/7 = 93.14, threshold for level 11 = 35
    // 93.14 >= 35 → should promote in simulator
    // BUG (before fix): isInactive (1 < 3) forces action = "stay" → "Still need 0.0 more"
    // FIX: simulator skips inactivity check
    const player = makePlayer(12);
    const noMatches: MatchRecord[] = [];

    const result = simulateMatches(
      player, noMatches,
      [{ discipline: "singles", result: "win", opponentLevel: 5 }],
      "singles", refDate
    );

    expect(result.risingAverage).toBeGreaterThan(35);
    expect(result.gapToPromotion).toBe(0);
    expect(result.action).toBe("promote");
  });

  it("winsNeededToPromote returns 1 not 3 for easy promotion (inactivity bug fix)", () => {
    // Player at level 12, 0 real matches, win vs level 5 (652 pts)
    // 1 win gives avg = 652/7 = 93.14 >= 35 (level 11 threshold) → should need only 1
    // BUG (before fix): inactivity required 3 matches before promotion could trigger,
    // so winsNeededToPromote returned 3 instead of 1
    const player = makePlayer(12);
    const noMatches: MatchRecord[] = [];

    const needed = winsNeededToPromote(player, noMatches, "singles", 5, refDate);

    expect(needed).toBe(1);
  });

  it("simulator doubles: wins earn points using opponentLevel as both opponents", () => {
    // Player at level 8 doubles, 0 real matches, simulates 1 win vs level 5
    // For doubles, opponent1Level and opponent2Level should default to opponentLevel (5)
    // Points = (POINTS_TABLE[5] + POINTS_TABLE[5]) / 2 = 652
    // avg = 652/7 = 93.1 >= 105 (level 8 rise threshold)? No, 93.1 < 105
    // But with enough wins it should work. Let's try 7 wins:
    // avg = 652, threshold = 105 → 652 >= 105 → promote
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const result = simulateMatches(
      player, noMatches,
      Array.from({ length: 7 }, () => ({
        discipline: "doubles" as const, result: "win" as const, opponentLevel: 5,
      })),
      "doubles", refDate
    );

    // With 7 wins at 652 pts each, avg = 652. Must promote (threshold 105).
    expect(result.risingAverage).toBe(652);
    expect(result.action).toBe("promote");
  });

  it("simulator mixed: wins earn points using opponentLevel as both opponents", () => {
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const result = simulateMatches(
      player, noMatches,
      Array.from({ length: 7 }, () => ({
        discipline: "mixed" as const, result: "win" as const, opponentLevel: 5,
      })),
      "mixed", refDate
    );

    expect(result.risingAverage).toBe(652);
    expect(result.action).toBe("promote");
  });

  it("winsNeededToPromote works for doubles", () => {
    // Player level 8 doubles, threshold to promote = level 7 rise = 152
    // Win vs level 8 opponents: points = (217+217)/2 = 217
    // n=4: 868/7 = 124.0 < 152 → no
    // n=5: 1085/7 = 155.0 >= 152 → yes
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const needed = winsNeededToPromote(player, noMatches, "doubles", 8, refDate);

    expect(needed).toBe(5);
  });

  it("doubles simulated win earns non-zero points (0-points bug fix)", () => {
    // BUG (before fix): simulator only set opponentLevel, but calculatePoints
    // for doubles needs opponent1Level + opponent2Level → got 0 points for every win.
    // Result: rising avg stuck at 0 no matter how many wins added.
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const result = simulateMatches(
      player, noMatches,
      [{ discipline: "doubles", result: "win", opponentLevel: 8 }],
      "doubles", refDate
    );

    // 1 win at (217+217)/2 = 217 pts, count=1 < 7 → avg = 217/7 = 31.0
    // BUG: avg was 0 because points were 0
    expect(result.risingAverage).toBe(31.0);
  });

  it("mixed simulated win earns non-zero points (0-points bug fix)", () => {
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const result = simulateMatches(
      player, noMatches,
      [{ discipline: "mixed", result: "win", opponentLevel: 8 }],
      "mixed", refDate
    );

    expect(result.risingAverage).toBe(31.0);
  });

  it("doubles gap decreases as simulated wins are added", () => {
    // Verifies the gap actually shrinks — before fix it stayed constant
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const result1 = simulateMatches(
      player, noMatches,
      [{ discipline: "doubles", result: "win", opponentLevel: 8 }],
      "doubles", refDate
    );
    const result3 = simulateMatches(
      player, noMatches,
      Array.from({ length: 3 }, () => ({
        discipline: "doubles" as const, result: "win" as const, opponentLevel: 8,
      })),
      "doubles", refDate
    );

    expect(result3.gapToPromotion).toBeLessThan(result1.gapToPromotion);
  });

  it("winsNeededToPromote works for mixed", () => {
    // Same as doubles — mixed should also default opponent1/2 from opponentLevel
    const player = makePlayer(8);
    const noMatches: MatchRecord[] = [];

    const needed = winsNeededToPromote(player, noMatches, "mixed", 8, refDate);

    // Same calc as doubles: 5 wins at 217 → 1085/7 = 155.0 >= 152
    expect(needed).toBe(5);
  });

  it("dashboard still respects inactivity check", () => {
    // Same scenario but via evaluateDiscipline (dashboard context)
    // Should stay inactive — action = "stay"
    const player = makePlayer(12);
    const matches = [makeMatch(1, "win", 652, 12)];

    const result = evaluateDiscipline(player, matches, "singles", refDate);

    expect(result.isInactive).toBe(true);
    expect(result.action).toBe("stay");
  });
});
