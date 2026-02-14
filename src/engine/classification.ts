import { THRESHOLDS, CONFIG } from "../constants/c700.ts";
import { filterValidMatches, countMatchesInWindow } from "./filter.ts";
import { calculateOptimizedAverage } from "./average.ts";
import type { MatchRecord, PlayerProfile, Discipline, ClassificationResult } from "../types/index.ts";

function weeksAgo(dateStr: string | null, referenceDate: Date): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const diff = referenceDate.getTime() - d.getTime();
  return diff / (7 * 24 * 60 * 60 * 1000);
}

export function evaluateDiscipline(
  player: PlayerProfile,
  matches: MatchRecord[],
  discipline: Discipline,
  referenceDate: Date = new Date(),
  options: { skipInactivityCheck?: boolean } = {}
): ClassificationResult {
  const level = player.classifications[discipline];
  const totalInWindow = countMatchesInWindow(matches, discipline, referenceDate);
  const isInactive = totalInWindow < CONFIG.INACTIVITY_MATCH_THRESHOLD;

  // Rising average (round to 1 decimal to ensure display matches logic)
  const risingMatches = filterValidMatches(matches, level, discipline, "rising", referenceDate);
  const risingAverage = Math.round(calculateOptimizedAverage(risingMatches, "rising") * 10) / 10;

  // Falling average (round to 1 decimal to ensure display matches logic)
  const fallingMatches = filterValidMatches(matches, level, discipline, "falling", referenceDate);
  const fallingAverage = Math.round(calculateOptimizedAverage(fallingMatches, "falling") * 10) / 10;

  // Thresholds
  const nextHigher = level - 1;
  const nextLower = level + 1;
  const riseThreshold = nextHigher >= 1 ? THRESHOLDS[nextHigher]?.rise ?? null : null;
  const currentRiseThreshold = THRESHOLDS[level]?.rise ?? null;
  const fallThreshold = nextLower <= 12 ? THRESHOLDS[nextLower]?.fall ?? null : null;

  // Progress to promotion
  let progressToPromotion = 0;
  let gapToPromotion = 0;
  if (riseThreshold !== null) {
    progressToPromotion = Math.min(100, (risingAverage / riseThreshold) * 100);
    gapToPromotion = Math.max(0, riseThreshold - risingAverage);
  }

  // Safe from demotion
  let safeFromDemotion = true;
  if (fallThreshold !== null) {
    safeFromDemotion = fallingAverage > fallThreshold;
  }

  // Determine action
  let action: "promote" | "demote" | "stay" = "stay";

  if (isInactive && !options.skipInactivityCheck) {
    action = "stay";
  } else if (riseThreshold !== null && risingAverage >= riseThreshold) {
    action = "promote";
  } else if (
    currentRiseThreshold !== null &&
    risingAverage < currentRiseThreshold &&
    fallThreshold !== null &&
    fallingAverage <= fallThreshold
  ) {
    // Check demotion protection
    const weeksSinceLastDemotion = weeksAgo(player.lastDemotion[discipline], referenceDate);
    if (weeksSinceLastDemotion >= CONFIG.DEMOTION_PROTECTION_WEEKS) {
      action = "demote";
    }
  }

  return {
    discipline,
    risingAverage,
    fallingAverage,
    riseThreshold,
    fallThreshold,
    action,
    validMatchesRising: risingMatches.length,
    validMatchesFalling: fallingMatches.length,
    totalMatches: totalInWindow,
    isInactive,
    progressToPromotion: Math.round(progressToPromotion * 10) / 10,
    gapToPromotion: Math.round(gapToPromotion * 10) / 10,
    safeFromDemotion,
  };
}

export function evaluateAll(
  player: PlayerProfile,
  matches: MatchRecord[],
  referenceDate: Date = new Date()
): Record<Discipline, ClassificationResult> {
  return {
    singles: evaluateDiscipline(player, matches, "singles", referenceDate),
    doubles: evaluateDiscipline(player, matches, "doubles", referenceDate),
    mixed: evaluateDiscipline(player, matches, "mixed", referenceDate),
  };
}
