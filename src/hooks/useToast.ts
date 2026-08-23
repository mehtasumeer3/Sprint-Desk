import { useCallback } from "react";
import { useToastStore } from "../stores/toastStore";
export function useToast() {
  const push = useToastStore((s) => s.push);
  return useCallback(
    (message: string, tone: "success" | "error" | "info" = "info") =>
      push(message, tone),
    [push],
  );
}
