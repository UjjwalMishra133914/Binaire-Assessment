import type { ReactNode } from "react";
import { Link } from "./Link";
import { Logo } from "./Icons";

const lnk = "text-[14px] text-[#8f98a0] transition hover:text-white focus-visible:text-white active:text-steam-link";
const social = "flex h-8 w-8 items-center justify-center text-[#8f98a0] transition hover:text-white focus-visible:text-white active:scale-95";

function Col({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id ?? title}-h`} className="p-1">
      <h2 id={`${id ?? title}-h`} className="section-title mb-3 !text-[13px]">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </section>
  );
}

/** Store footer. Its columns double as `:target` destinations for the global menu. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 bg-[#171d25] pb-14 pt-10 text-[12px] text-[#8f98a0]">
      <div className="mx-auto flex max-w-[940px] flex-wrap justify-between gap-10 px-2 lg:px-0">
        <div className="w-[300px] max-w-full">
          <Logo className="h-8 w-32 text-[#c6d4df]" />
          <p className="mt-5 leading-[18px]">
            © {year} Steam Store. All rights reserved. Movie data and images are provided by TMDB; this product uses the TMDB API but is not endorsed or certified by TMDB.
            Prices are illustrative and shown in INR. All trademarks are property of their respective owners.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className={social}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" /><path d="M10 9l5 3-5 3z" fill="#171d25" /></svg>
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className={social}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><text x="12" y="18" textAnchor="middle" fontSize="17" fontWeight="700" fill="#171d25">f</text></svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className={social}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className="grid min-w-[300px] flex-1 grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4 lg:max-w-[560px]">
          <Col id="about" title="Steam">
            <li><a href="#about" className={lnk}>About Steam</a></li>
            <li><Link to="/search?filter=topsellers" className={lnk}>Top Sellers</Link></li>
            <li><Link to="/explore/new" className={lnk}>New Releases</Link></li>
            <li><Link to="/search?filter=specials" className={lnk}>Special Offers</Link></li>
          </Col>
          <Col id="community" title="Community">
            <li><Link to="/search?filter=toprated" className={lnk}>Most loved by players</Link></li>
            <li><Link to="/explore/new" className={lnk}>What's new this month</Link></li>
            <li><Link to="/join" className={lnk}>Create a free account</Link></li>
          </Col>
          <Col id="support" title="Support">
            <li><a href="#main" className={lnk}>Skip to content</a></li>
            <li><Link to="/login" className={lnk}>Sign in help</Link></li>
            <li><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className={lnk}>Data source: TMDB ↗</a></li>
          </Col>
          <Col title="More">
            <li><a href="#cart" className={lnk}>Your cart</a></li>
            <li><Link to="/search?filter=wishlist" className={lnk}>Your wishlist</Link></li>
            <li><Link to="/search" className={lnk}>Advanced search</Link></li>
          </Col>
        </nav>
      </div>
    </footer>
  );
}