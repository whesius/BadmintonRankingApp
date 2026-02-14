// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { parseBVHtml, filterLast52Weeks } from "../src/engine/importBV.ts";

// Minimal HTML fixture based on Erik Daniels' real BV profile page structure.
// Covers: singles win, singles loss, doubles win, doubles loss, mixed win,
// tournament header detection, and a walkover (no score).
const ERIK_HTML = `<html><body>
<table><tbody>
  <tr><th colspan="8"><a href="../sport/tournament.aspx?id=X">Vlaamse interclubcompetitie 2025-2026</a></th></tr>

  <!-- Doubles loss: Erik Daniels / Sven Loyens vs Dimitry Luyckx / Hamza Mudabbir -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">zo 8/02/2026 <span class="time">14:00</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><a href="../sport/player.aspx?id=X&player=351">Erik Daniels</a></td><td></td></tr>
      <tr><td align="right"><a href="../sport/player.aspx?id=X&player=354">Sven Loyens</a></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><strong><a href="../sport/player.aspx?id=X&player=326">Dimitry Luyckx</a></strong></td></tr>
      <tr><td></td><td><strong><a href="../sport/player.aspx?id=X&player=570">Hamza Mudabbir</a></strong></td></tr>
    </table></td>
    <td><span class="score"><span>22-20</span> <span>17-21</span> <span>10-21</span></span></td>
    <td></td><td></td>
  </tr>

  <!-- Doubles win: Erik Daniels / Sven Loyens vs Arthur Christian Ooms / Lucian Quinten Ooms -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">zo 8/02/2026 <span class="time">14:00</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=X&player=351">Erik Daniels</a></strong></td><td></td></tr>
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=X&player=354">Sven Loyens</a></strong></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><a href="../sport/player.aspx?id=X&player=329">Arthur Christian Ooms</a></td></tr>
      <tr><td></td><td><a href="../sport/player.aspx?id=X&player=571">Lucian Quinten Ooms</a></td></tr>
    </table></td>
    <td><span class="score"><span>21-18</span> <span>24-22</span></span></td>
    <td></td><td></td>
  </tr>

  <!-- Singles loss: Erik Daniels vs Arthur Christian Ooms -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">zo 8/02/2026 <span class="time">14:00</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><a href="../sport/player.aspx?id=X&player=351">Erik Daniels</a></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><strong><a href="../sport/player.aspx?id=X&player=329">Arthur Christian Ooms</a></strong></td></tr>
    </table></td>
    <td><span class="score"><span>17-21</span> <span>21-23</span></span></td>
    <td></td><td></td>
  </tr>

  <!-- Singles win: Erik Daniels vs Michiel Ickx-Dereze -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">zo 25/01/2026 <span class="time">13:30</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=X&player=351">Erik Daniels</a></strong></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><a href="../sport/player.aspx?id=X&player=8">Michiel Ickx-Dereze</a></td></tr>
    </table></td>
    <td><span class="score"><span>21-14</span> <span>21-19</span></span></td>
    <td></td><td></td>
  </tr>

  <!-- Walkover / no score -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">zo 25/01/2026 <span class="time">13:30</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=X&player=351">Erik Daniels</a></strong></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><a href="../sport/player.aspx?id=X&player=999">Some Player</a></td></tr>
    </table></td>
    <td></td>
    <td></td><td></td>
  </tr>

  <tr><th colspan="8"><a href="../sport/tournament.aspx?id=Y">Limburgse interclubcompetitie 2024-2025</a></th></tr>

  <!-- Mixed win: Erik Daniels / Lore Petry vs Jimmy Beliën / Michelle Coomans -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">za 12/04/2025 <span class="time">14:00</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=Y&player=351">Erik Daniels</a></strong></td><td></td></tr>
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=Y&player=400">Lore Petry</a></strong></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><a href="../sport/player.aspx?id=Y&player=500">Jimmy Beliën</a></td></tr>
      <tr><td></td><td><a href="../sport/player.aspx?id=Y&player=501">Michelle Coomans</a></td></tr>
    </table></td>
    <td><span class="score"><span>21-7</span> <span>21-15</span></span></td>
    <td></td><td></td>
  </tr>

  <!-- Singles win in older tournament: Erik Daniels vs Bram Daniels (older than 52 weeks) -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">zo 29/09/2024 <span class="time">13:00</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=Y&player=351">Erik Daniels</a></strong></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><a href="../sport/player.aspx?id=Y&player=600">Michiel Grobben</a></td></tr>
    </table></td>
    <td><span class="score"><span>21-15</span> <span>21-8</span></span></td>
    <td></td><td></td>
  </tr>

  <tr><th colspan="8"><a href="../sport/tournament.aspx?id=Z">BK Senioren - CB Seniors 2025</a></th></tr>

  <!-- Championship match: Erik Daniels vs Gert Priem -->
  <tr>
    <td></td>
    <td class="plannedtime" align="right">za 26/04/2025 <span class="time">10:00</span></td>
    <td align="right"><table align="Right">
      <tr><td align="right"><strong><a href="../sport/player.aspx?id=Z&player=351">Erik Daniels</a></strong></td><td></td></tr>
    </table></td>
    <td><table>
      <tr><td></td><td><a href="../sport/player.aspx?id=Z&player=700">Gert Priem</a></td></tr>
    </table></td>
    <td><span class="score"><span>21-4</span> <span>21-17</span></span></td>
    <td></td><td></td>
  </tr>
</tbody></table>
</body></html>`;

describe("parseBVHtml", () => {
  const matches = parseBVHtml(ERIK_HTML, "Erik Daniels");

  it("parses the correct total number of matches", () => {
    expect(matches.length).toBe(8);
  });

  it("parses a doubles loss correctly", () => {
    const m = matches[0]; // first match: doubles loss
    expect(m.date).toBe("2026-02-08");
    expect(m.discipline).toBe("doubles");
    expect(m.result).toBe("loss");
    expect(m.walkover).toBe(false);
    expect(m.opponentNames).toEqual(["Dimitry Luyckx", "Hamza Mudabbir"]);
    expect(m.partnerName).toBe("Sven Loyens");
    expect(m.score).toBe("22-20 17-21 10-21");
  });

  it("parses a doubles win correctly", () => {
    const m = matches[1]; // doubles win
    expect(m.date).toBe("2026-02-08");
    expect(m.discipline).toBe("doubles");
    expect(m.result).toBe("win");
    expect(m.walkover).toBe(false);
    expect(m.opponentNames).toEqual(["Arthur Christian Ooms", "Lucian Quinten Ooms"]);
    expect(m.partnerName).toBe("Sven Loyens");
    expect(m.score).toBe("21-18 24-22");
  });

  it("parses a singles loss correctly", () => {
    const m = matches[2]; // singles loss
    expect(m.date).toBe("2026-02-08");
    expect(m.discipline).toBe("singles");
    expect(m.result).toBe("loss");
    expect(m.walkover).toBe(false);
    expect(m.opponentNames).toEqual(["Arthur Christian Ooms"]);
    expect(m.partnerName).toBeUndefined();
  });

  it("parses a singles win correctly", () => {
    const m = matches[3]; // singles win
    expect(m.date).toBe("2026-01-25");
    expect(m.discipline).toBe("singles");
    expect(m.result).toBe("win");
    expect(m.opponentNames).toEqual(["Michiel Ickx-Dereze"]);
    expect(m.score).toBe("21-14 21-19");
  });

  it("detects walkover when score is missing", () => {
    const m = matches[4]; // walkover
    expect(m.walkover).toBe(true);
    expect(m.result).toBe("win");
    expect(m.opponentNames).toEqual(["Some Player"]);
  });

  it("tracks tournament names from headers", () => {
    expect(matches[0].tournamentName).toBe("Vlaamse interclubcompetitie 2025-2026");
    expect(matches[5].tournamentName).toBe("Limburgse interclubcompetitie 2024-2025");
    expect(matches[7].tournamentName).toBe("BK Senioren - CB Seniors 2025");
  });

  it("guesses competition type from tournament name", () => {
    expect(matches[0].competition).toBe("interclub"); // "interclubcompetitie"
    expect(matches[7].competition).toBe("championship"); // "BK Senioren"
  });

  it("parses a doubles match from a different tournament (mixed candidate)", () => {
    const m = matches[5]; // Erik Daniels / Lore Petry vs Jimmy Beliën / Michelle Coomans
    expect(m.discipline).toBe("doubles"); // parser defaults to doubles, user can change to mixed
    expect(m.result).toBe("win");
    expect(m.partnerName).toBe("Lore Petry");
    expect(m.opponentNames).toEqual(["Jimmy Beliën", "Michelle Coomans"]);
  });

  it("does not include matches where Erik is not playing", () => {
    // All 9 matches should have Erik on one side
    for (const m of matches) {
      expect(m.opponentNames).not.toContain("Erik Daniels");
    }
  });
});

describe("filterLast52Weeks", () => {
  const allMatches = parseBVHtml(ERIK_HTML, "Erik Daniels");

  it("filters to only matches within last 52 weeks", () => {
    const refDate = new Date("2026-02-14");
    const recent = filterLast52Weeks(allMatches, refDate);
    // 52 weeks before 2026-02-14 = 2025-02-15
    // Matches in fixture:
    //   2026-02-08 (3 matches) - yes
    //   2026-01-25 (2 matches) - yes
    //   2025-04-12 (1 match) - yes
    //   2024-09-29 (1 match) - no (too old)
    //   2025-04-26 (1 match) - yes
    // Total: 7 matches within 52 weeks
    expect(recent.length).toBe(7);
  });

  it("excludes matches older than 52 weeks", () => {
    const refDate = new Date("2026-02-14");
    const recent = filterLast52Weeks(allMatches, refDate);
    const dates = recent.map((m) => m.date);
    expect(dates).not.toContain("2024-09-29");
  });

  it("includes matches on the boundary", () => {
    // Set reference date so 2025-04-12 is exactly at 52-week boundary
    const refDate = new Date("2026-04-11");
    const recent = filterLast52Weeks(allMatches, refDate);
    const dates = recent.map((m) => m.date);
    expect(dates).toContain("2025-04-12");
  });

  it("returns empty when all matches are too old", () => {
    const refDate = new Date("2030-01-01");
    const recent = filterLast52Weeks(allMatches, refDate);
    expect(recent.length).toBe(0);
  });
});
