import { CONFIG } from "../constants/c700.ts";
import type { MatchRecord, AverageType } from "../types/index.ts";

export function calculateOptimizedAverage(
  validMatches: MatchRecord[],
  averageType: AverageType
): number {
  if (validMatches.length === 0) return 0;

  const losses = validMatches.filter((m) => m.result === "loss");
  const wins = validMatches
    .filter((m) => m.result === "win")
    .sort((a, b) => b.points - a.points); // descending

  // Start with all losses
  let totalPoints = 0; // losses contribute 0 points
  let count = losses.length;
  let currentAvg = 0;

  // Iteratively add wins (highest first), stop when average would decrease
  for (const win of wins) {
    const newTotal = totalPoints + win.points;
    const newCount = count + 1;
    const newAvg = newTotal / newCount;

    if (newCount > 1 && newAvg < currentAvg) {
      // Adding this win would lower the average — stop
      break;
    }

    totalPoints = newTotal;
    count = newCount;
    currentAvg = newAvg;
  }

  // Apply minimum divisor rule
  if (count < CONFIG.MIN_MATCHES_DIVISOR) {
    if (averageType === "rising") {
      // Rising: always divide by 7 minimum
      return totalPoints / CONFIG.MIN_MATCHES_DIVISOR;
    } else {
      // Falling: divide by actual count (more lenient)
      return count === 0 ? 0 : totalPoints / count;
    }
  }

  return count === 0 ? 0 : totalPoints / count;
}
