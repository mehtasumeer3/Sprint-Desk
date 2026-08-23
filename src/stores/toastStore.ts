import { create } from "zustand";
export type Toast = {
  id: number;
  message: string;
  tone?: "success" | "error" | "info";
};
type State = {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => number;
  remove: (id: number) => void;
};
export const useToastStore = create<State>((set) => ({
  toasts: [],
  push: (message, tone = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
