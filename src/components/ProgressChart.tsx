import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from "recharts";
import { THRESHOLDS } from "../constants/c700.ts";
import { filterValidMatches } from "../engine/filter.ts";
import { calculateOptimizedAverage } from "../engine/average.ts";
import type { MatchRecord, Discipline } from "../types/index.ts";

interface Props {
  matches: MatchRecord[];
  discipline: Discipline;
  playerLevel: number;
}

export function ProgressChart({ matches, discipline, playerLevel }: Props) {
  // Build data points: after each match, recalculate the rising average
  const disciplineMatches = matches
    .filter((m) => m.discipline === discipline && !m.walkover)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = disciplineMatches.map((_, i) => {
    const subset = disciplineMatches.slice(0, i + 1);
    const lastMatch = subset[subset.length - 1];
    const refDate = new Date(lastMatch.date);
    refDate.setHours(23, 59, 59);

    const risingMatches = filterValidMatches(subset, playerLevel, discipline, "rising", refDate);
    const risingAvg = calculateOptimizedAverage(risingMatches, "rising");

    return {
      date: lastMatch.date,
      risingAvg: Math.round(risingAvg * 10) / 10,
      match: i + 1,
    };
  });

  const nextHigher = playerLevel - 1;
  const riseThreshold = nextHigher >= 1 ? THRESHOLDS[nextHigher]?.rise ?? undefined : undefined;
  const fallThreshold = playerLevel <= 12 ? THRESHOLDS[playerLevel + 1]?.fall ?? undefined : undefined;

  if (data.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-400">No matches to chart yet.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="risingAvg" stroke="#3b82f6" strokeWidth={2} name="Rising Avg" dot={{ r: 3 }} />
          {riseThreshold !== undefined && (
            <ReferenceLine y={riseThreshold} stroke="#22c55e" strokeDasharray="5 5" label={{ value: `Promote: ${riseThreshold}`, fontSize: 11 }} />
          )}
          {fallThreshold !== undefined && (
            <ReferenceLine y={fallThreshold} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Demote: ${fallThreshold}`, fontSize: 11 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
