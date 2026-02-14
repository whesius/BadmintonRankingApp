import { useState } from "react";
import { simulateMatches, winsNeededToPromote } from "../engine/simulator.ts";
import type { PlayerProfile, MatchRecord, Discipline, SimulationMatch } from "../types/index.ts";

interface Props {
  player: PlayerProfile;
  matches: MatchRecord[];
}

const DISCIPLINES: Discipline[] = ["singles", "doubles", "mixed"];
const labels: Record<Discipline, string> = { singles: "Singles", doubles: "Doubles", mixed: "Mixed" };

export function Simulator({ player, matches }: Props) {
  const [discipline, setDiscipline] = useState<Discipline>("singles");
  const [hypothetical, setHypothetical] = useState<SimulationMatch[]>([]);
  const [addResult, setAddResult] = useState<"win" | "loss">("win");
  const [addOpponent, setAddOpponent] = useState(8);

  const levels = Array.from({ length: 12 }, (_, i) => i + 1);

  // Current state (no hypothetical)
  const current = simulateMatches(player, matches, [], discipline);

  // Simulated state
  const simulated = hypothetical.length > 0
    ? simulateMatches(player, matches, hypothetical, discipline)
    : null;

  // Quick: wins needed at each opponent level
  const quickCalcs = levels.map((l) => ({
    level: l,
    needed: winsNeededToPromote(player, matches, discipline, l),
  })).filter((q) => q.needed > 0 && q.needed <= 20);

  function addSimMatch() {
    setHypothetical((prev) => [...prev, { discipline, result: addResult, opponentLevel: addOpponent }]);
  }

  function clearSim() {
    setHypothetical([]);
  }

  return (
    <div className="space-y-6">
      {/* Discipline selector */}
      <div className="flex gap-2">
        {DISCIPLINES.map((d) => (
          <button key={d} onClick={() => { setDiscipline(d); setHypothetical([]); }}
            className={`rounded px-4 py-2 text-sm font-medium ${
              discipline === d ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {labels[d]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current state */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Current State</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Level:</span>
              <span className="font-medium">{player.classifications[discipline]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rising avg:</span>
              <span className="font-mono font-medium">{current.risingAverage.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Promotion threshold:</span>
              <span className="font-mono">{current.riseThreshold ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gap:</span>
              <span className="font-mono">{current.gapToPromotion.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Add hypothetical matches */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">What If...</h3>
          <div className="mb-3 flex items-end gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Result</label>
              <select value={addResult} onChange={(e) => setAddResult(e.target.value as "win" | "loss")}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm">
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">vs Level</label>
              <select value={addOpponent} onChange={(e) => setAddOpponent(Number(e.target.value))}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm">
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button onClick={addSimMatch}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              + Add
            </button>
            {hypothetical.length > 0 && (
              <button onClick={clearSim}
                className="rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
                Clear
              </button>
            )}
          </div>

          {hypothetical.length > 0 && (
            <div className="mb-3 space-y-1">
              {hypothetical.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={h.result === "win" ? "text-green-600" : "text-red-600"}>
                    {h.result === "win" ? "W" : "L"}
                  </span>
                  <span>vs level {h.opponentLevel}</span>
                  <button onClick={() => setHypothetical((prev) => prev.filter((_, j) => j !== i))}
                    className="text-xs text-gray-400 hover:text-red-500">x</button>
                </div>
              ))}
            </div>
          )}

          {simulated && (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Projected rising avg:</span>
                <span className="font-mono font-semibold">{simulated.risingAverage.toFixed(1)}</span>
              </div>
              <div className="mt-1">
                {simulated.action === "promote" ? (
                  <span className="text-sm font-medium text-green-600">Would PROMOTE!</span>
                ) : (
                  <span className="text-sm text-gray-500">
                    Still need {simulated.gapToPromotion.toFixed(1)} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick scenarios */}
      {quickCalcs.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Wins Needed to Promote</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {quickCalcs.map((q) => (
              <div key={q.level} className="rounded bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">vs Level {q.level}</div>
                <div className="text-xl font-bold text-blue-600">{q.needed}</div>
                <div className="text-xs text-gray-400">{q.needed === 1 ? "win" : "wins"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
