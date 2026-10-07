import { Paginator } from "../core/Paginator";

/** Steam search-results pager: "< 1 2 3 … 40 >". */
export function Pagination({ paginator, onChange }: { paginator: Paginator; onChange: (p: number) => void }) {
  const cell = "min-w-[26px] rounded-sm px-1.5 py-0.5 text-center text-[13px] transition";
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-end gap-1">
      <span className="mr-2 text-[12px] text-steam-muted">Page {paginator.page} of {paginator.totalPages}</span>
      <button type="button" disabled={!paginator.hasPrev} onClick={() => onChange(paginator.page - 1)} aria-label="Previous page"
        className={`${cell} text-steam-link hover:bg-steam-link hover:text-white active:bg-[#417a9b] disabled:pointer-events-none disabled:opacity-30`}>&lt;</button>
      {paginator.pages().map((p, i) => p === "…"
        ? <span key={`e${i}`} className="px-1 text-steam-muted" aria-hidden>…</span>
        : <button type="button" key={p} onClick={() => onChange(p)} aria-label={`Page ${p}`} aria-current={p === paginator.page ? "page" : undefined}
            className={`${cell} ${p === paginator.page ? "bg-[rgba(103,193,245,.2)] text-white" : "text-steam-link hover:bg-steam-link hover:text-white active:bg-[#417a9b]"}`}>{p}</button>)}
      <button type="button" disabled={!paginator.hasNext} onClick={() => onChange(paginator.page + 1)} aria-label="Next page"
        className={`${cell} text-steam-link hover:bg-steam-link hover:text-white active:bg-[#417a9b] disabled:pointer-events-none disabled:opacity-30`}>&gt;</button>
    </nav>
  );
}
