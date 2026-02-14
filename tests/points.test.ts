import { describe, it, expect } from "vitest";
import { calculatePoints } from "../src/engine/points.ts";

describe("calculatePoints", () => {
  it("returns correct points for singles win at each level", () => {
    const expected: Record<number, number> = {
      1: 2831, 2: 1961, 3: 1359, 4: 942, 5: 652, 6: 452,
      7: 313, 8: 217, 9: 150, 10: 104, 11: 72, 12: 50,
    };
    for (const [level, pts] of Object.entries(expected)) {
      expect(calculatePoints({
        result: "win", walkover: false, discipline: "singles", opponentLevel: Number(level),
        opponent1Level: undefined, opponent2Level: undefined,
      })).toBe(pts);
    }
  });

  it("returns 0 for a loss", () => {
    expect(calculatePoints({
      result: "loss", walkover: false, discipline: "singles", opponentLevel: 8,
      opponent1Level: undefined, opponent2Level: undefined,
    })).toBe(0);
  });

  it("returns 0 for a walkover", () => {
    expect(calculatePoints({
      result: "win", walkover: true, discipline: "singles", opponentLevel: 8,
      opponent1Level: undefined, opponent2Level: undefined,
    })).toBe(0);
  });

  it("returns average for doubles win", () => {
    // Opponents level 6 (452) and level 8 (217) → avg = 334.5
    expect(calculatePoints({
      result: "win", walkover: false, discipline: "doubles",
      opponentLevel: undefined, opponent1Level: 6, opponent2Level: 8,
    })).toBe(334.5);
  });

  it("returns average for mixed win", () => {
    // Opponents level 7 (313) and level 7 (313) → avg = 313
    expect(calculatePoints({
      result: "win", walkover: false, discipline: "mixed",
      opponentLevel: undefined, opponent1Level: 7, opponent2Level: 7,
    })).toBe(313);
  });
});
