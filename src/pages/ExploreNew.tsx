import { useEffect, useState } from "react";
import { TMDBService, type Movie } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { ReviewSummary } from "../core/ReviewSummary";
import { useAsync, useInView } from "../core/hooks";
import { Link } from "../components/Link";
import { LazyImage } from "../components/LazyImage";
import { Price } from "../components/Price";
import { Carousel } from "../components/Carousel";
import { SectionHead } from "../components/SectionHead";
import { TabbedList, REVIEW_TONE } from "../components/TabbedList";

/** "New & Noteworthy → New Releases" (Steam's /explore/new). */
export default function ExploreNew() {
  useEffect(() => { document.title = "New On Steam"; }, []);
  const api = TMDBService.get();
  const { data, error } = useAsync(() => api.newReleases(1, "popularity.desc"), []);
  const popular = data?.results.filter((m) => m.backdrop_path) ?? [];
  return (
    <div className="mx-auto max-w-[940px] px-2 lg:px-0">
      <nav aria-label="Breadcrumb" className="text-[12px] text-[#8f98a0]">
        <Link to="/search" className="hover:text-white">All Movies</Link> &gt; <span aria-current="page">New Releases</span>
      </nav>
      <h1 className="mb-4 mt-1 font-motiva text-[26px] font-normal text-white">New Releases</h1>
      {error && <p role="alert" className="mb-6 bg-black/30 p-4 text-[13px] text-[#e97a4a]">{error}</p>}

      <div className="mb-10 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {(popular.length ? popular.slice(0, 2) : [null, null]).map((m, i) => m ? (
          <Link key={m.id} to={`/app/${m.id}`} className="group block bg-black/20 shadow-[0_0_6px_rgba(0,0,0,.4)] transition hover:bg-[rgba(103,193,245,.12)] active:scale-[.99]">
            <LazyImage src={api.img(m.backdrop_path, "w780")} alt={m.title} className="aspect-[460/215] w-full" imgClassName="transition duration-500 group-hover:brightness-110" />
            <div className="flex items-center justify-between p-2.5">
              <span className="font-motiva text-[13px] text-[#c6d4df] group-hover:text-white">Popular this month</span>
              <Price price={PriceEngine.of(m)} />
            </div>
          </Link>
        ) : <div key={i} className="skeleton aspect-[460/250]" />)}
      </div>

      <DiscoveryQueue items={popular.slice(2)} />
      <TopSellers />
      <TabbedList id="new-tabs" paged tabs={[
        { id: "popular", label: "Popular New Releases", load: (p) => api.newReleases(p, "popularity.desc"), more: "/explore/new" },
        { id: "new", label: "New Releases", load: (p) => api.newReleases(p), more: "/explore/new" },
      ]} />
      <PriceBand id="under500" title="Under ₹ 500" max={500} />
      <PriceBand id="under250" title="Under ₹ 250" max={250} />
    </div>
  );
}

function DiscoveryQueue({ items }: { items: Movie[] }) {
  const api = TMDBService.get();
  const [i, setI] = useState(0);
  const queue = items.slice(0, 8);
  const done = queue.length > 0 && i >= queue.length;
  const cur = queue[i];
  return (
    <section id="queue" aria-labelledby="queue-h" className="mb-10 rounded-[3px] bg-[linear-gradient(to_bottom,rgba(42,71,94,.9),rgba(23,37,51,.9))] p-4">
      <h2 id="queue-h" className="font-motiva text-[19px] text-white">Your New Release Queue</h2>
      <p className="mb-3 text-[13px] text-[#8f98a0]">Explore all new releases starting with the latest and working your way back. ({Math.min(i, queue.length)}/{queue.length} viewed)</p>
      {done ? (
        <div className="anim-fade-in flex flex-col items-center gap-3 py-10 text-center">
          <h3 className="font-motiva text-[17px] text-white">You have viewed all the products in your queue for today.</h3>
          <button type="button" className="btn-blue" onClick={() => setI(0)}>Start another queue</button>
        </div>
      ) : (
        <div className="flex items-stretch gap-4 max-sm:flex-col">
          <div className="relative w-[460px] shrink-0 max-sm:w-full">
            {queue.slice(i + 1, i + 4).reverse().map((m, k, arr) => (
              <div key={m.id} aria-hidden className="absolute top-0 h-full w-full overflow-hidden opacity-50 transition-all duration-500"
                style={{ transform: `translateX(${(arr.length - k) * 14}px) scale(${1 - (arr.length - k) * 0.04})` }}>
                <LazyImage src={api.img(m.backdrop_path, "w780")} alt="" className="h-full w-full" />
              </div>
            ))}
            {cur ? (
              <Link key={cur.id} to={`/app/${cur.id}`} className="anim-next relative block shadow-[0_0_10px_#000] transition hover:brightness-110 active:scale-[.99]">
                <LazyImage src={api.img(cur.backdrop_path, "w780")} alt={cur.title} className="aspect-[460/215] w-full" />
              </Link>
            ) : <div className="skeleton aspect-[460/215] w-full" />}
          </div>
          {cur && (
            <div key={cur.id} className="anim-fade-in flex min-w-0 flex-1 flex-col">
              <h3 className="font-motiva text-[21px] leading-tight text-white">{cur.title}</h3>
              <p className={`mt-1 text-[12px] ${REVIEW_TONE[ReviewSummary.of(cur).tone]}`}>{ReviewSummary.of(cur).label}</p>
              <p className="mt-2 line-clamp-3 text-[13px] text-[#acb2b8]">{cur.overview}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <Price price={PriceEngine.of(cur)} />
                <button type="button" className="btn-blue" onClick={() => setI(i + 1)}>Next in Queue &gt;</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function TopSellers() {
  const api = TMDBService.get();
  const [ref, seen] = useInView<HTMLElement>();
  const { data } = useAsync(() => (seen ? api.nowPlaying() : Promise.resolve(null)), [seen]);
  const items = data?.results.filter((m) => m.backdrop_path).slice(0, 16) ?? [];
  return (
    <section id="top-new" ref={ref} aria-labelledby="top-new-h" className="mb-10">
      <SectionHead id="top-new-h" title="New Top Sellers Released This Month" more="/search?filter=topsellers" moreLabel="See all" />
      {!items.length ? <div className="grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((k) => <div key={k} className="skeleton h-[140px]" />)}</div> : (
        <Carousel label="New top sellers" pages={Math.ceil(items.length / 4)} render={(p) => (
          <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">{items.slice(p * 4, p * 4 + 4).map((m) => <SmallCapsule key={m.id} movie={m} />)}</div>
        )} />
      )}
    </section>
  );
}

function PriceBand({ id, title, max }: { id: string; title: string; max: number }) {
  const api = TMDBService.get();
  const [ref, seen] = useInView<HTMLElement>();
  const { data } = useAsync(async () => {
    if (!seen) return null;
    const pages = await Promise.all([1, 2, 3].map((p) => api.newReleases(p, "popularity.desc", 120)));
    const unique = [...new Map(pages.flatMap((p) => p.results).map((m) => [m.id, m])).values()];
    return unique.filter((m) => m.backdrop_path && !PriceEngine.of(m).free && PriceEngine.of(m).final <= max).slice(0, 8);
  }, [seen]);
  return (
    <section id={id} ref={ref} aria-labelledby={`${id}-h`} className="mb-10">
      <SectionHead id={`${id}-h`} title={title} more={`/search?maxprice=${max}`} moreLabel="See all" />
      <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
        {data ? data.map((m) => <SmallCapsule key={m.id} movie={m} />) : [0, 1, 2, 3].map((k) => <div key={k} className="skeleton h-[140px]" />)}
        {data?.length === 0 && <p className="col-span-full text-[13px] text-steam-muted">Nothing new in this price range right now.</p>}
      </div>
    </section>
  );
}

function SmallCapsule({ movie: m }: { movie: Movie }) {
  const api = TMDBService.get();
  return (
    <Link to={`/app/${m.id}`} className="group block bg-black/20 shadow-[0_0_4px_rgba(0,0,0,.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(103,193,245,.12)] active:translate-y-0">
      <LazyImage src={api.img(m.backdrop_path, "w300")} alt="" className="aspect-[231/87] w-full" imgClassName="transition duration-300 group-hover:brightness-110" />
      <div className="p-1.5">
        <div className="truncate text-[12px] text-[#c7d5e0] group-hover:text-white">{m.title}</div>
        <div className="mt-1 flex justify-end"><Price price={PriceEngine.of(m)} /></div>
      </div>
    </Link>
  );
}
