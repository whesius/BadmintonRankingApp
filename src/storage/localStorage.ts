import type { PlayerProfile, MatchRecord, BonusPointEntry } from "../types/index.ts";

const KEYS = {
  PLAYER: "brc_player",
  MATCHES: "brc_matches",
  BONUS: "brc_bonus",
};

const DEFAULT_PLAYER: PlayerProfile = {
  name: "",
  memberId: "",
  gender: "M",
  classifications: { singles: 12, doubles: 12, mixed: 12 },
  classificationDates: {
    singles: new Date().toISOString().split("T")[0],
    doubles: new Date().toISOString().split("T")[0],
    mixed: new Date().toISOString().split("T")[0],
  },
  lastDemotion: { singles: null, doubles: null, mixed: null },
};

export function loadPlayer(): PlayerProfile {
  const raw = localStorage.getItem(KEYS.PLAYER);
  if (!raw) return { ...DEFAULT_PLAYER };
  return JSON.parse(raw) as PlayerProfile;
}

export function savePlayer(player: PlayerProfile): void {
  localStorage.setItem(KEYS.PLAYER, JSON.stringify(player));
}

export function loadMatches(): MatchRecord[] {
  const raw = localStorage.getItem(KEYS.MATCHES);
  if (!raw) return [];
  return JSON.parse(raw) as MatchRecord[];
}

export function saveMatches(matches: MatchRecord[]): void {
  localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
}

export function loadBonusEntries(): BonusPointEntry[] {
  const raw = localStorage.getItem(KEYS.BONUS);
  if (!raw) return [];
  return JSON.parse(raw) as BonusPointEntry[];
}

export function saveBonusEntries(entries: BonusPointEntry[]): void {
  localStorage.setItem(KEYS.BONUS, JSON.stringify(entries));
}

export function exportAllData(): string {
  return JSON.stringify({
    player: loadPlayer(),
    matches: loadMatches(),
    bonus: loadBonusEntries(),
  }, null, 2);
}

export function importAllData(json: string): void {
  const data = JSON.parse(json);
  if (data.player) savePlayer(data.player);
  if (data.matches) saveMatches(data.matches);
  if (data.bonus) saveBonusEntries(data.bonus);
}

export function clearAllData(): void {
  localStorage.removeItem(KEYS.PLAYER);
  localStorage.removeItem(KEYS.MATCHES);
  localStorage.removeItem(KEYS.BONUS);
}
