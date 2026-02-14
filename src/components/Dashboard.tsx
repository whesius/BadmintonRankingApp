import { useState } from "react";
import { evaluateAll } from "../engine/classification.ts";
import { StatusCard } from "./StatusCard.tsx";
import { ProgressChart } from "./ProgressChart.tsx";
import type { PlayerProfile, MatchRecord, Discipline } from "../types/index.ts";

interface Props {
  player: PlayerProfile;
  matches: MatchRecord[];
}

const DISCIPLINES: Discipline[] = ["singles", "doubles", "mixed"];
const labels: Record<Discipline, string> = { singles: "Singles", doubles: "Doubles", mixed: "Mixed" };

export function Dashboard({ player, matches }: Props) {
  const [chartDiscipline, setChartDiscipline] = useState<Discipline>("singles");
  const results = evaluateAll(player, matches);

  if (!player.name) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-lg">Welcome! Set up your profile in the Setup tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player header */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
        <p className="text-sm text-gray-600">
          Singles: Lvl {player.classifications.singles} | Doubles: Lvl {player.classifications.doubles} | Mixed: Lvl {player.classifications.mixed}
        </p>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {DISCIPLINES.map((d) => (
          <StatusCard key={d} result={results[d]} />
        ))}
      </div>

      {/* Progress chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Rising Average Progress</h3>
          <div className="flex gap-2">
            {DISCIPLINES.map((d) => (
              <button key={d} onClick={() => setChartDiscipline(d)}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  chartDiscipline === d ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {labels[d]}
              </button>
            ))}
          </div>
        </div>
        <ProgressChart
          matches={matches}
          discipline={chartDiscipline}
          playerLevel={player.classifications[chartDiscipline]}
        />
      </div>
    </div>
  );
}
