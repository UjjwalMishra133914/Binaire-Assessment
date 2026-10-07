import type { ReactNode } from "react";
import { Link } from "./Link";
import { LazyImage } from "./LazyImage";
import { Price } from "./Price";
import { TMDBService, type Movie } from "../core/TMDBService";
import { PriceEngine } from "../core/PriceEngine";
import { ReviewSummary } from "../core/ReviewSummary";

/** Hover popup (title, date, description, reviews, tags). `side` = kis taraf khule. */
export function HoverCard({ movie: m, side = "right", children }: { movie: Movie; side?: "right" | "left"; children: ReactNode }) {
  const api = TMDBService.get();
  const review = ReviewSummary.of(m);
  const tags = api.tagsFor(m, 3);
  const tone =
    review.tone === "positive" ? "text-[#66c0f4]"
    : review.tone === "mixed" ? "text-[#b9a074]"
    : review.tone === "negative" ? "text-[#a34c25]" : "text-[#8f98a0]";
  const released = m.release_date
    ? new Date(m.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
  return (
    <div className="group/hc relative">
      {children}
      <div role="tooltip"
        className={`pointer-events-none invisible absolute top-0 z-30 w-[260px] bg-[#344254] p-3 text-left opacity-0 shadow-[0_0_12px_rgba(0,0,0,.6)] transition duration-200 group-hover/hc:visible group-hover/hc:opacity-100 group-hover/hc:delay-150 max-lg:hidden ${side === "right" ? "left-full ml-2" : "right-full mr-2"}`}>
        <p className="font-motiva text-[17px] leading-5 text-white">{m.title}</p>
        {released && <p className="mt-0.5 text-[11px] text-[#8f98a0]">Released: {released}</p>}
        <p className="mt-2 line-clamp-6 text-[12px] leading-4 text-[#c6d4df]">{m.overview || "No description available."}</p>
        <div className="mt-2 bg-black/25 p-2 text-[11px] text-[#8f98a0]">
          User reviews: <span className={tone}>{review.label}</span>{" "}
          <span>({review.count.toLocaleString("en-IN")} reviews)</span>
        </div>
        {tags.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] text-[#8f98a0]">User tags:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.map((t) => <span key={t} className="rounded-sm bg-[rgba(103,193,245,.2)] px-1.5 text-[11px] leading-[18px] text-[#67c1f5]">{t}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Image + discount/price strip. `live` sirf demo badge hai. */
export function Capsule({ movie: m, live = false }: { movie: Movie; live?: boolean }) {
  const api = TMDBService.get();
  return (
    <Link to={`/app/${m.id}`} aria-label={m.title}
      className="group block bg-black/30 shadow-[0_0_6px_rgba(0,0,0,.5)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,.6)] active:translate-y-0">
      <div className="relative">
        <LazyImage src={api.img(m.backdrop_path, "w780")} alt={m.title} className="aspect-[16/9] w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-105" />
        {live && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-sm bg-black/70 px-1.5 text-[11px] font-bold leading-[18px] text-white">
            <span className="anim-pulse h-1.5 w-1.5 rounded-full bg-[#e0373b]" />LIVE
          </span>
        )}
      </div>
      <div className="flex justify-end bg-[#0f1922]/80"><Price price={PriceEngine.of(m)} /></div>
    </Link>
  );
}