// src/lib/memePool.ts
export type MemePoolResponse = { files: string[] };

export async function fetchMemePool(): Promise<string[]> {
  const res = await fetch("/api/meme-pool");
  if (!res.ok) {
    throw new Error(`Failed to fetch meme pool: ${res.status}`);
  }
  const data = (await res.json()) as MemePoolResponse;
  if (!Array.isArray(data.files)) return [];
  return data.files;
}
