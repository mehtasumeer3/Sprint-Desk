import { beforeEach, describe, expect, it } from "vitest";
import { useBoardStore } from "./boardStore";
import type { Task } from "../types";
const base: Task = {
  id: 1,
  title: "A",
  description: "",
  status: "backlog",
  priority: "high",
  assigneeId: 1,
  dueDate: "2026-08-25",
  sprintId: 3,
  order: 1,
  createdAt: "2026-08-20T00:00:00Z",
  completedAt: null,
  updatedAt: "2026-08-20T00:00:00Z",
};
beforeEach(() =>
  useBoardStore.setState({
    tasks: [base],
    comments: [],
    hydrated: true,
    lastSnapshot: null,
  }),
);
describe("boardStore", () => {
  it("adds a task", () => {
    useBoardStore.getState().addTask({ ...base, id: 2, title: "B" });
    expect(useBoardStore.getState().tasks).toHaveLength(2);
  });
  it("moves a task between columns", () => {
    useBoardStore.getState().moveTask(1, "done", 0);
    expect(useBoardStore.getState().tasks.find((t) => t.id === 1)?.status).toBe(
      "done",
    );
  });
  it("deletes a task", () => {
    useBoardStore.getState().deleteTask(1);
    expect(useBoardStore.getState().tasks).toHaveLength(0);
  });
});
