import { create } from "zustand";

const useGameStore = create((set, get) => ({
  /* =========================
     CORE STATE
  ========================== */
  game: null,
  isDrawer: false,
  wordChoices: [],

  /* =========================
     GAME STATE SETTERS
  ========================== */

  /**
   * Replace FULL game state
   * Server-authoritative
   */
  setGame: (incoming) => {
    if (!incoming) return;

    set((state) => ({
      game: {
        ...incoming,

        // ✅ HARD NORMALIZATION (prevents crashes)
        revealedLetters: Array.isArray(incoming.revealedLetters)
          ? incoming.revealedLetters
          : [],

        rematch: incoming.rematch ?? null,

        players: Array.isArray(incoming.players)
          ? incoming.players
          : state.game?.players ?? [],
      },
    }));
  },

  /**
   * Patch PARTIAL game state
   * Used for small UI updates only
   */
  patchGame: (patch) => {
    if (!patch) return;

    set((state) => {
      if (!state.game) return state;

      return {
        game: {
          ...state.game,
          ...patch,

          // 🔒 Preserve critical arrays
          revealedLetters:
            patch.revealedLetters ??
            state.game.revealedLetters ??
            [],
        },
      };
    });
  },

  /* =========================
     UI HELPERS
  ========================== */

  setIsDrawer: (val) =>
    set({
      isDrawer: Boolean(val),
    }),

  setWordChoices: (choices) =>
    set({
      wordChoices: Array.isArray(choices) ? choices : [],
    }),

  clearWordChoices: () =>
    set({
      wordChoices: [],
    }),

  /* =========================
     HINT HELPERS
  ========================== */

  /**
   * Used ONLY for optimistic UI
   * Server still controls truth
   */
  addRevealedLetter: (index) =>
    set((state) => {
      if (!state.game) return state;

      const revealed = state.game.revealedLetters ?? [];

      if (revealed.includes(index)) return state;

      return {
        game: {
          ...state.game,
          revealedLetters: [...revealed, index],
        },
      };
    }),

  /* =========================
     RESET (EXIT / FORCE EXIT)
  ========================== */

  reset: () =>
    set({
      game: null,
      isDrawer: false,
      wordChoices: [],
    }),
}));

export default useGameStore;
