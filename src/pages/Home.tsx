import { useEffect } from "react";
import { TMDBService, type Movie } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { useAsync, useGenres, useInView, useUser } from "../core/hooks";
import { Carousel } from "../components/Carousel";
import { LazyImage } from "../components/LazyImage";
import { Link } from "../components/Link";
import { SectionHead } from "../components/SectionHead";
import { SaleHero } from "../components/SaleHero";
import { Capsule, HoverCard } from "../components/Capsule";

const CATEGORIES: { id: number; name: string; tint: string }[] = [
  { id: 28, name: "Action", tint: "rgba(196, 47, 47, .75)" },
  { id: 12, name: "Adventure", tint: "rgba(36, 136, 109, .75)" },
  { id: 878, name: "Science Fiction", tint: "rgba(51, 82, 196, .75)" },
  { id: 27, name: "Horror", tint: "rgba(110, 14, 26, .8)" },
  { id: 35, name: "Comedy", tint: "rgba(214, 137, 16, .75)" },
  { id: 16, name: "Animation", tint: "rgba(160, 64, 196, .75)" },
  { id: 18, name: "Drama", tint: "rgba(28, 93, 140, .75)" },
  { id: 53, name: "Thriller", tint: "rgba(60, 60, 60, .8)" },
  { id: 14, name: "Fantasy", tint: "rgba(94, 64, 176, .75)" },
  { id: 80, name: "Crime", tint: "rgba(120, 72, 32, .8)" },
  { id: 10749, name: "Romance", tint: "rgba(196, 64, 120, .75)" },
  { id: 99, name: "Documentary", tint: "rgba(56, 120, 56, .75)" },
  { id: 10751, name: "Family", tint: "rgba(30, 140, 160, .75)" },
  { id: 9648, name: "Mystery", tint: "rgba(80, 60, 120, .8)" },
  { id: 10752, name: "War", tint: "rgba(90, 90, 50, .8)" },
];

const discounted = (ms: Movie[]) => ms.filter((m) => PriceEngine.of(m).discount > 0);

async function dealsFrom(pages: number[]) {
  const api = TMDBService.get();
  const res = await Promise.all(pages.map((p) => api.topRated(p)));
  return discounted(res.flatMap((r) => r.results)).filter((m) => m.backdrop_path);
}

export default function Home() {
  useEffect(() => {
    document.title = "Welcome to Freznel";
    document.body.classList.add("sale-theme");
    return () => document.body.classList.remove("sale-theme");
  }, []);
  useGenres();
  return (
    <div className="mx-auto max-w-[940px] px-2 lg:px-0">
      <SaleHero />
      <Featured />
      <DeepDiscounts />
      <DealGrid id="deals-1" load={() => dealsFrom([1, 2])} />
      <DiscoveryBanner />
      <DealGrid id="deals-2" load={() => dealsFrom([3, 4])} />
      <Categories />
      <UnderPrice />
    </div>
  );
}

function Featured() {
  const api = TMDBService.get();
  const { data, error } = useAsync(() => api.trending(), []);
  const items = data?.results.filter((m) => m.backdrop_path).slice(0, 12) ?? [];
  const pages = Math.ceil(items.length / 3);
  return (
    <section aria-labelledby="featured-h" className="mb-10">
      <h2 id="featured-h" className="sr-only">Featured & Recommended</h2>
      {error && <p role="alert" className="bg-black/30 p-6 text-[13px] text-[#e97a4a]">{error}</p>}
      {!items.length && !error && (
        <div className="grid grid-cols-3 gap-[10px] max-sm:grid-cols-1">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-[200px]" />)}</div>
      )}
      {pages > 0 && (
        <Carousel label="Featured" pages={pages} autoplay={6000} render={(p) => (
          <div className="grid grid-cols-3 gap-[10px] max-sm:grid-cols-1">
            {items.slice(p * 3, p * 3 + 3).map((m, i) => (
              <HoverCard key={m.id} movie={m} side={i === 2 ? "left" : "right"}>
                <Capsule movie={m} />
              </HoverCard>
            ))}
          </div>
        )} />
      )}
    </section>
  );
}

function DeepDiscounts() {
  const api = TMDBService.get();
  const [ref, seen] = useInView<HTMLElement>();
  const { data, error } = useAsync(async () => {
    if (!seen) return null;
    const [a, b] = await Promise.all([api.popular(1), api.popular(2)]);
    return discounted([...a.results, ...b.results]).filter((m) => m.backdrop_path).slice(0, 9);
  }, [seen]);
  const items = data ?? [];
  const pages = Math.ceil(items.length / 3);
  return (
    <section id="specials" ref={ref} aria-labelledby="specials-h" className="mb-10 bg-[#4a1a14]/60 p-3 shadow-[0_0_8px_rgba(0,0,0,.4)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 id="specials-h" className="font-motiva text-[18px] font-bold text-white">Featured Deep Discounts</h2>
          <p className="text-[14px] text-[#c6d4df]">Especially great deals on some of the all-time greats</p>
        </div>
        <Link to="/search?filter=specials" className="btn-blue btn-sm">See All</Link>
      </div>
      {error && <p role="alert" className="bg-black/30 p-4 text-[13px] text-[#e97a4a]">{error}</p>}
      {!data && !error && <div className="grid grid-cols-3 gap-[10px]">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-[200px]" />)}</div>}
      {pages > 0 && (
        <Carousel label="Deep discounts" pages={pages} render={(p) => (
          <div className="grid grid-cols-3 gap-[10px] max-sm:grid-cols-1">
            {items.slice(p * 3, p * 3 + 3).map((m, i) => (
              <HoverCard key={m.id} movie={m} side={i === 2 ? "left" : "right"}>
                <Capsule movie={m} />
              </HoverCard>
            ))}
          </div>
        )} />
      )}
    </section>
  );
}

function DealGrid({ id, load, count = 8 }: { id: string; load: () => Promise<Movie[]>; count?: number }) {
  const [ref, seen] = useInView<HTMLElement>();
  const { data, error } = useAsync(async () => (seen ? load() : null), [seen]);
  const items = (data ?? []).slice(0, count);
  return (
    <section id={id} ref={ref} aria-label="More deals" className="mb-10">
      {error && <p role="alert" className="bg-black/30 p-4 text-[13px] text-[#e97a4a]">{error}</p>}
      <div className="grid grid-cols-4 gap-[10px] max-md:grid-cols-2">
        {!data && !error && Array.from({ length: count }, (_, i) => <div key={i} className="skeleton aspect-[16/10]" />)}
        {items.map((m, i) => (
          <HoverCard key={m.id} movie={m} side={i % 4 === 3 ? "left" : "right"}>
            {/* LIVE badge demo ke liye id se decide hota hai */}
            <Capsule movie={m} live={m.id % 6 === 0} />
          </HoverCard>
        ))}
      </div>
    </section>
  );
}

function DiscoveryBanner() {
  const user = useUser();
  if (user) return null;
  return (
    <section id="signin" aria-labelledby="signin-h"
      className="mb-10 bg-[linear-gradient(90deg,#4a2f7a_0%,#1f5a8c_60%,#0f2b45_100%)] px-6 py-8 shadow-[0_0_8px_rgba(0,0,0,.5)]">
      <h2 id="signin-h" className="font-motiva text-[24px] text-white">Explore Your Discovery Queue</h2>
      <p className="mt-1 text-[15px] text-[#dfe8ef]">Sign in to discover top-selling, new and recommended titles.</p>
      <div className="mt-4 flex items-center gap-4">
        <Link to="/login" className="btn-steamui !px-4 !py-1.5 !text-[15px]">Sign In</Link>
        <span className="text-[13px] text-[#c6d4df]">Or <Link to="/join" className="text-white underline-offset-2 hover:underline">sign up</Link> and join Freznel for free</span>
      </div>
    </section>
  );
}

function Categories() {
  const api = TMDBService.get();
  const [ref, seen] = useInView<HTMLElement>();
  const { data } = useAsync(async () => {
    if (!seen) return null;
    const pool = [...(await api.trending()).results, ...(await api.popular()).results];
    const used = new Set<string>();
    return CATEGORIES.map((c) => {
      const fits = pool.filter((m) => m.genre_ids?.includes(c.id) && m.backdrop_path);
      const art = (fits.find((m) => !used.has(m.backdrop_path!)) ?? fits[0])?.backdrop_path ?? null;
      if (art) used.add(art);
      return { ...c, art };
    });
  }, [seen]);
  const cats = data ?? CATEGORIES.map((c) => ({ ...c, art: null as string | null }));
  return (
    <section id="categories" ref={ref} aria-labelledby="categories-h" className="mb-10">
      <SectionHead id="categories-h" title="Browse by Category" more="/search" />
      <Carousel label="Categories" pages={Math.ceil(cats.length / 5)} render={(p) => (
        <div className="grid grid-cols-5 gap-[10px] max-sm:grid-cols-2">
          {cats.slice(p * 5, p * 5 + 5).map((c) => (
            <Link key={c.id} to={`/search?genre=${c.id}`} className="group relative block aspect-[2/1] overflow-hidden rounded-[4px] shadow-[0_0_6px_rgba(0,0,0,.5)] active:scale-[.98]">
              <LazyImage src={api.img(c.art, "w500")} alt="" className="absolute inset-0 h-full w-full" imgClassName="transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c.tint}, transparent 85%)` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="whitespace-nowrap bg-white px-3 py-1 font-motiva text-[13px] font-bold uppercase text-[#1b2838] transition group-hover:bg-[#d6ecfa]">{c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )} />
    </section>
  );
}

function UnderPrice() {
  const api = TMDBService.get();
  const [ref, seen] = useInView<HTMLElement>();
  const { data } = useAsync(async () => {
    if (!seen) return null;
    const res = await Promise.all([1, 2, 3].map((p) => api.popular(p)));
    return res.flatMap((r) => r.results).filter((m) => m.backdrop_path && PriceEngine.of(m).final < 500).slice(0, 15);
  }, [seen]);
  const items = data ?? [];
  const pages = Math.ceil(items.length / 5);
  const pill = "bg-white/80 px-3 text-[13px] leading-6 text-[#1b2838] transition hover:bg-white active:brightness-90";
  return (
    <section id="under-500" ref={ref} aria-labelledby="under-h" className="mb-10">
      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 id="under-h" className="font-motiva text-[18px] font-bold text-white">Under ₹ 500</h2>
        <div className="flex items-center gap-2 text-[13px] text-[#c6d4df]">
          See more:
          <Link to="/search?maxprice=500" className={pill}>Under ₹ 500</Link>
          <Link to="/search?maxprice=250" className={pill}>Under ₹ 250</Link>
        </div>
      </div>
      {!data && <div className="grid grid-cols-5 gap-[10px] max-sm:grid-cols-2">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton aspect-[16/10]" />)}</div>}
      {pages > 0 && (
        <Carousel label="Under 500" pages={pages} render={(p) => (
          <div className="grid grid-cols-5 gap-[10px] max-sm:grid-cols-2">
            {items.slice(p * 5, p * 5 + 5).map((m, i) => (
              <HoverCard key={m.id} movie={m} side={i >= 3 ? "left" : "right"}><Capsule movie={m} /></HoverCard>
            ))}
          </div>
        )} />
      )}
    </section>
  );
}