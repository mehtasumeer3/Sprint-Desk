import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useToast } from "./useToast";
import { useToastStore } from "../stores/toastStore";
beforeEach(() => useToastStore.setState({ toasts: [] }));
describe("useToast", () => {
  it("adds a toast to the toast store", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current("Saved", "success");
    });
    expect(useToastStore.getState().toasts[0]).toMatchObject({
      message: "Saved",
      tone: "success",
    });
  });
});
