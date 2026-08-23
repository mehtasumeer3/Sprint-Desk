export interface PostNotification {
  id: number;
  title: string;
  body: string;
}

const BASE_URL = import.meta.env.VITE_JSONPLACEHOLDER_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

export async function pollPosts(): Promise<PostNotification[]> {
  const response = await fetch(`${BASE_URL}/posts?_limit=5`);
  if (!response.ok) throw new Error('Notification polling failed.');
  return (await response.json()) as PostNotification[];
}
