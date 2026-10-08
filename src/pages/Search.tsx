import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { TMDBService, type Movie, type Page } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { ReviewSummary } from "../core/ReviewSummary";
import { Paginator } from "../core/Paginator";
import { Router } from "../core/Router";
import { CartService } from "../core/CartService";
import { useAsync, useGenres } from "../core/hooks";
import { Link } from "../components/Link";
import { LazyImage } from "../components/LazyImage";
import { Price } from "../components/Price";
import { Pagination } from "../components/Pagination";
import { WindowsIcon } from "../components/Icons";
import { REVIEW_TONE } from "../components/TabbedList";

const SORTS = [
  { id: "relevance", label: "Relevance", tmdb: "popularity.desc" },
  { id: "released", label: "Release date", tmdb: "primary_release_date.desc" },
  { id: "name", label: "Name", tmdb: "title.asc" },
  { id: "price_asc", label: "Lowest Price", tmdb: "popularity.desc" },
  { id: "price_desc", label: "Highest Price", tmdb: "popularity.desc" },
  { id: "reviews", label: "User Reviews", tmdb: "vote_average.desc" },
];
const FILTERS: Record<string, string> = { topsellers: "Top Sellers", specials: "Special Offers", toprated: "Top Rated", upcoming: "Popular Upcoming", wishlist: "Your Wishlist" };
const PRICE_STEPS = [0, 250, 500, 1000, 2000, 3000, 5000];
const GENRES: [number, string][] = [
  [28, "Action"], [12, "Adventure"], [16, "Animation"], [35, "Comedy"], [80, "Crime"], [99, "Documentary"], [18, "Drama"], [10751, "Family"],
  [14, "Fantasy"], [36, "History"], [27, "Horror"], [10402, "Music"], [9648, "Mystery"], [10749, "Romance"], [878, "Science Fiction"], [53, "Thriller"], [10752, "War"], [37, "Western"],
];


export default function Search({ search }: { search: string }) {
  const api = TMDBService.get();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const term = params.get("term") ?? "";
  const filter = params.get("filter") ?? "";
  const genres = (params.get("genre") ?? "").split(",").filter(Boolean).map(Number);
  const sort = SORTS.find((s) => s.id === params.get("sort")) ?? SORTS[0];
  const maxPrice = params.has("maxprice") ? Number(params.get("maxprice")) : null;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const paginator = useRef(new Paginator(1, 1, 5)).current;
  useGenres();

  const go = (next: Record<string, string | number | null>, resetPage = true) => {
    const p = new URLSearchParams(search);
    Object.entries(next).forEach(([k, v]) => (v === null || v === "" ? p.delete(k) : p.set(k, String(v))));
    if (resetPage && !("page" in next)) p.delete("page");
    const qs = p.toString();
    Router.get().navigate(`/search${qs ? `?${qs}` : ""}`);
  };

  const { data, loading, error } = useAsync(async (): Promise<Page<Movie>> => {
    if (filter === "wishlist") {
      const ids = CartService.get().wishlistIds;
      const results = await Promise.all(ids.map((id) => api.detail(id)));
      return { page: 1, total_pages: 1, total_results: results.length, results };
    }
    if (term) return api.search(term, page);
    if (filter === "topsellers") return api.popular(page);
    if (filter === "toprated") return api.topRated(page);
    if (filter === "upcoming") return api.upcoming(page);
    const extra: Record<string, string | number> = sort.id === "reviews" ? { "vote_count.gte": 300 } : sort.id === "released" ? { "primary_release_date.lte": new Date().toISOString().slice(0, 10), "vote_count.gte": 5 } : {};
    return api.discover({ sort_by: sort.tmdb, ...(genres.length ? { with_genres: genres.join(",") } : {}), ...extra }, page);
  }, [term, filter, genres.join(","), sort.id, page]);

  if (data) paginator.update(data.page, data.total_pages);
  const rows = useMemo(() => {
    let r = data?.results ?? [];
    if (filter === "specials") r = r.filter((m) => PriceEngine.of(m).discount > 0);
    if (maxPrice !== null) r = r.filter((m) => PriceEngine.of(m).final <= maxPrice);
    if (genres.length && (term || filter)) r = r.filter((m) => genres.every((g) => m.genre_ids?.includes(g) ?? true));
    if (sort.id === "price_asc") r = [...r].sort((a, b) => PriceEngine.of(a).final - PriceEngine.of(b).final);
    if (sort.id === "price_desc") r = [...r].sort((a, b) => PriceEngine.of(b).final - PriceEngine.of(a).final);
    return r;
  }, [data, filter, maxPrice, genres.join(","), sort.id, term]); // eslint-disable-line react-hooks/exhaustive-deps

  const heading = term ? `Results for "${term}"` : FILTERS[filter] ?? (genres.length ? GENRES.filter(([id]) => genres.includes(id)).map(([, n]) => n).join(" + ") : "All Movies");
  useEffect(() => { document.title = `Steam Search${term ? `: ${term}` : ""}`; }, [term]);

  return (
    <div className="mx-auto max-w-[940px] px-2 lg:px-0">
      <nav aria-label="Breadcrumb" className="text-[12px] text-[#8f98a0]">
        <Link to="/" className="hover:text-white">Home</Link> &gt; <Link to="/search" className="hover:text-white">All Movies</Link>{heading !== "All Movies" && <> &gt; <span aria-current="page">{heading}</span></>}
      </nav>
      <h1 className="mb-3 mt-1 font-motiva text-[26px] text-white">{heading}</h1>

      <div className="flex gap-4 max-md:flex-col">
        <div className="min-w-0 flex-1">
          <SearchBar term={term} sort={sort.id} onSearch={(t) => go({ term: t })} onSort={(s) => go({ sort: s === "relevance" ? null : s })} />
          <p className="mb-1 mt-2 text-[12px] text-steam-muted" aria-live="polite">
            {loading ? "Searching…" : data ? `${(filter === "specials" || maxPrice !== null ? rows.length : data.total_results).toLocaleString("en-IN")} results match your search.` : ""}
          </p>
          {error && <p role="alert" className="bg-black/30 p-4 text-[13px] text-[#e97a4a]">{error}</p>}
          <div className="flex flex-col gap-[2px]" aria-busy={loading}>
            {loading ? Array.from({ length: 10 }, (_, i) => <div key={i} className="skeleton h-[45px]" />)
              : rows.map((m, i) => <ResultRow key={m.id} movie={m} index={i} />)}
            {!loading && data && rows.length === 0 && (
              <div className="bg-black/20 p-6 text-center text-[13px] text-steam-muted">
                {filter === "wishlist" ? "Your wishlist is empty — add titles from their store page." : "0 results match your search. Try another term or clear some filters."}
              </div>
            )}
          </div>
          {data && data.total_pages > 1 && filter !== "wishlist" && (
            <div className="mt-2 bg-black/20 p-1.5">
              <Pagination paginator={paginator} onChange={(p) => { go({ page: p }, false); }} />
            </div>
          )}
        </div>

        <aside className="w-[290px] shrink-0 space-y-3 max-md:w-full" aria-label="Filters">
          <FilterBlock title="Narrow by Price">
            <PriceSlider value={maxPrice} onChange={(v) => go({ maxprice: v })} />
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-[12px] text-[#c6d4df] transition hover:bg-white/5 hover:text-white">
              <input type="checkbox" className="accent-steam-link" checked={filter === "specials"} onChange={(e) => go({ filter: e.target.checked ? "specials" : null })} /> Special Offers
            </label>
          </FilterBlock>
          <FilterBlock title="Narrow by Section">
            {Object.entries(FILTERS).map(([id, label]) => (
              <label key={id} className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-[12px] text-[#c6d4df] transition hover:bg-white/5 hover:text-white">
                <input type="radio" name="section" className="accent-steam-link" checked={filter === id} onChange={() => go({ filter: id, term: null })} /> {label}
                {id === "wishlist" && <span className="ml-auto text-steam-muted">{CartService.get().wishlistCount}</span>}
              </label>
            ))}
            {filter && <button type="button" onClick={() => go({ filter: null })} className="mt-1 px-1 text-[12px] text-steam-link hover:text-white">Clear section</button>}
          </FilterBlock>
          <FilterBlock title="Narrow by Genre">
            <div className="max-h-[260px] overflow-y-auto pr-1">
              {GENRES.map(([id, name]) => (
                <label key={id} className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1 text-[12px] text-[#c6d4df] transition hover:bg-white/5 hover:text-white">
                  <input type="checkbox" className="accent-steam-link" checked={genres.includes(id)}
                    onChange={(e) => go({ genre: (e.target.checked ? [...genres, id] : genres.filter((g) => g !== id)).join(",") })} /> {name}
                </label>
              ))}
            </div>
          </FilterBlock>
        </aside>
      </div>
    </div>
  );
}

function SearchBar({ term, sort, onSearch, onSort }: { term: string; sort: string; onSearch: (t: string) => void; onSort: (s: string) => void }) {
  const [q, setQ] = useState(term);
  useEffect(() => setQ(term), [term]);
  const submit = (e: FormEvent) => { e.preventDefault(); onSearch(q.trim()); };
  return (
    <div className="flex flex-wrap items-center gap-2 bg-[rgba(0,0,0,.2)] p-2.5 focus-within:bg-[rgba(103,193,245,.08)]">
      <form onSubmit={submit} role="search" className="flex flex-1 items-center gap-1">
        <label htmlFor="term" className="sr-only">Search term</label>
        <input id="term" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="enter search term or tag"
          className="h-[30px] min-w-0 flex-1 rounded-[3px] border border-black/40 bg-[#316282] px-2 text-[14px] text-white placeholder:italic placeholder:text-[#0e1c25] transition hover:bg-[#3a6f93] focus:bg-[#3d77a0] focus:outline-none focus:ring-1 focus:ring-steam-link" />
        <button type="submit" className="btn-blue">Search</button>
      </form>
      <label className="flex items-center gap-2 text-[12px] text-steam-muted">Sort by
        <select value={sort} onChange={(e) => onSort(e.target.value)} className="steam-select !h-[30px]">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-[3px] bg-[rgba(0,0,0,.2)] transition focus-within:bg-[rgba(103,193,245,.08)] focus-within:shadow-[inset_0_0_0_1px_rgba(103,193,245,.35)]">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden className="bg-[linear-gradient(to_right,#2b4458,transparent)] px-2.5 py-1.5 font-motiva text-[12px] uppercase tracking-wide text-[#c6d4df]">{title}</div>
      <div className="p-2">{children}</div>
    </fieldset>
  );
}

function PriceSlider({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const idx = value === null ? PRICE_STEPS.length : Math.max(0, PRICE_STEPS.indexOf(value));
  const [local, setLocal] = useState(idx);
  useEffect(() => setLocal(idx), [idx]);
  const label = local >= PRICE_STEPS.length ? "Any Price" : local === 0 ? "Free" : `Under ${PriceEngine.format(PRICE_STEPS[local]).replace(".00", "")}`;
  return (
    <div className="px-1">
      <label htmlFor="price" className="sr-only">Maximum price</label>
      <input id="price" type="range" min={0} max={PRICE_STEPS.length} step={1} value={local} onChange={(e) => setLocal(+e.target.value)}
        onPointerUp={() => onChange(local >= PRICE_STEPS.length ? null : PRICE_STEPS[local])}
        onKeyUp={() => onChange(local >= PRICE_STEPS.length ? null : PRICE_STEPS[local])}
        className="w-full accent-steam-link" aria-valuetext={label} />
      <div className="text-[12px] text-[#c6d4df]">{label}</div>
    </div>
  );
}

function ResultRow({ movie: m, index }: { movie: Movie; index: number }) {
  const api = TMDBService.get();
  const review = ReviewSummary.of(m);
  const date = m.release_date ? new Date(m.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  return (
    <Link to={`/app/${m.id}`} style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
      className="anim-fade-up group flex h-[45px] items-center bg-[rgba(0,0,0,.2)] transition hover:bg-[linear-gradient(to_right,rgba(103,193,245,.25),rgba(103,193,245,.08))] focus-visible:bg-[rgba(103,193,245,.2)] active:brightness-90">
      <LazyImage src={api.img(m.backdrop_path, "w300")} alt="" className="h-[45px] w-[120px] shrink-0" />
      <div className="min-w-0 flex-1 px-3">
        <div className="truncate text-[15px] leading-[18px] text-[#c7d5e0] transition-colors group-hover:text-white">{m.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#556772]"><WindowsIcon width={11} height={11} /> {api.tagsFor(m, 3).join(", ")}</div>
      </div>
      <div className="w-[95px] shrink-0 text-[11px] text-[#4c6c8c] max-sm:hidden">{date}</div>
      <div className={`w-[18px] shrink-0 text-[14px] max-sm:hidden ${REVIEW_TONE[review.tone]}`} title={`${review.label}. ${review.tooltip}`} aria-label={review.label}>
        {review.tone === "positive" ? "▲" : review.tone === "mixed" ? "■" : review.tone === "negative" ? "▼" : ""}
      </div>
      <Price price={PriceEngine.of(m)} className="ml-2 mr-2 w-[100px] justify-end" />
    </Link>
  );
}
