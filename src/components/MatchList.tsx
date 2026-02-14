import type { MatchRecord } from "../types/index.ts";

interface Props {
  matches: MatchRecord[];
  onDelete: (id: string) => void;
}

function opponentLabel(m: MatchRecord): string {
  if (m.discipline === "singles") return `Lvl ${m.opponentLevel ?? "?"}`;
  return `Lvl ${m.opponent1Level ?? "?"} + ${m.opponent2Level ?? "?"}`;
}

export function MatchList({ matches, onDelete }: Props) {
  const sorted = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No matches yet. Add your first match above.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-2 font-medium text-gray-600">Date</th>
            <th className="px-4 py-2 font-medium text-gray-600">Discipline</th>
            <th className="px-4 py-2 font-medium text-gray-600">Opponent</th>
            <th className="px-4 py-2 font-medium text-gray-600">Result</th>
            <th className="px-4 py-2 font-medium text-gray-600">Points</th>
            <th className="px-4 py-2 font-medium text-gray-600">Your Lvl</th>
            <th className="px-4 py-2 font-medium text-gray-600"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => (
            <tr key={m.id} className={`border-b border-gray-100 ${m.walkover ? "opacity-50" : ""}`}>
              <td className="px-4 py-2 font-mono text-xs">{m.date}</td>
              <td className="px-4 py-2 capitalize">{m.discipline}</td>
              <td className="px-4 py-2">{opponentLabel(m)}</td>
              <td className="px-4 py-2">
                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  m.walkover ? "bg-gray-100 text-gray-500" :
                  m.result === "win" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {m.walkover ? "WO" : m.result.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-2 font-mono font-medium">{m.points}</td>
              <td className="px-4 py-2">{m.playerLevelAtTime}</td>
              <td className="px-4 py-2">
                <button onClick={() => onDelete(m.id)}
                  className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
