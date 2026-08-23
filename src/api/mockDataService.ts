import type { MockData } from '../types';

let cache: MockData | null = null;

export async function getMockData(): Promise<MockData> {
  if (cache) return cache;
  const response = await fetch('/mock-data.json');
  if (!response.ok) throw new Error('Unable to load SprintDesk data.');
  cache = (await response.json()) as MockData;
  return cache;
}

export async function getTasks() {
  return (await getMockData()).tasks.slice(0, 30);
}

export async function getUsers() {
  return (await getMockData()).users;
}

export async function getSprints() {
  return (await getMockData()).sprints;
}

export async function getComments() {
  return (await getMockData()).comments;
}

export async function getInitialNotifications() {
  return (await getMockData()).notifications;
}
