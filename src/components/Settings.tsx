import { useRef } from "react";
import { exportAllData, importAllData, clearAllData } from "../storage/localStorage.ts";
import type { PlayerProfile, Discipline, Gender } from "../types/index.ts";

interface Props {
  player: PlayerProfile;
  onUpdate: (updates: Partial<PlayerProfile>) => void;
  onReload: () => void;
}

const DISCIPLINES: Discipline[] = ["singles", "doubles", "mixed"];
const labels: Record<Discipline, string> = { singles: "Singles", doubles: "Doubles", mixed: "Mixed" };
const levels = Array.from({ length: 12 }, (_, i) => i + 1);

export function Settings({ player, onUpdate, onReload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `badminton-ranking-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(reader.result as string);
        onReload();
      } catch {
        alert("Invalid file. Please select a valid JSON export.");
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (confirm("Delete ALL data? This cannot be undone.")) {
      clearAllData();
      onReload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Player Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input type="text" value={player.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Member ID</label>
            <input type="text" value={player.memberId}
              onChange={(e) => onUpdate({ memberId: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="e.g. 50025533" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <select value={player.gender}
              onChange={(e) => onUpdate({ gender: e.target.value as Gender })}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classifications */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Current Classifications</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {DISCIPLINES.map((d) => (
            <div key={d}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{labels[d]}</label>
              <select value={player.classifications[d]}
                onChange={(e) => onUpdate({
                  classifications: { ...player.classifications, [d]: Number(e.target.value) }
                })}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm">
                {levels.map((l) => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Demotion dates */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Last Demotion Dates</h3>
        <p className="mb-3 text-xs text-gray-500">Set if you were recently demoted (26-week protection applies).</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {DISCIPLINES.map((d) => (
            <div key={d}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{labels[d]}</label>
              <input type="date" value={player.lastDemotion[d] ?? ""}
                onChange={(e) => onUpdate({
                  lastDemotion: { ...player.lastDemotion, [d]: e.target.value || null }
                })}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Data Management</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Export JSON
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={handleReset}
            className="rounded bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
