export interface Movie {
  id: number; title: string; overview: string; poster_path: string | null; backdrop_path: string | null;
  vote_average: number; vote_count: number; popularity: number; release_date: string; adult?: boolean;
  genre_ids?: number[];
}
export interface Genre { id: number; name: string }
export interface Company { id: number; name: string }
export interface MovieDetail extends Movie {
  genres: Genre[]; runtime: number | null; tagline: string; status: string;
  production_companies: Company[]; spoken_languages: { english_name: string }[];
  images?: { backdrops: { file_path: string }[]; posters: { file_path: string }[] };
  release_dates?: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  videos?: { results: { key: string; site: string; type: string; name: string }[] };
  similar?: Page<Movie>;
  keywords?: { keywords: Genre[] };
}
export interface Page<T> { page: number; results: T[]; total_pages: number; total_results: number }
export type ImgSize = "w185" | "w300" | "w342" | "w500" | "w780" | "w1280" | "original";
export type Params = Record<string, string | number>;

const BASE = "https://api.themoviedb.org/3";
const KEY = import.meta.env.VITE_TMDB_KEY as string | undefined;

/** TMDB client. Every response is mirrored to localStorage, so the store keeps working offline. */
export class TMDBService {
  private static instance: TMDBService;
  static get(): TMDBService { return (this.instance ??= new TMDBService()); }

  private inflight = new Map<string, Promise<unknown>>();
  private genreNames: Map<number, string> | null = null;

  img(path: string | null | undefined, size: ImgSize = "w342") {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
  }

  private async request<T>(endpoint: string, params: Params = {}): Promise<T> {
    if (!KEY) throw new Error("Missing VITE_TMDB_KEY — copy .env.example to .env and add your TMDB key.");
    const qs = new URLSearchParams(Object.entries({ language: "en-US", ...params }).map(([k, v]) => [k, String(v)]));
    const cacheKey = `tmdb:${endpoint}?${qs}`;
    const pending = this.inflight.get(cacheKey);
    if (pending) return pending as Promise<T>;
    qs.set("api_key", KEY);
    const run = (async () => {
      try {
        if (!navigator.onLine) throw new Error("offline");
        const res = await fetch(`${BASE}${endpoint}?${qs}`);
        if (!res.ok) throw new Error(`TMDB error ${res.status}`);
        const data = (await res.json()) as T;
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* quota */ }
        return data;
      } catch (err) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached) as T;
        throw navigator.onLine ? err : new Error("You're offline and this page hasn't been saved yet.");
      } finally {
        this.inflight.delete(cacheKey);
      }
    })();
    this.inflight.set(cacheKey, run);
    return run;
  }

  trending(page = 1) { return this.request<Page<Movie>>("/trending/movie/week", { page }); }
  nowPlaying(page = 1) { return this.request<Page<Movie>>("/movie/now_playing", { page }); }
  popular(page = 1) { return this.request<Page<Movie>>("/movie/popular", { page }); }
  topRated(page = 1) { return this.request<Page<Movie>>("/movie/top_rated", { page }); }
  upcoming(page = 1) { return this.request<Page<Movie>>("/movie/upcoming", { page }); }
  search(query: string, page = 1) { return this.request<Page<Movie>>("/search/movie", { query, page }); }
  discover(params: Params, page = 1) { return this.request<Page<Movie>>("/discover/movie", { ...params, page }); }
  /** Titles released in the last `days` days, newest first unless `sort` says otherwise. */
  newReleases(page = 1, sort = "primary_release_date.desc", days = 60) {
    const day = (offset: number) => new Date(Date.now() - offset * 864e5).toISOString().slice(0, 10);
    return this.discover({ sort_by: sort, "primary_release_date.gte": day(days), "primary_release_date.lte": day(0), "vote_count.gte": 3 }, page);
  }
  detail(id: number | string) {
    return this.request<MovieDetail>(`/movie/${id}`, {
      append_to_response: "images,release_dates,videos,similar,keywords",
      include_image_language: "en,null",
    });
  }

  async genres(): Promise<Map<number, string>> {
    if (this.genreNames) return this.genreNames;
    const { genres } = await this.request<{ genres: Genre[] }>("/genre/movie/list");
    return (this.genreNames = new Map(genres.map((g) => [g.id, g.name])));
  }
  /** Genre names for a list item; empty until `genres()` has resolved once. */
  tagsFor(m: Movie, max = 4): string[] {
    return (m.genre_ids ?? []).slice(0, max).map((id) => this.genreNames?.get(id)).filter((n): n is string => !!n);
  }
}
