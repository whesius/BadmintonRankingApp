import { useState, useCallback } from "react";
import { loadMatches, saveMatches } from "../storage/localStorage.ts";
import type { MatchRecord } from "../types/index.ts";

export function useMatches() {
  const [matches, setMatchesState] = useState<MatchRecord[]>(loadMatches);

  const setMatches = useCallback((m: MatchRecord[]) => {
    setMatchesState(m);
    saveMatches(m);
  }, []);

  const addMatch = useCallback((match: MatchRecord) => {
    setMatchesState((prev) => {
      const next = [...prev, match];
      saveMatches(next);
      return next;
    });
  }, []);

  const deleteMatch = useCallback((id: string) => {
    setMatchesState((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMatches(next);
      return next;
    });
  }, []);

  const updateMatch = useCallback((id: string, updates: Partial<MatchRecord>) => {
    setMatchesState((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
      saveMatches(next);
      return next;
    });
  }, []);

  return { matches, setMatches, addMatch, deleteMatch, updateMatch };
}
