import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "./Link";
import { CaretDown, SearchIcon } from "./Icons";
import { Price } from "./Price";
import { Router } from "../core/Router";
import { TMDBService, type Movie } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { useCart, useLocation } from "../core/hooks";

const GENRES: [number, string][] = [
  [28, "Action"], [12, "Adventure"], [16, "Animation"], [35, "Comedy"], [80, "Crime"], [99, "Documentary"], [18, "Drama"],
  [10751, "Family"], [14, "Fantasy"], [36, "History"], [27, "Horror"], [10402, "Music"], [9648, "Mystery"],
  [10749, "Romance"], [878, "Science Fiction"], [53, "Thriller"], [10752, "War"], [37, "Western"],
];
const TOP: [number, string, string][] = [
  [28, "Action", "#c42f2f"], [12, "Adventure", "#24886d"], [878, "Science Fiction", "#3352c4"],
  [35, "Comedy", "#d68910"], [16, "Animation", "#a040c4"], [27, "Horror", "#6e0e1a"],
];

const head = "mb-2 font-motiva text-[11px] uppercase tracking-wider text-[#8f98a0]";
const col = "block py-1.5 text-[14px] text-[#c6d4df] transition hover:text-white hover:underline focus-visible:text-white";

/** Tab + poora-width mega panel (hover ya keyboard focus pe khulta hai). */
function Flyout({ label, to, children }: { label: string; to: string; children: ReactNode }) {
  return (
    <div className="group/fly shrink-0">
      <Link to={to} aria-haspopup="true"
        className="flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-[11px] font-motiva text-[13px] leading-[54px] text-white transition group-hover/fly:border-[#67c1f5] group-hover/fly:text-[#67c1f5] group-focus-within/fly:border-[#67c1f5] group-focus-within/fly:text-[#67c1f5]">
        {label}<CaretDown className="opacity-70" />
      </Link>
      <div className="invisible absolute inset-x-0 top-full z-40 translate-y-1 opacity-0 shadow-[0_10px_18px_rgba(0,0,0,.55)] transition duration-150 group-focus-within/fly:visible group-focus-within/fly:translate-y-0 group-focus-within/fly:opacity-100 group-hover/fly:visible group-hover/fly:translate-y-0 group-hover/fly:opacity-100 max-md:hidden">
        <div className="bg-[#171d25] px-4 pb-5 pt-4">{children}</div>
      </div>
    </div>
  );
}

function Promo({ to, label, a, b }: { to: string; label: string; a: string; b: string }) {
  return (
    <Link to={to} className="group flex h-[72px] items-center justify-center transition hover:brightness-110"
      style={{ background: `linear-gradient(120deg, ${a}, ${b})` }}>
      <span className="bg-white px-3 py-1.5 font-motiva text-[14px] font-bold uppercase text-[#1b2838] transition group-hover:bg-[#d6ecfa]">{label}</span>
    </Link>
  );
}

function BrowsePanel() {
  const items: [string, string, string][] = [
    ["/", "Store Home", ""],
    ["/explore/new", "New Releases", "Explore new content on Steam"],
    ["/search?filter=upcoming", "Upcoming Releases", "See what's on the release calendar"],
    ["/search?filter=topsellers", "All Charts & Stats", "Explore top titles by popularity"],
  ];
  return (
    <div className="grid grid-cols-[230px_1fr_330px] gap-8">
      <div>
        {items.map(([to, t, sub]) => (
          <Link key={t} to={to} className="group block py-2">
            <span className="block text-[15px] text-white group-hover:underline">{t}</span>
            {sub && <span className="block text-[12px] text-[#8f98a0]">{sub}</span>}
          </Link>
        ))}
      </div>
      <div className="space-y-1.5">
        <Promo to="/search?filter=topsellers" label="Top Sellers" a="#7b3fa0" b="#d0589a" />
        <Promo to="/search?filter=specials" label="Discounts & Events" a="#1f8a70" b="#3cc3a0" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={head}>Top destinations</p>
          <Link to="/search?maxprice=0" className={col}>Free to Play</Link>
          <Link to="/search?filter=upcoming" className={col}>Upcoming</Link>
          <Link to="/explore/new" className={col}>News &amp; Updates</Link>
          <Link to="/search?filter=specials" className={col}>Special Offers</Link>
        </div>
        <div>
          <p className={head}>My account</p>
          <Link to="/search?filter=wishlist" className={col}>My Wishlist</Link>
          <Link to="/login" className={col}>Sign In</Link>
          <Link to="/join" className={col}>Join Steam</Link>
        </div>
      </div>
    </div>
  );
}

function CategoriesPanel() {
  return (
    <div>
      <p className={head}>Your top categories</p>
      <div className="grid grid-cols-6 gap-2">
        {TOP.map(([id, name, c]) => (
          <Link key={id} to={`/search?genre=${id}`} className="group flex h-[84px] items-center justify-center rounded-md transition hover:brightness-125"
            style={{ background: `linear-gradient(135deg, ${c}, #171d25)` }}>
            <span className="bg-white px-2.5 py-1 font-motiva text-[12px] font-bold uppercase text-[#1b2838]">{name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {GENRES.slice(0, 12).map(([id, name]) => (
          <Link key={id} to={`/search?genre=${id}`} className="rounded-sm bg-[#2c5d82] px-2.5 text-[12px] leading-6 text-[#9ed3f5] transition hover:bg-[#3b7aa8] hover:text-white">{name}</Link>
        ))}
        <Link to="/search" className="ml-auto text-[13px] text-[#67c1f5] hover:text-white">View all tags ›</Link>
      </div>
      <p className={`${head} mt-4`}>All genres &amp; themes</p>
      <div className="grid grid-cols-6 gap-x-3">
        {GENRES.map(([id, name]) => <Link key={id} to={`/search?genre=${id}`} className={col}>{name}</Link>)}
      </div>
    </div>
  );
}

function LinksPanel({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className={head}>{title}</p>
      <div className="grid w-[560px] grid-cols-2 gap-x-8">
        {links.map(([to, t]) => <Link key={t} to={to} className={col}>{t}</Link>)}
      </div>
    </div>
  );
}

function SearchRow({ m }: { m: Movie }) {
  return (
    <li>
      <Link to={`/app/${m.id}`} className="flex items-center gap-3 bg-white/[.06] p-1 transition hover:bg-white/[.14] focus-visible:bg-white/[.14]">
        <img src={TMDBService.get().img(m.backdrop_path, "w300")} alt="" loading="lazy" className="h-[46px] w-[124px] shrink-0 bg-black object-cover" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] text-white">{m.title}</span>
          <Price price={PriceEngine.of(m)} className="mt-0.5" />
        </span>
      </Link>
    </li>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => { setOpen(false); }, [loc]);
  useEffect(() => {
    TMDBService.get().popular(1).then((r) => setPopular(r.results.filter((m) => m.backdrop_path).slice(0, 4))).catch(() => {});
  }, []);
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    const t = setTimeout(() => TMDBService.get().search(term).then((r) => setHits(r.results.slice(0, 5))).catch(() => setHits([])), 250);
    return () => clearTimeout(t);
  }, [q]);

  const typing = q.trim().length >= 2;
  const rows = typing ? hits : popular;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    Router.get().navigate(term ? `/search?term=${encodeURIComponent(term)}` : "/search");
  };
  return (
    <form ref={box} role="search" onSubmit={submit} className="relative flex min-w-0 max-w-[420px] flex-1 items-center"
      onFocus={() => setOpen(true)} onBlur={(e) => { if (!box.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <label htmlFor="store_search" className="sr-only">Search the store</label>
      <div className="flex h-[36px] w-full items-center bg-[#32353c] transition focus-within:bg-[#3b3f48] focus-within:shadow-[0_0_0_1px_#1a9fff] hover:bg-[#393c44]">
        <input id="store_search" type="search" autoComplete="off" placeholder="Search the store" value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          aria-controls="search_suggestions" aria-expanded={open && rows.length > 0}
          className="min-w-0 flex-1 bg-transparent px-2.5 text-[14px] text-white placeholder:italic placeholder:text-[#8f98a0] focus:outline-none" />
        <button type="submit" aria-label="Search" className="flex h-[36px] w-[30px] shrink-0 items-center justify-center bg-[#1a9fff] text-white transition hover:brightness-110 active:brightness-90 sm:w-[40px]">
          <SearchIcon width={16} height={16} />
        </button>
      </div>
      {open && rows.length > 0 && (
        <div id="search_suggestions" className="anim-pop absolute right-0 top-full z-50 mt-[3px] w-[500px] max-w-[92vw] bg-[#2d3340] p-2 shadow-[0_0_12px_#000]">
          {!typing && <p className="mb-1.5 px-1 text-[14px] text-white">Popular searches</p>}
          <ul className="space-y-1">{rows.map((m) => <SearchRow key={m.id} m={m} />)}</ul>
          <Link to="/search" className="mt-1.5 block bg-white/[.1] py-2 text-center text-[14px] text-white transition hover:bg-white/[.2]">Advanced Search</Link>
        </div>
      )}
    </form>
  );
}

/** Dark store navigation bar: mega-menu tabs + search box with popular searches. */
export function StoreNav() {
  const cart = useCart();
  const small = "btn-blue btn-sm !text-[11px] uppercase";
  return (
    <>
      <div className="mb-4 bg-[#171d25] shadow-[0_2px_6px_rgba(0,0,0,.4)]">
        <div className="mx-auto max-w-[940px] px-2 lg:px-0">
          <nav aria-label="Store" className="relative z-30 flex h-[56px] items-center gap-2">
            <div className="no-scrollbar flex min-w-0 items-stretch overflow-x-auto md:shrink-0 md:overflow-visible">
              <Flyout label="Browse" to="/"><BrowsePanel /></Flyout>
              <Flyout label="Recommendations" to="/search?filter=toprated">
                <LinksPanel title="Recommended for you" links={[
                  ["/search?filter=topsellers", "Top Sellers"], ["/explore/new", "New & Trending"],
                  ["/search?filter=toprated", "Top Rated"], ["/search?filter=upcoming", "Popular Upcoming"],
                ]} />
              </Flyout>
              <Flyout label="Categories" to="/search"><CategoriesPanel /></Flyout>
              <Flyout label="Ways to Play" to="/search">
                <LinksPanel title="Ways to play" links={[
                  ["/search?maxprice=0", "Free to Play"], ["/search?maxprice=250", "Under ₹ 250"],
                  ["/search?maxprice=500", "Under ₹ 500"], ["/search?filter=specials", "Special Offers"],
                ]} />
              </Flyout>
              <Flyout label="Special Sections" to="/search?filter=specials">
                <LinksPanel title="Special sections" links={[
                  ["/search?filter=specials", "Autumn Sale"], ["/explore/new", "New Releases"],
                  ["/search?filter=upcoming", "Upcoming Releases"], ["/search?filter=toprated", "Top Rated"],
                ]} />
              </Flyout>
            </div>
            <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
              {cart.wishlistCount > 0 && <Link to="/search?filter=wishlist" className={small}>Wishlist ({cart.wishlistCount})</Link>}
              {cart.items.length > 0 && <a href="#cart" className="flex h-6 shrink-0 items-center rounded-sm bg-[#5c7e10] px-2.5 text-[11px] uppercase text-white transition hover:bg-[#6b9312] active:translate-y-px">Cart ({cart.items.length})</a>}
              <SearchBox />
            </div>
          </nav>
        </div>
      </div>
      <CartDrawer />
    </>
  );
}

/** Cart opened through `#cart` — it exists only while it is the :target. */
function CartDrawer() {
  const cart = useCart();
  return (
    <section id="cart" aria-labelledby="cart-h" className="fixed inset-0 z-[80] hidden bg-black/60 target:flex target:items-start target:justify-end">
      <a href="#" aria-label="Close cart" className="absolute inset-0 cursor-default" />
      <div className="anim-next relative h-full w-full max-w-[380px] overflow-y-auto bg-[#1b2838] p-4 shadow-[0_0_20px_#000]">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="cart-h" className="section-title">Your shopping cart</h2>
          <a href="#" className="btn-blue btn-sm">Close</a>
        </div>
        {cart.items.length === 0 ? <p className="text-steam-muted">Your cart is empty.</p> : (
          <>
            <ul className="space-y-1">
              {cart.items.map((i) => (
                <li key={i.id} className="flex items-center gap-2 bg-black/20 p-2">
                  <img src={TMDBService.get().img(i.image, "w300")} alt="" className="h-[45px] w-[96px] bg-black object-cover" />
                  <Link to={`/app/${i.id}`} className="min-w-0 flex-1 truncate text-[13px] text-[#c7d5e0] hover:text-white">{i.title}</Link>
                  <span className="text-[13px] text-[#c7d5e0]">{PriceEngine.format(i.price)}</span>
                  <button type="button" onClick={() => cart.remove(i.id)} className="text-[11px] text-steam-link underline-offset-2 hover:underline">Remove</button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between bg-black/30 p-3 text-[15px] text-white">
              <span>Estimated total</span>
              <Price price={{ free: cart.total === 0, original: cart.total, final: cart.total, discount: 0 }} size="md" />
            </div>
            <div className="mt-3 flex justify-between">
              <button type="button" onClick={() => cart.clear()} className="btn-blue">Remove all items</button>
              <button type="button" className="btn-green" onClick={() => alert("Checkout is outside the scope of this demo.")}>Continue to payment</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}