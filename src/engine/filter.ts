import { CONFIG } from "../constants/c700.ts";
import type { MatchRecord, Discipline, AverageType } from "../types/index.ts";

function getWindowStart(referenceDate: Date): Date {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - CONFIG.ROLLING_WINDOW_WEEKS * 7);
  return start;
}

function isLossExcludedRising(match: MatchRecord, playerLevel: number): boolean {
  if (match.result === "win") return false;

  if (match.discipline === "singles") {
    const opponentLevel = match.opponentLevel ?? 12;
    // Exclude if opponent is more than 1 level higher (lower number = higher level)
    return (playerLevel - opponentLevel) > CONFIG.LOSS_DIFF_RISING;
  }

  // Doubles/mixed: compare sum of levels
  const o1 = match.opponent1Level ?? 12;
  const o2 = match.opponent2Level ?? 12;
  const partnerLevel = match.partnerLevel ?? playerLevel;
  const opponentSum = o1 + o2;
  const playerSum = playerLevel + partnerLevel;
  // Exclude if opponents' sum is more than 1 lower (= stronger) than player pair sum
  return (playerSum - opponentSum) > CONFIG.LOSS_DIFF_RISING;
}

function isLossExcludedFalling(match: MatchRecord, playerLevel: number): boolean {
  if (match.result === "win") return false;

  if (match.discipline === "singles") {
    const opponentLevel = match.opponentLevel ?? 12;
    // Exclude if opponent is any higher classification (lower number)
    return opponentLevel < playerLevel;
  }

  // Doubles/mixed: exclude if opponents are stronger (lower sum)
  const o1 = match.opponent1Level ?? 12;
  const o2 = match.opponent2Level ?? 12;
  const partnerLevel = match.partnerLevel ?? playerLevel;
  const opponentSum = o1 + o2;
  const playerSum = playerLevel + partnerLevel;
  return opponentSum < playerSum;
}

export function filterValidMatches(
  matches: MatchRecord[],
  playerLevel: number,
  discipline: Discipline,
  averageType: AverageType,
  referenceDate: Date = new Date()
): MatchRecord[] {
  const windowStart = getWindowStart(referenceDate);

  // Filter to discipline, within window, not walkovers
  let filtered = matches.filter((m) => {
    if (m.discipline !== discipline) return false;
    if (m.walkover) return false;
    const matchDate = new Date(m.date);
    return matchDate >= windowStart && matchDate <= referenceDate;
  });

  // Sort chronologically and take last 20
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (filtered.length > CONFIG.MAX_VALID_MATCHES) {
    filtered = filtered.slice(filtered.length - CONFIG.MAX_VALID_MATCHES);
  }

  // Filter losses based on average type
  if (averageType === "rising") {
    filtered = filtered.filter((m) => !isLossExcludedRising(m, playerLevel));
  } else {
    filtered = filtered.filter((m) => !isLossExcludedFalling(m, playerLevel));
  }

  return filtered;
}

export function countMatchesInWindow(
  matches: MatchRecord[],
  discipline: Discipline,
  referenceDate: Date = new Date()
): number {
  const windowStart = getWindowStart(referenceDate);
  return matches.filter((m) => {
    if (m.discipline !== discipline) return false;
    if (m.walkover) return false;
    const matchDate = new Date(m.date);
    return matchDate >= windowStart && matchDate <= referenceDate;
  }).length;
}
