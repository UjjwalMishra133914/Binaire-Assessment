import { useEffect, useState } from "react";
import { TMDBService, type MovieDetail } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { ReviewSummary } from "../core/ReviewSummary";
import { AgeGate } from "../core/AgeGate";
import { Router } from "../core/Router";
import { RecentlyViewed } from "../core/RecentlyViewed";
import { useAsync, useCart, useOnline } from "../core/hooks";
import { Link } from "../components/Link";
import { LazyImage } from "../components/LazyImage";
import { Price } from "../components/Price";
import { Carousel } from "../components/Carousel";
import { PlayIcon, WindowsIcon } from "../components/Icons";
import { REVIEW_TONE } from "../components/TabbedList";

type Media = { kind: "video"; key: string; name: string } | { kind: "image"; path: string };

const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "To be announced");

/** Store page for one title (Steam's app page layout). Mature titles route through the age gate first. */
export default function AppPage({ id }: { id: string }) {
  const api = TMDBService.get();
  const { data: m, error, loading } = useAsync(() => api.detail(id), [id]);
  const gated = !!m && AgeGate.isMature(m) && !AgeGate.get().verified;

  useEffect(() => {
    if (!m) return;
    if (gated) { Router.get().replace(`/agecheck/app/${id}`); return; }
    document.title = `${m.title} on Steam`;
    RecentlyViewed.push({ id: m.id, title: m.title });
  }, [m, gated, id]);

  if (error) return <div className="mx-auto max-w-[940px] px-2 py-10"><p role="alert" className="bg-black/30 p-6 text-[14px] text-[#e97a4a]">{error}</p></div>;
  if (loading || !m || gated) return <Skeleton />;
  return <Store m={m} />;
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-[940px] px-2 lg:px-0" aria-busy="true">
      <div className="skeleton mb-2 h-4 w-60" /><div className="skeleton mb-4 h-8 w-96" />
      <div className="flex gap-4"><div className="skeleton h-[420px] flex-1" /><div className="skeleton hidden h-[420px] w-[324px] md:block" /></div>
    </div>
  );
}

function Store({ m }: { m: MovieDetail }) {
  const api = TMDBService.get();
  const cart = useCart();
  const online = useOnline();
  const price = PriceEngine.of(m);
  const review = ReviewSummary.of(m);
  const cert = AgeGate.certification(m);
  const trailer = m.videos?.results.find((v) => v.site === "YouTube" && v.type === "Trailer") ?? m.videos?.results.find((v) => v.site === "YouTube");
  const media: Media[] = [
    ...(trailer ? [{ kind: "video" as const, key: trailer.key, name: trailer.name }] : []),
    ...(m.images?.backdrops.length ? m.images.backdrops.slice(0, 12).map((b) => ({ kind: "image" as const, path: b.file_path })) : m.backdrop_path ? [{ kind: "image" as const, path: m.backdrop_path }] : []),
  ];
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cur = media[sel];
  const dev = m.production_companies[0]?.name ?? "Unknown";
  const pub = m.production_companies[1]?.name ?? dev;
  const tags = [...m.genres.map((g) => g.name), ...(m.keywords?.keywords ?? []).slice(0, 8).map((k) => k.name)].slice(0, 12);
  const similar = m.similar?.results.filter((s) => s.backdrop_path).slice(0, 12) ?? [];
  const inCart = cart.inCart(m.id);

  return (
    <div className="relative isolate">
      {m.backdrop_path && <div className="absolute inset-x-0 -top-3 -z-10 h-[900px] bg-cover bg-top opacity-25 [mask-image:linear-gradient(to_bottom,#000_30%,transparent)]" style={{ backgroundImage: `url(${api.img(m.backdrop_path, "w1280")})` }} aria-hidden />}
      <div className="mx-auto max-w-[940px] px-2 lg:px-0">
        <nav aria-label="Breadcrumb" className="text-[12px] text-[#8f98a0]">
          <Link to="/search" className="hover:text-white">All Movies</Link>
          {m.genres[0] && <> &gt; <Link to={`/search?genre=${m.genres[0].id}`} className="hover:text-white">{m.genres[0].name} Movies</Link></>}
          {" "}&gt; <span aria-current="page" className="text-[#8f98a0]">{m.title}</span>
        </nav>
        <div className="mb-3 mt-1 flex items-center justify-between gap-3">
          <h1 className="font-motiva text-[26px] leading-[32px] text-white">{m.title}</h1>
          <a href="#about-this" className="btn-blue btn-sm shrink-0">Community Hub</a>
        </div>

        <div className="flex gap-4 bg-black/20 max-md:flex-col">
          <div className="w-[600px] min-w-0 max-md:w-full">
            <div className="relative aspect-video w-full bg-black">
              {cur?.kind === "video" ? (
                playing && online ? (
                  <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${cur.key}?autoplay=1&rel=0`} title={cur.name} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                ) : (
                  <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play trailer: ${cur.name}`} disabled={!online}>
                    <img src={`https://i.ytimg.com/vi/${cur.key}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/10">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:scale-110 group-hover:bg-steam-link group-active:scale-95"><PlayIcon width={34} height={34} /></span>
                    </span>
                    {!online && <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-[12px] text-white">Trailers need a connection</span>}
                  </button>
                )
              ) : cur ? (
                <img key={cur.path} src={api.img(cur.path, "w1280")} alt={`${m.title} screenshot ${sel + 1}`} className="anim-fade-in absolute inset-0 h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="no-scrollbar mt-1 flex gap-1 overflow-x-auto pb-1" role="listbox" aria-label="Media">
              {media.map((x, i) => (
                <button key={i} type="button" role="option" aria-selected={i === sel} onClick={() => { setSel(i); setPlaying(x.kind === "video"); }}
                  className={`relative h-[65px] w-[116px] shrink-0 border-2 transition ${i === sel ? "border-white" : "border-transparent opacity-80 hover:opacity-100"} active:scale-95`}
                  aria-label={x.kind === "video" ? `Trailer: ${x.name}` : `Screenshot ${i + 1}`}>
                  {x.kind === "video" ? (
                    <><img src={`https://i.ytimg.com/vi/${x.key}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 flex items-center justify-center text-white"><PlayIcon width={22} height={22} /></span></>
                  ) : <LazyImage src={api.img(x.path, "w300")} alt="" className="h-full w-full" />}
                </button>
              ))}
            </div>
          </div>

          <div className="w-[324px] shrink-0 pb-3 pr-2 max-md:w-full max-md:px-3">
            <LazyImage src={api.img(m.backdrop_path ?? m.poster_path, "w500")} alt={`${m.title} header`} className="aspect-[324/151] w-full" />
            <p className="mt-2.5 line-clamp-5 text-[13px] leading-[18px] text-[#c6d4df]">{m.overview || "No description available."}</p>
            <dl className="mt-3 grid grid-cols-[96px_1fr] gap-y-1.5 text-[11px] uppercase text-[#556772]">
              <dt>All reviews:</dt>
              <dd className="normal-case"><span className={`text-[12px] ${REVIEW_TONE[review.tone]}`} title={review.tooltip}>{review.label}</span> <span className="text-[#556772]">({review.count.toLocaleString("en-IN")})</span></dd>
              <dt>Release date:</dt><dd className="text-[12px] normal-case text-[#8f98a0]">{fmtDate(m.release_date)}</dd>
              <dt>Developer:</dt><dd className="truncate text-[12px] normal-case"><Link to={`/search?term=${encodeURIComponent(dev)}`} className="text-steam-link hover:text-white">{dev}</Link></dd>
              <dt>Publisher:</dt><dd className="truncate text-[12px] normal-case"><Link to={`/search?term=${encodeURIComponent(pub)}`} className="text-steam-link hover:text-white">{pub}</Link></dd>
            </dl>
            <p className="mt-3 text-[12px] text-[#556772]">Popular user-defined tags for this product:</p>
            <div className="mt-1 flex flex-wrap gap-0.5">
              {tags.map((t) => <span key={t} className="rounded-sm bg-[rgba(103,193,245,.2)] px-[7px] text-[11px] leading-[19px] text-steam-link transition hover:bg-steam-link hover:text-white">{t}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1 bg-[linear-gradient(90deg,rgba(103,193,245,.18),rgba(103,193,245,.05))] p-4">
          <button type="button" className="btn-blue" aria-pressed={cart.wished(m.id)} onClick={() => cart.toggleWish(m.id)}>
            {cart.wished(m.id) ? "✔ On Wishlist" : "Add to your wishlist"}
          </button>
          <a href="#about-this" className="btn-blue">Read about it</a>
          <span className="ml-auto text-[12px] text-[#8f98a0]">{cert ? `Rated ${cert}` : "Not rated"}{m.runtime ? ` · ${m.runtime} min` : ""}</span>
        </div>

        <div className="mt-4 flex gap-4 max-md:flex-col">
          <div className="min-w-0 flex-1">
            <div className="relative mb-7 mt-2 rounded-[4px] bg-[linear-gradient(-60deg,rgba(226,244,255,.3)_5%,rgba(84,107,115,.3)_95%)] px-4 pb-8 pt-4">
              <h2 className="font-motiva text-[21px] text-white">Buy {m.title}</h2>
              <p className="mt-1 text-[12px] text-[#c6d4df]">{price.discount ? `SPECIAL PROMOTION! Offer ends ${new Date(Date.now() + 5 * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` : "Stream in 4K HDR on all your devices."}</p>
              <div className="absolute -bottom-4 right-4 flex items-stretch rounded-sm bg-black p-0.5">
                <Price price={price} size="lg" solid />
                {inCart
                  ? <a href="#cart" className="btn-green ml-0.5">In Cart</a>
                  : <button type="button" className="btn-green ml-0.5" onClick={() => cart.add({ id: m.id, title: m.title, price: price.final, image: m.backdrop_path })}>{price.free ? "Play Now" : "Add to Cart"}</button>}
              </div>
            </div>

            <section id="about-this" aria-labelledby="about-this-h" className="mb-8 p-1">
              <h2 id="about-this-h" className="section-title border-b border-transparent pb-1 [border-image:linear-gradient(to_right,#3b6e8c_0%,#000_100%)_1]">About this movie</h2>
              {m.tagline && <p className="mt-3 font-motiva text-[15px] italic text-white">{m.tagline}</p>}
              <p className="mt-3 text-[14px] leading-[1.6] text-[#acb2b8]">{m.overview || "No description available."}</p>
            </section>

            {similar.length > 0 && (
              <section aria-labelledby="similar-h" className="mb-8">
                <h2 id="similar-h" className="section-title mb-2 border-b border-transparent pb-1 [border-image:linear-gradient(to_right,#3b6e8c_0%,#000_100%)_1]">More like this</h2>
                <Carousel label="More like this" pages={Math.ceil(similar.length / 3)} className="mx-0 lg:mx-12" render={(p) => (
                  <div className="grid grid-cols-3 gap-2">
                    {similar.slice(p * 3, p * 3 + 3).map((s) => (
                      <Link key={s.id} to={`/app/${s.id}`} className="group block bg-black/20 transition hover:bg-black/40 active:scale-[.98]">
                        <LazyImage src={api.img(s.backdrop_path, "w300")} alt="" className="aspect-[184/69] w-full" imgClassName="transition group-hover:brightness-110" />
                        <div className="flex items-center justify-between gap-1 p-1.5">
                          <span className="truncate text-[12px] text-[#c7d5e0] group-hover:text-white">{s.title}</span>
                          <span className="shrink-0 text-[11px] text-[#c7d5e0]">{PriceEngine.format(PriceEngine.of(s).final)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )} />
              </section>
            )}
          </div>

          <aside className="w-[308px] shrink-0 max-md:w-full" aria-label="Details">
            <div className="mb-3 bg-black/20 p-4 text-[12px] leading-[20px] text-[#8f98a0]">
              <p><b className="font-normal text-[#556772]">Title:</b> <span className="text-[#c6d4df]">{m.title}</span></p>
              <p><b className="font-normal text-[#556772]">Genre:</b> {m.genres.map((g, i) => <span key={g.id}>{i > 0 && ", "}<Link to={`/search?genre=${g.id}`} className="text-steam-link hover:text-white">{g.name}</Link></span>)}</p>
              <p><b className="font-normal text-[#556772]">Developer:</b> <span className="text-steam-link">{dev}</span></p>
              <p><b className="font-normal text-[#556772]">Publisher:</b> <span className="text-steam-link">{pub}</span></p>
              <p><b className="font-normal text-[#556772]">Release Date:</b> {fmtDate(m.release_date)}</p>
              {m.runtime ? <p><b className="font-normal text-[#556772]">Runtime:</b> {m.runtime} minutes</p> : null}
              <p><b className="font-normal text-[#556772]">Languages:</b> {m.spoken_languages.map((l) => l.english_name).join(", ") || "English"}</p>
            </div>
            <div className="flex items-center gap-3 bg-black/20 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-white/70 font-motiva text-[15px] font-bold text-white">{cert || "NR"}</span>
              <p className="text-[12px] text-[#8f98a0]">{AgeGate.isMature(m) ? "Mature content. Viewer discretion is advised." : "Suitable for general audiences."}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 bg-black/20 p-4 text-[12px] text-[#8f98a0]"><WindowsIcon /> Available on desktop, mobile and TV</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
