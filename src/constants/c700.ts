// Official C700 2024 Points Table (Artikel 715.2)
export const POINTS_TABLE: Record<number, number> = {
  1: 2831,
  2: 1961,
  3: 1359,
  4: 942,
  5: 652,
  6: 452,
  7: 313,
  8: 217,
  9: 150,
  10: 104,
  11: 72,
  12: 50,
};

// Official C700 2024 Thresholds (Artikel 709)
export const THRESHOLDS: Record<number, { rise: number | null; fall: number | null }> = {
  1:  { rise: 1373, fall: null },
  2:  { rise: 951,  fall: 991 },
  3:  { rise: 659,  fall: 686 },
  4:  { rise: 457,  fall: 476 },
  5:  { rise: 316,  fall: 330 },
  6:  { rise: 219,  fall: 228 },
  7:  { rise: 152,  fall: 158 },
  8:  { rise: 105,  fall: 110 },
  9:  { rise: 73,   fall: 76 },
  10: { rise: 51,   fall: 53 },
  11: { rise: 35,   fall: 36 },
  12: { rise: null,  fall: 25 },
};

export const CONFIG = {
  ROLLING_WINDOW_WEEKS: 52,
  MAX_VALID_MATCHES: 20,
  MIN_MATCHES_DIVISOR: 7,
  MAX_DISCIPLINE_DIFF: 2,
  INACTIVITY_MATCH_THRESHOLD: 3,
  INACTIVITY_DROP_WEEKS: 104,
  DEMOTION_PROTECTION_WEEKS: 26,
  LOSS_DIFF_RISING: 1,
  LOSS_DIFF_FALLING: 0,
} as const;

// Bonus points thresholds (December 2024 supplement)
export const BONUS_THRESHOLDS: Record<string, { M: number; F: number }> = {
  singles: { M: 12, F: 8 },
  doubles: { M: 24, F: 16 },
  mixed:   { M: 24, F: 24 },
};
