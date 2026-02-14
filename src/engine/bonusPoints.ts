import { BONUS_THRESHOLDS } from "../constants/c700.ts";
import type { BonusPointEntry, Discipline, Gender } from "../types/index.ts";

export function calculateBonusPoints(
  finish: "winner" | "finalist" | "semifinalist",
  playersAtSameLevel: number,
  playersAtHigherLevel: number
): number {
  const winnerPoints = (1 * playersAtSameLevel) + (2 * playersAtHigherLevel);

  switch (finish) {
    case "winner": return winnerPoints;
    case "finalist": return Math.round(winnerPoints * 0.5);
    case "semifinalist": return Math.round(winnerPoints * 0.25);
  }
}

export function getBonusTotal(
  entries: BonusPointEntry[],
  discipline: Discipline,
  referenceDate: Date = new Date()
): number {
  const windowStart = new Date(referenceDate);
  windowStart.setDate(windowStart.getDate() - 52 * 7);

  return entries
    .filter((e) => {
      if (e.discipline !== discipline) return false;
      const d = new Date(e.date);
      return d >= windowStart && d <= referenceDate;
    })
    .reduce((sum, e) => sum + e.points, 0);
}

export function getBonusThreshold(discipline: Discipline, gender: Gender): number {
  return BONUS_THRESHOLDS[discipline][gender];
}

export function getBonusProgress(
  entries: BonusPointEntry[],
  discipline: Discipline,
  gender: Gender,
  referenceDate: Date = new Date()
): { total: number; threshold: number; progress: number } {
  const total = getBonusTotal(entries, discipline, referenceDate);
  const threshold = getBonusThreshold(discipline, gender);
  return {
    total,
    threshold,
    progress: Math.min(100, (total / threshold) * 100),
  };
}
