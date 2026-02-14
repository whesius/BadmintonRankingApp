import type { Discipline, MatchResult, Competition } from "../types/index.ts";

export interface ImportedMatch {
  date: string;
  discipline: Discipline;
  result: MatchResult;
  walkover: boolean;
  competition: Competition;
  tournamentName: string;
  opponentNames: string[];
  partnerName?: string;
  score: string;
  // These must be filled in by user:
  opponentLevel?: number;
  opponent1Level?: number;
  opponent2Level?: number;
  partnerLevel?: number;
}

const WALTER_NAMES = ["walter hesius"];

function isWalter(name: string): boolean {
  return WALTER_NAMES.includes(name.trim().toLowerCase());
}

function parseDate(dateStr: string): string | null {
  // Format: "zo 25/01/2026" or "zo 8/02/2026" (day may be 1 or 2 digits)
  const match = dateStr.match(/(\d{1,2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const day = match[1].padStart(2, "0");
  return `${match[3]}-${match[2]}-${day}`;
}

function getTextContent(el: Element): string {
  return el.textContent?.trim() ?? "";
}

function extractPlayerNames(table: Element): string[] {
  const names: string[] = [];
  const rows = table.querySelectorAll("tr");
  for (const row of rows) {
    const link = row.querySelector("a[href*='player.aspx']");
    if (link) {
      const name = getTextContent(link);
      if (name) names.push(name);
    }
  }
  return names;
}

function isWinnerSide(table: Element): boolean {
  return table.querySelector("strong") !== null;
}

function guessCompetition(tournamentName: string): Competition {
  const lower = tournamentName.toLowerCase();
  if (lower.includes("interclub") || lower.includes("competitie") || lower.includes("liga")) {
    return "interclub";
  }
  if (lower.includes("kampioenschap") || lower.includes("championship") || lower.includes("bk ")) {
    return "championship";
  }
  return "tournament";
}

export function parseBVHtml(html: string, playerName: string): ImportedMatch[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const matches: ImportedMatch[] = [];

  const walterNames = [playerName.trim().toLowerCase(), ...WALTER_NAMES];

  function isPlayer(name: string): boolean {
    return walterNames.includes(name.trim().toLowerCase());
  }

  // Find all tbody elements that contain match data
  const rows = doc.querySelectorAll("tbody tr");
  let currentTournament = "";

  for (const row of rows) {
    // Tournament header row
    const header = row.querySelector("th[colspan]");
    if (header) {
      currentTournament = getTextContent(header);
      continue;
    }

    // Match row: look for plannedtime cell
    const timeCell = row.querySelector("td.plannedtime");
    if (!timeCell) continue;

    const dateStr = parseDate(getTextContent(timeCell));
    if (!dateStr) continue;

    // Get the nested tables (left side and right side players)
    const nestedTables = row.querySelectorAll(":scope > td > table");
    if (nestedTables.length < 2) continue;

    const leftTable = nestedTables[0];
    const rightTable = nestedTables[1];
    const leftPlayers = extractPlayerNames(leftTable);
    const rightPlayers = extractPlayerNames(rightTable);

    if (leftPlayers.length === 0 || rightPlayers.length === 0) continue;

    // Determine which side Walter is on
    const walterOnLeft = leftPlayers.some(isPlayer);
    const walterOnRight = rightPlayers.some(isPlayer);
    if (!walterOnLeft && !walterOnRight) continue;

    const myPlayers = walterOnLeft ? leftPlayers : rightPlayers;
    const oppPlayers = walterOnLeft ? rightPlayers : leftPlayers;
    const myTable = walterOnLeft ? leftTable : rightTable;

    // Determine win/loss from <strong> tags
    const iWon = isWinnerSide(myTable);

    // Get score
    const scoreSpan = row.querySelector("span.score");
    const score = scoreSpan ? getTextContent(scoreSpan) : "";
    const walkover = !scoreSpan || score === "" || score === "-";

    // Determine discipline
    const playersPerSide = Math.max(myPlayers.length, oppPlayers.length);
    let discipline: Discipline = "singles";
    if (playersPerSide >= 2) {
      discipline = "doubles"; // User can change to "mixed" in review
    }

    // Extract partner name (for doubles/mixed)
    const partnerName = playersPerSide >= 2
      ? myPlayers.find(n => !isPlayer(n))
      : undefined;

    const imported: ImportedMatch = {
      date: dateStr,
      discipline,
      result: iWon ? "win" : "loss",
      walkover,
      competition: guessCompetition(currentTournament),
      tournamentName: currentTournament,
      opponentNames: oppPlayers,
      partnerName,
      score,
    };

    matches.push(imported);
  }

  return matches;
}

export function filterLast52Weeks(matches: ImportedMatch[], referenceDate: Date = new Date()): ImportedMatch[] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - 52 * 7);
  return matches.filter(m => {
    const d = new Date(m.date);
    return d >= cutoff && d <= referenceDate;
  });
}
