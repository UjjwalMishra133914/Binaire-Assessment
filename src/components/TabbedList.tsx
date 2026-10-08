import { useEffect, useRef, useState } from "react";
import { Link } from "./Link";
import { LazyImage } from "./LazyImage";
import { Price } from "./Price";
import { WindowsIcon } from "./Icons";
import { TMDBService, type Movie, type Page } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { ReviewSummary } from "../core/ReviewSummary";
import { useAsync, useGenres, useInView } from "../core/hooks";
import { Paginator } from "../core/Paginator";
import { Pagination } from "./Pagination";

export interface ListTab { id: string; label: string; load: (page: number) => Promise<Page<Movie>>; more: string }

const REVIEW_TONE = { positive: "text-[#66c0f4]", mixed: "text-[#b9a074]", negative: "text-[#a34c25]", none: "text-[#556772]" } as const;


export function TabbedList({ tabs, title, id, paged = false }: { tabs: ListTab[]; title?: string; id: string; paged?: boolean }) {
  const [active, setActive] = useState(tabs[0].id);
  const [page, setPage] = useState(1);
  const paginator = useRef(new Paginator()).current;
  const select = (t: string) => { setActive(t); setPage(1); };
  const [ref, seen] = useInView<HTMLElement>();
  const tab = tabs.find((t) => t.id === active)!;
  useGenres();
  const { data, loading, error } = useAsync(() => (seen ? tab.load(page) : new Promise<null>(() => {})), [seen, active, page]);
  if (data) paginator.update(data.page, data.total_pages);
  const items = data?.results.slice(0, paged ? 20 : 10) ?? [];
  const [focus, setFocus] = useState<Movie | null>(null);
  useEffect(() => { setFocus(items[0] ?? null); }, [data]); 
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const n = (i + d + tabs.length) % tabs.length;
    select(tabs[n].id); tabRefs.current[n]?.focus();
  };

  return (
    <section id={id} ref={ref} aria-label={title ?? tabs.map((t) => t.label).join(", ")} className="mb-10">
      {title && <h2 className="section-title mb-2">{title}</h2>}
      <div role="tablist" aria-label="Lists" className="no-scrollbar flex overflow-x-auto whitespace-nowrap">
        {tabs.map((t, i) => (
          <button key={t.id} ref={(el) => (tabRefs.current[i] = el)} type="button" role="tab" id={`${id}-tab-${t.id}`} aria-selected={t.id === active} aria-controls={`${id}-panel`}
            tabIndex={t.id === active ? 0 : -1} onClick={() => select(t.id)} onKeyDown={(e) => onTabKey(e, i)}
            className={`mr-0.5 rounded-t-[3px] px-2.5 font-motiva text-[13px] leading-[24px] transition-colors ${t.id === active
              ? "bg-[linear-gradient(to_bottom,rgba(103,193,245,1)_0%,rgba(103,193,245,0)_100%)] text-white"
              : "bg-[rgba(42,63,90,.6)] text-[#4f94bc] hover:text-white active:text-steam-link"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="flex gap-0 bg-[linear-gradient(to_bottom,rgba(103,193,245,.25)_0,transparent_5px)] pt-[7px]">
        <div className="min-w-0 flex-1 lg:max-w-[616px]">
          {error && <p role="alert" className="bg-black/20 p-4 text-[13px] text-[#e97a4a]">{error}</p>}
          <ul key={`${active}-${page}`} className="anim-fade-in" aria-busy={loading}>
            {(loading ? Array.from({ length: 10 }, () => null) : items).map((m, i) => (
              <li key={m?.id ?? i}>
                {m ? <TabRow movie={m} focused={focus?.id === m.id} onFocus={() => setFocus(m)} />
                  : <div className="skeleton mb-[5px] h-[69px]" />}
              </li>
            ))}
          </ul>
          {paged && data ? (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 bg-black/20 p-1.5 text-[12px] text-steam-muted">
              <span>Showing {(page - 1) * 20 + 1}-{(page - 1) * 20 + data.results.length} of {data.total_results.toLocaleString("en-IN")} results</span>
              <Pagination paginator={paginator} onChange={(p) => { setPage(p); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }} />
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-end gap-1.5 bg-black/20 p-1 text-[12px] text-steam-muted">
              See more: <Link to={tab.more} className="btn-blue btn-sm">{tab.label}</Link>
            </div>
          )}
        </div>
        <TabPreview movie={focus} />
      </div>
    </section>
  );
}

function TabRow({ movie: m, focused, onFocus }: { movie: Movie; focused: boolean; onFocus: () => void }) {
  const api = TMDBService.get();
  const tags = api.tagsFor(m);
  return (
    <Link to={`/app/${m.id}`} onMouseEnter={onFocus} onFocus={onFocus}
      className={`group relative mb-[5px] flex h-[69px] items-center transition-[background,margin] duration-200 active:brightness-95 ${focused
        ? "bg-[linear-gradient(to_right,#c6e6f8_5%,#95bcd3_95%)] lg:-mr-[18px] lg:pr-[14px]"
        : "bg-black/20 hover:bg-black/30"}`}>
      <LazyImage src={api.img(m.backdrop_path, "w300")} alt="" className="h-[69px] w-[184px] shrink-0 max-sm:w-[120px]" />
      <div className="min-w-0 flex-1 px-3">
        <div className={`truncate text-[15px] leading-[18px] transition-colors duration-200 ${focused ? "text-[#10161b]" : "text-[#c7d5e0]"}`}>{m.title}</div>
        <div className={`mt-0.5 flex items-center gap-1.5 text-[12px] leading-5 ${focused ? "text-[#5e6d7c]" : "text-steam-tag"}`}>
          <WindowsIcon />
          <span className="truncate">{tags.join(", ") || (m.release_date ? `Released ${new Date(m.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "")}</span>
        </div>
      </div>
      <Price price={PriceEngine.of(m)} className="mr-2" onLight={focused} />
    </Link>
  );
}

function TabPreview({ movie }: { movie: Movie | null }) {
  const api = TMDBService.get();
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    if (!movie) return;
    const t = setTimeout(() => setId(movie.id), 120);
    return () => clearTimeout(t);
  }, [movie]);
  const { data } = useAsync(() => (id ? api.detail(id) : Promise.resolve(null)), [id]);
  if (!movie) return <aside className="hidden w-[308px] shrink-0 bg-[#95bcd3] lg:block" />;
  const review = ReviewSummary.of(movie);
  const shots = (data?.id === movie.id ? data.images?.backdrops.slice(0, 4).map((b) => b.file_path) : null) ?? [movie.backdrop_path];
  return (
    <aside aria-label={`${movie.title} preview`} className="hidden w-[308px] shrink-0 self-start bg-[#95bcd3] px-4 pb-4 pt-[9px] lg:block">
      <div key={movie.id} className="anim-fade-in">
        <h3 className="font-motiva text-[21px] leading-[26px] text-[#263645]">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[#263645]">
          Overall user reviews: <span className={`font-bold ${review.tone === "positive" ? "text-[#2a5f84]" : review.tone === "mixed" ? "text-[#7a5b26]" : "text-[#7a2f12]"}`} title={review.tooltip}>{review.label}</span>
          <span className="opacity-70">({review.count.toLocaleString("en-IN")})</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {api.tagsFor(movie, 5).map((t) => <span key={t} className="rounded-sm bg-[rgba(38,54,69,.4)] px-[7px] text-[11px] leading-[19px] text-[#e5ebf0]">{t}</span>)}
        </div>
        {shots.map((s, i) => <LazyImage key={`${s}-${i}`} src={api.img(s, "w500")} alt="" className="mt-[3px] aspect-video w-full first:mt-2" />)}
      </div>
    </aside>
  );
}

export { REVIEW_TONE };
