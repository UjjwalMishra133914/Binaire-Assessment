import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { Router } from "../core/Router";

export function Link({ to, onClick, ...p }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
    e.preventDefault();
    Router.get().navigate(to);
  };
  return <a href={to} onClick={go} {...p} />;
}
