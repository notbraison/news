import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getCategoriesWithCounts() {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getArticlesByCategoryPaginated(slug: string, limit: number, offset: number) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${slug}/posts?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export async function searchArticles(query: string) {
  const url = `${import.meta.env.VITE_API_BASE_URL}/posts?search=${encodeURIComponent(query)}`;
  console.log('Search URL:', url);
  const res = await fetch(url);
  console.log('Search response status:', res.status);
  if (!res.ok) throw new Error('Failed to search articles');
  const data = await res.json();
  console.log('Search response data:', data);
  return data;
}
