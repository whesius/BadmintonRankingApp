import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { calculatePoints } from "../engine/points.ts";
import type { MatchRecord, Discipline, MatchResult, Competition, PlayerProfile } from "../types/index.ts";

interface Props {
  player: PlayerProfile;
  onAdd: (match: MatchRecord) => void;
}

export function MatchForm({ player, onAdd }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [discipline, setDiscipline] = useState<Discipline>("singles");
  const [result, setResult] = useState<MatchResult>("win");
  const [walkover, setWalkover] = useState(false);
  const [competition, setCompetition] = useState<Competition>("interclub");
  const [opponentLevel, setOpponentLevel] = useState(8);
  const [partnerLevel, setPartnerLevel] = useState(8);
  const [opponent1Level, setOpponent1Level] = useState(8);
  const [opponent2Level, setOpponent2Level] = useState(8);

  const isDoubles = discipline !== "singles";

  const previewMatch: Pick<MatchRecord, "result" | "walkover" | "discipline" | "opponentLevel" | "opponent1Level" | "opponent2Level"> = {
    result,
    walkover,
    discipline,
    opponentLevel: isDoubles ? undefined : opponentLevel,
    opponent1Level: isDoubles ? opponent1Level : undefined,
    opponent2Level: isDoubles ? opponent2Level : undefined,
  };
  const previewPoints = calculatePoints(previewMatch);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const match: MatchRecord = {
      id: uuidv4(),
      date,
      discipline,
      result,
      walkover,
      competition,
      opponentLevel: isDoubles ? undefined : opponentLevel,
      partnerLevel: isDoubles ? partnerLevel : undefined,
      opponent1Level: isDoubles ? opponent1Level : undefined,
      opponent2Level: isDoubles ? opponent2Level : undefined,
      points: previewPoints,
      playerLevelAtTime: player.classifications[discipline],
    };
    onAdd(match);
  }

  const levels = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Add Match</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Competition</label>
          <select value={competition} onChange={(e) => setCompetition(e.target.value as Competition)}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
            <option value="interclub">Interclub</option>
            <option value="tournament">Tournament</option>
            <option value="championship">Championship</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Discipline</label>
        <div className="flex gap-4">
          {(["singles", "doubles", "mixed"] as Discipline[]).map((d) => (
            <label key={d} className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="discipline" value={d} checked={discipline === d}
                onChange={() => setDiscipline(d)} className="accent-blue-600" />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Result</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="result" value="win" checked={result === "win"}
                onChange={() => setResult("win")} className="accent-blue-600" />
              Win
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="radio" name="result" value="loss" checked={result === "loss"}
                onChange={() => setResult("loss")} className="accent-blue-600" />
              Loss
            </label>
          </div>
        </div>
        <label className="flex items-center gap-1.5 pt-5 text-sm">
          <input type="checkbox" checked={walkover} onChange={(e) => setWalkover(e.target.checked)}
            className="accent-blue-600" />
          Walkover
        </label>
      </div>

      {!isDoubles ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Opponent Level</label>
          <select value={opponentLevel} onChange={(e) => setOpponentLevel(Number(e.target.value))}
            className="w-32 rounded border border-gray-300 px-3 py-1.5 text-sm">
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Partner Level</label>
            <select value={partnerLevel} onChange={(e) => setPartnerLevel(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
              {levels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Opponent 1</label>
            <select value={opponent1Level} onChange={(e) => setOpponent1Level(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
              {levels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Opponent 2</label>
            <select value={opponent2Level} onChange={(e) => setOpponent2Level(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
              {levels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-600">
          Points: <span className="font-mono font-semibold text-blue-600">{previewPoints}</span>
        </span>
        <button type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add Match
        </button>
      </div>
    </form>
  );
}
