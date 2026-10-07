import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({ width: 16, height: 16, "aria-hidden": true, focusable: false, ...p });

export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 23 36" {...base(p)}><path d="M20 3 5 18l15 15" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 23 36" {...base(p)}><path d="m3 3 15 15L3 33" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
);
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...base(p)}><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" /><path d="m15 15 6 6" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" /></svg>
);
export const CaretDown = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 10 6" {...base({ width: 9, height: 6, ...p })}><path d="M0 0h10L5 6z" fill="currentColor" /></svg>
);
export const WindowsIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" {...base({ width: 13, height: 13, ...p })}><path d="M0 2.3 6.5 1.4v6.2H0zM7.3 1.3 16 0v7.6H7.3zM0 8.4h6.5v6.2L0 13.7zM7.3 8.4H16V16l-8.7-1.2z" fill="currentColor" /></svg>
);
export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...base(p)}><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
);

/** Steam wordmark, drawn in the store header's style. */
export const Logo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 150 44" className={className} role="img" aria-label="Steam">
    <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="22" cy="22" r="13" fill="currentColor" />
    <circle cx="22" cy="22" r="5" fill="#171a21" />
    <text x="50" y="31" fill="currentColor" fontFamily="'Motiva Sans','Nunito Sans',Arial,sans-serif" fontWeight="700" fontSize="25" letterSpacing="1.5">STEAM</text>
  </svg>
);