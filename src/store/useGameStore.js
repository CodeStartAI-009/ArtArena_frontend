import { create } from "zustand";

const useGameStore = create((set) => ({
  game: null,
  isDrawer: false,

  setGame: (game) =>
    set({
      game: {
        allowDrawing: false,
        allowGuessing: false,
        ...game,
      },
    }),

  setIsDrawer: (val) => set({ isDrawer: val }),

  updateFlags: (flags) =>
    set((state) => ({
      game: { ...state.game, ...flags },
    })),

  reset: () =>
    set({
      game: null,
      isDrawer: false,
    }),
}));

export default useGameStore;
