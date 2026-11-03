// creators.sa unified donation leaderboard — AB2DY.
// Public endpoint, no token:
//   /v1/kebab/unified/ab2dy/leaderboard?limit=5&duration=lifetime|monthly|weekly
// Response: [{ uname: string, total: number, last_donation_at: string }]
// Layers: 1) /api/kick proxy (dev+prod, no CORS) 2) direct fetch 3) cache.

import { kickFetch } from './kickApi';

export type BoardDuration = 'lifetime' | 'monthly' | 'weekly';

export interface Supporter {
  name: string;
  amount: number; // total SAR for the window
  rank: number;
}

const API_BASE = 'https://api.creators.sa/v1/kebab/unified/ab2dy/leaderboard';
const cacheKey = (d: BoardDuration) => `ab2dy_supporters_${d}_v1`;
export const SUPPORTERS_TTL_MS = 5 * 60 * 1000;

function normalize(input: any): Supporter[] {
  const arr = Array.isArray(input) ? input : Array.isArray(input?.data) ? input.data : [];
  return arr
    .filter((d: any) => d && typeof d?.uname === 'string' && d.uname.trim())
    .map((d: any, i: number) => ({
      name: d.uname.trim(),
      amount: Math.max(0, Math.round(Number(d.total) || 0)),
      rank: i + 1,
    }))
    .slice(0, 5);
}

function readCache(duration: BoardDuration): Supporter[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(duration));
    if (!raw) return null;
    const { at, list } = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    if (Date.now() - at > SUPPORTERS_TTL_MS) return null;
    return list;
  } catch {
    return null;
  }
}

function writeCache(duration: BoardDuration, list: Supporter[]): void {
  try {
    localStorage.setItem(cacheKey(duration), JSON.stringify({ at: Date.now(), list }));
  } catch {}
}

/** Top 5 donors for one window: lifetime, monthly or weekly. */
export async function getSupporters(duration: BoardDuration): Promise<Supporter[]> {
  const url = `${API_BASE}?limit=5&duration=${duration}`;
  // 1) server proxy
  try {
    const list = normalize(await kickFetch(url));
    if (list.length) {
      writeCache(duration, list);
      return list;
    }
  } catch {}
  // 2) direct
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (res.ok) {
      const list = normalize(await res.json());
      if (list.length) {
        writeCache(duration, list);
        return list;
      }
    }
  } catch {}
  // 3) stale cache (even expired — better than nothing)
  try {
    const raw = localStorage.getItem(cacheKey(duration));
    if (raw) {
      const { list } = JSON.parse(raw);
      if (Array.isArray(list) && list.length) return list;
    }
  } catch {}
  return [];
}

export const getMonthlySupporters = () => getSupporters('monthly');
