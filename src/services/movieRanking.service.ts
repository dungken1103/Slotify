import { bookingService } from "./bookingService";
import { ShowtimeService } from "./showtime.service";

const FEATURED_CACHE_KEY = "slotify.topBookedMovieIds.v1";
const FEATURED_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_SHOWTIMES_TO_SCAN = 80;
const MAX_CONCURRENT_REQUESTS = 8;

type MovieBookingScore = Record<string, number>;

function readCache(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FEATURED_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expiresAt: number; ids: string[] };
    if (!parsed?.expiresAt || !Array.isArray(parsed.ids)) return null;
    if (Date.now() > parsed.expiresAt) return null;
    return parsed.ids;
  } catch {
    return null;
  }
}

function writeCache(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      FEATURED_CACHE_KEY,
      JSON.stringify({
        expiresAt: Date.now() + FEATURED_CACHE_TTL_MS,
        ids,
      })
    );
  } catch {
    // ignore cache failures
  }
}

function getShowtimesFromResponse(raw: any): any[] {
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw)) return raw;
  return [];
}

async function mapWithConcurrency<T, R>(
  list: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  const runners = Array.from({ length: Math.min(concurrency, list.length) }, async () => {
    while (index < list.length) {
      const current = index++;
      // eslint-disable-next-line no-await-in-loop
      const out = await worker(list[current]);
      results[current] = out;
    }
  });

  await Promise.all(runners);
  return results;
}

export const movieRankingService = {
  async getTopBookedMovieIds(limit: number = 10): Promise<string[]> {
    const cached = readCache();
    if (cached && cached.length > 0) return cached.slice(0, limit);

    try {
      const showtimesRes = await ShowtimeService.getAll();
      const allShowtimes = getShowtimesFromResponse(showtimesRes)
        .filter((s: any) => s?.id && s?.movieId)
        .slice(0, MAX_SHOWTIMES_TO_SCAN);

      if (allShowtimes.length === 0) return [];

      const seatStats = await mapWithConcurrency(
        allShowtimes,
        async (s: any) => {
          try {
            const seats = await bookingService.getAvailableSeats(String(s.id));
            const unavailable = (seats || []).filter((seat) => seat && seat.isAvailable === false).length;
            return { movieId: String(s.movieId), unavailable };
          } catch {
            return { movieId: String(s.movieId), unavailable: 0 };
          }
        },
        MAX_CONCURRENT_REQUESTS
      );

      const scoreMap: MovieBookingScore = {};
      for (const row of seatStats) {
        scoreMap[row.movieId] = (scoreMap[row.movieId] || 0) + row.unavailable;
      }

      const topIds = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .map(([movieId]) => movieId)
        .slice(0, limit);

      writeCache(topIds);
      return topIds;
    } catch (error) {
      console.error("Error calculating top-booked movies", error);
      return [];
    }
  },
};

