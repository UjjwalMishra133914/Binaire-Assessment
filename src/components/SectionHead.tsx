import type { ReactNode } from "react";
import { Link } from "./Link";

/** Uppercase home-section title with an optional "Browse more" button on the right. */
export function SectionHead({ id, title, more, moreLabel = "Browse more", children }: { id?: string; title: string; more?: string; moreLabel?: string; children?: ReactNode }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2">
      <h2 id={id} className="section-title pt-0.5">{title}</h2>
      <div className="flex items-center gap-2">
        {children}
        {more && <Link to={more} className="btn-blue btn-sm">{moreLabel}</Link>}
      </div>
    </div>
  );
}
