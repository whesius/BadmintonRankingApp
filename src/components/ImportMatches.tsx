import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { parseBVHtml, filterLast52Weeks, type ImportedMatch } from "../engine/importBV.ts";
import { calculatePoints } from "../engine/points.ts";
import type { PlayerProfile, MatchRecord, Discipline } from "../types/index.ts";

interface Props {
  player: PlayerProfile;
  onImport: (matches: MatchRecord[]) => void;
}

const LEVELS = Array.from({ length: 12 }, (_, i) => i + 1);

export function ImportMatches({ player, onImport }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaste, setShowPaste] = useState(true);
  const [pastedHtml, setPastedHtml] = useState("");
  const [parsedMatches, setParsedMatches] = useState<ImportedMatch[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState(false);

  async function fetchViaProxy(targetUrl: string): Promise<string> {
    const proxies = [
      { name: "codetabs", url: (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}` },
      { name: "allorigins", url: (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` },
    ];
    const errors: string[] = [];
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy.url(targetUrl));
        if (!res.ok) {
          errors.push(`${proxy.name}: HTTP ${res.status} ${res.statusText}`);
          continue;
        }
        const html = await res.text();
        if (html.length > 1000) return html;
        errors.push(`${proxy.name}: response too small (${html.length} bytes)`);
      } catch (e) {
        errors.push(`${proxy.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    throw new Error(errors.join("\n"));
  }

  async function handleFetch() {
    setError("");
    setLoading(true);
    try {
      const html = await fetchViaProxy(url);
      processHtml(html);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setError(`Could not fetch the page. You can paste the page source instead.\n\nDetails:\n${detail}`);
      setShowPaste(true);
    } finally {
      setLoading(false);
    }
  }

  function handlePaste() {
    setError("");
    if (!pastedHtml.trim()) {
      setError("Please paste the HTML source code.");
      return;
    }
    processHtml(pastedHtml);
  }

  function processHtml(html: string) {
    let all: ImportedMatch[];
    try {
      all = parseBVHtml(html, player.name);
    } catch {
      setError("Could not parse the HTML. Make sure you copied the full page source (Ctrl+U).");
      setShowPaste(true);
      return;
    }
    const recent = filterLast52Weeks(all);
    if (recent.length === 0) {
      setError(
        all.length > 0
          ? `Found ${all.length} total matches but none in the last 52 weeks.`
          : "No matches found. Make sure the page source contains match data.\nTry pasting the page source below (Ctrl+U on the matches page)."
      );
      setShowPaste(true);
      return;
    }
    for (const m of recent) {
      if (m.discipline === "singles") {
        m.opponentLevel = player.classifications.singles;
      } else {
        m.opponent1Level = player.classifications[m.discipline];
        m.opponent2Level = player.classifications[m.discipline];
        m.partnerLevel = player.classifications[m.discipline];
      }
    }
    setParsedMatches(recent);
    setSelected(new Set(recent.map((_, i) => i)));
    setImported(false);
  }

  function updateMatch(index: number, updates: Partial<ImportedMatch>) {
    setParsedMatches((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...updates } : m))
    );
  }

  function toggleSelect(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(parsedMatches.map((_, i) => i)) : new Set());
  }

  function changeDiscipline(index: number, d: Discipline) {
    const m = parsedMatches[index];
    const updates: Partial<ImportedMatch> = { discipline: d };
    if (d === "singles") {
      updates.opponentLevel = m.opponent1Level ?? player.classifications.singles;
      updates.opponent1Level = undefined;
      updates.opponent2Level = undefined;
      updates.partnerLevel = undefined;
    } else {
      updates.opponent1Level = m.opponentLevel ?? player.classifications[d];
      updates.opponent2Level = m.opponentLevel ?? player.classifications[d];
      updates.partnerLevel = player.classifications[d];
      updates.opponentLevel = undefined;
    }
    updateMatch(index, updates);
  }

  function handleImport() {
    const toImport = parsedMatches.filter((_, i) => selected.has(i));
    const records: MatchRecord[] = toImport.map((m) => {
      const isDoubles = m.discipline !== "singles";
      const record: MatchRecord = {
        id: uuidv4(),
        date: m.date,
        discipline: m.discipline,
        result: m.result,
        walkover: m.walkover,
        competition: m.competition,
        opponentLevel: isDoubles ? undefined : m.opponentLevel,
        opponent1Level: isDoubles ? m.opponent1Level : undefined,
        opponent2Level: isDoubles ? m.opponent2Level : undefined,
        partnerLevel: isDoubles ? m.partnerLevel : undefined,
        points: 0,
        playerLevelAtTime: player.classifications[m.discipline],
      };
      record.points = calculatePoints(record);
      return record;
    });
    onImport(records);
    setImported(true);
  }

  function handleReset() {
    setParsedMatches([]);
    setSelected(new Set());
    setError("");
    setImported(false);
  }

  if (imported) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
        <p className="text-sm font-medium text-green-800">
          Successfully imported {selected.size} match{selected.size !== 1 ? "es" : ""}!
        </p>
        <button
          onClick={handleReset}
          className="mt-2 text-sm text-green-700 underline hover:text-green-900"
        >
          Import more matches
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">
        Import from Badminton Vlaanderen
      </h3>

      {parsedMatches.length === 0 ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Profile URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.badmintonvlaanderen.be/profile/matches.aspx?id=..."
                className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !url}
                className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Fetching..." : "Fetch"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Go to{" "}
              <a
                href="https://www.badmintonvlaanderen.be"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                badmintonvlaanderen.be
              </a>
              {" "}&rarr; search your name &rarr; click &quot;Matches&quot; &rarr; copy the URL
            </p>
          </div>

          {error && <pre className="whitespace-pre-wrap text-sm text-red-600">{error}</pre>}

          {showPaste && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Paste the page source (Ctrl+U on the matches page)
              </label>
              <textarea
                value={pastedHtml}
                onChange={(e) => setPastedHtml(e.target.value)}
                rows={6}
                placeholder="Paste HTML source here..."
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono"
              />
              <button
                onClick={handlePaste}
                className="mt-2 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Parse HTML
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Found <span className="font-semibold">{parsedMatches.length}</span> matches
            in the last 52 weeks. Set opponent/partner levels, then import.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-2">
                    <input
                      type="checkbox"
                      checked={selected.size === parsedMatches.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
                  <th className="pb-2 pr-2">Date</th>
                  <th className="pb-2 pr-2">Discipline</th>
                  <th className="pb-2 pr-2">Result</th>
                  <th className="pb-2 pr-2">Opponents</th>
                  <th className="pb-2 pr-2">Score</th>
                  <th className="pb-2 pr-2">Levels</th>
                </tr>
              </thead>
              <tbody>
                {parsedMatches.map((m, i) => {
                  const isDoubles = m.discipline !== "singles";
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-2">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleSelect(i)}
                        />
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap">{m.date}</td>
                      <td className="py-2 pr-2">
                        <select
                          value={m.discipline}
                          onChange={(e) => changeDiscipline(i, e.target.value as Discipline)}
                          className="rounded border border-gray-300 px-1 py-0.5 text-xs"
                        >
                          <option value="singles">Singles</option>
                          <option value="doubles">Doubles</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </td>
                      <td
                        className={`py-2 pr-2 font-medium ${
                          m.result === "win" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {m.result}
                        {m.walkover ? " (wo)" : ""}
                      </td>
                      <td className="py-2 pr-2">
                        <div className="text-xs">{m.opponentNames.join(" / ")}</div>
                        {m.partnerName && (
                          <div className="text-xs text-gray-400">w/ {m.partnerName}</div>
                        )}
                      </td>
                      <td className="py-2 pr-2 font-mono text-xs">{m.score}</td>
                      <td className="py-2 pr-2">
                        {!isDoubles ? (
                          <div>
                            <label className="text-xs text-gray-400">Opp</label>
                            <select
                              value={m.opponentLevel ?? 8}
                              onChange={(e) =>
                                updateMatch(i, { opponentLevel: Number(e.target.value) })
                              }
                              className="ml-1 w-14 rounded border border-gray-300 px-1 py-0.5 text-xs"
                            >
                              {LEVELS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <div>
                              <label className="text-xs text-gray-400">Opp 1</label>
                              <select
                                value={m.opponent1Level ?? 8}
                                onChange={(e) =>
                                  updateMatch(i, { opponent1Level: Number(e.target.value) })
                                }
                                className="ml-1 w-14 rounded border border-gray-300 px-1 py-0.5 text-xs"
                              >
                                {LEVELS.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Opp 2</label>
                              <select
                                value={m.opponent2Level ?? 8}
                                onChange={(e) =>
                                  updateMatch(i, { opponent2Level: Number(e.target.value) })
                                }
                                className="ml-1 w-14 rounded border border-gray-300 px-1 py-0.5 text-xs"
                              >
                                {LEVELS.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Partner</label>
                              <select
                                value={m.partnerLevel ?? 8}
                                onChange={(e) =>
                                  updateMatch(i, { partnerLevel: Number(e.target.value) })
                                }
                                className="ml-1 w-14 rounded border border-gray-300 px-1 py-0.5 text-xs"
                              >
                                {LEVELS.map((l) => (
                                  <option key={l} value={l}>
                                    {l}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              onClick={handleReset}
              className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selected.size === 0}
              className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Import {selected.size} Match{selected.size !== 1 ? "es" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
