import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Comment, Task, TaskStatus } from '../types';

type Snapshot = { tasks: Task[] };
type BoardState = {
  tasks: Task[];
  comments: Comment[];
  hydrated: boolean;
  lastSnapshot: Snapshot | null;
  hydrate: (tasks: Task[], comments: Comment[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, patch: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  moveTask: (id: number, status: TaskStatus, newIndex: number) => void;
  addComment: (comment: Comment) => void;
  undoLastMove: () => void;
};

function normalize(tasks: Task[], status: TaskStatus) {
  return tasks
    .filter((t) => t.status === status)
    .sort((a, b) => a.order - b.order)
    .map((t, i) => ({ ...t, order: i + 1 }));
}

export const useBoardStore = create<BoardState>()(persist((set, get) => ({
  tasks: [], comments: [], hydrated: false, lastSnapshot: null,
  hydrate: (tasks, comments) => {
    if (get().hydrated && get().tasks.length) return;
    set({ tasks, comments, hydrated: true });
  },
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), comments: s.comments.filter((c) => c.taskId !== id) })),
  moveTask: (id, status, newIndex) => set((s) => {
    const snapshot = { tasks: s.tasks };
    const moving = s.tasks.find((t) => t.id === id);
    if (!moving) return s;
    const remaining = s.tasks.filter((t) => t.id !== id);
    const target = normalize(remaining, status);
    const moved: Task = { ...moving, status, order: newIndex + 1, completedAt: status === 'done' ? (moving.completedAt ?? new Date().toISOString()) : null, updatedAt: new Date().toISOString() };
    target.splice(Math.max(0, Math.min(newIndex, target.length)), 0, moved);
    const targetIds = new Set(target.map((t) => t.id));
    const normalizedTarget = target.map((t, i) => ({ ...t, order: i + 1 }));
    return { tasks: [...remaining.filter((t) => t.status !== status || targetIds.has(t.id) === false), ...normalizedTarget], lastSnapshot: snapshot };
  }),
  addComment: (comment) => set((s) => ({ comments: [...s.comments, comment] })),
  undoLastMove: () => set((s) => s.lastSnapshot ? { tasks: s.lastSnapshot.tasks, lastSnapshot: null } : s),
}), { name: 'sprintdesk-board', partialize: (s) => ({ tasks: s.tasks, comments: s.comments, hydrated: s.hydrated }) }));
