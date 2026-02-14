import { useState, useCallback } from "react";
import { loadPlayer, savePlayer } from "../storage/localStorage.ts";
import type { PlayerProfile } from "../types/index.ts";

export function usePlayer() {
  const [player, setPlayerState] = useState<PlayerProfile>(loadPlayer);

  const setPlayer = useCallback((p: PlayerProfile) => {
    setPlayerState(p);
    savePlayer(p);
  }, []);

  const updatePlayer = useCallback((updates: Partial<PlayerProfile>) => {
    setPlayerState((prev) => {
      const next = { ...prev, ...updates };
      savePlayer(next);
      return next;
    });
  }, []);

  return { player, setPlayer, updatePlayer };
}
