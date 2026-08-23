import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../types';

type NotificationState = {
  notifications: Notification[];
  initialized: boolean;
  seenPostIds: number[];
  initialize: (items: Notification[]) => void;
  addFromPosts: (posts: { id: number; title: string; body: string }[]) => Notification[];
  markRead: (id: number) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>()(persist((set, get) => ({
  notifications: [], initialized: false, seenPostIds: [],
  initialize: (items) => { if (!get().initialized) set({ notifications: items, initialized: true }); },
  addFromPosts: (posts) => {
    const fresh = posts.filter((p) => !get().seenPostIds.includes(p.id));
    if (!fresh.length) return [];
    const now = Date.now();
    const created = fresh.map((p, index) => ({ id: now + index, title: p.title, message: p.body, type: 'poll', read: false, createdAt: new Date().toISOString(), externalId: p.id }));
    set((s) => ({ notifications: [...created, ...s.notifications].slice(0, 100), seenPostIds: [...new Set([...s.seenPostIds, ...fresh.map((p) => p.id)])] }));
    return created;
  },
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}), { name: 'sprintdesk-notifications' }));
