import { useState, useCallback, useEffect } from "react";
import { usePlayer } from "./hooks/usePlayer.ts";
import { useMatches } from "./hooks/useMatches.ts";
import { Dashboard } from "./components/Dashboard.tsx";
import { MatchForm } from "./components/MatchForm.tsx";
import { MatchList } from "./components/MatchList.tsx";
import { Simulator } from "./components/Simulator.tsx";
import { Setup } from "./components/Setup.tsx";
import { Help } from "./components/Help.tsx";
import { Contact } from "./components/Contact.tsx";
import { ImportMatches } from "./components/ImportMatches.tsx";
import { loadPlayer } from "./storage/localStorage.ts";
import { trackPageView, identifyUser } from "./analytics.ts";

type Tab = "dashboard" | "matches" | "simulator" | "setup" | "help" | "contact";

const TABS: { id: Tab; label: string }[] = [
  { id: "setup", label: "Settings" },
  { id: "dashboard", label: "Dashboard" },
  { id: "matches", label: "Matches" },
  { id: "simulator", label: "Simulator" },
  { id: "help", label: "Help" },
  { id: "contact", label: "Contact" },
];

const TAB_IDS = new Set(TABS.map((t) => t.id));

function getTabFromHash(): Tab {
  const hash = window.location.hash.slice(1);
  return TAB_IDS.has(hash as Tab) ? (hash as Tab) : "dashboard";
}

export default function App() {
  const [tab, setTabState] = useState<Tab>(getTabFromHash);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    window.location.hash = t;
    const label = TABS.find((tab) => tab.id === t)?.label ?? t;
    trackPageView(t, label);
  }, []);
  const { player, setPlayer, updatePlayer } = usePlayer();
  const { matches, addMatch, addMatches, deleteMatch } = useMatches();

  useEffect(() => {
    const label = TABS.find((t) => t.id === tab)?.label ?? tab;
    trackPageView(tab, label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (player.name) identifyUser(player.name);
  }, [player.name]);

  const handleReload = useCallback(() => {
    setPlayer(loadPlayer());
    window.location.reload();
  }, [setPlayer]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Badminton Ranking Calculator</h1>
          {player.name && (
            <p className="text-sm text-gray-500">
              {player.name} — Singles: {player.classifications.singles} | Doubles: {player.classifications.doubles} | Mixed: {player.classifications.mixed}
            </p>
          )}
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl px-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "dashboard" && <Dashboard player={player} matches={matches} />}
        {tab === "matches" && (
          <div className="space-y-6">
            <ImportMatches player={player} onImport={addMatches} />
            <MatchForm player={player} onAdd={addMatch} />
            <MatchList matches={matches} onDelete={deleteMatch} />
          </div>
        )}
        {tab === "simulator" && <Simulator player={player} matches={matches} />}
        {tab === "setup" && <Setup player={player} onUpdate={updatePlayer} onReload={handleReload} />}
        {tab === "help" && <Help />}
        {tab === "contact" && <Contact />}
      </main>
    </div>
  );
}
