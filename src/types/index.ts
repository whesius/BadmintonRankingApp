export type Discipline = "singles" | "doubles" | "mixed";
export type MatchResult = "win" | "loss";
export type Gender = "M" | "F";
export type Competition = "tournament" | "interclub" | "championship";
export type AverageType = "rising" | "falling";

export interface PlayerProfile {
  name: string;
  memberId: string;
  gender: Gender;
  classifications: Record<Discipline, number>;
  classificationDates: Record<Discipline, string>;
  lastDemotion: Record<Discipline, string | null>;
}

export interface MatchRecord {
  id: string;
  date: string;
  discipline: Discipline;
  result: MatchResult;
  walkover: boolean;
  competition: Competition;
  opponentLevel?: number;
  partnerLevel?: number;
  opponent1Level?: number;
  opponent2Level?: number;
  points: number;
  playerLevelAtTime: number;
}

export interface ClassificationResult {
  discipline: Discipline;
  risingAverage: number;
  fallingAverage: number;
  riseThreshold: number | null;
  fallThreshold: number | null;
  action: "promote" | "demote" | "stay";
  validMatchesRising: number;
  validMatchesFalling: number;
  totalMatches: number;
  isInactive: boolean;
  progressToPromotion: number;
  gapToPromotion: number;
  safeFromDemotion: boolean;
}

export interface SimulationMatch {
  discipline: Discipline;
  result: MatchResult;
  opponentLevel: number;
  partnerLevel?: number;
  opponent1Level?: number;
  opponent2Level?: number;
}

export interface BonusPointEntry {
  id: string;
  date: string;
  discipline: Discipline;
  finish: "winner" | "finalist" | "semifinalist";
  drawSize: number;
  playersAtSameLevel: number;
  playersAtHigherLevel: number;
  points: number;
}
