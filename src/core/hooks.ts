import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { User } from "firebase/auth";
import { NetworkMonitor } from "./NetworkMonitor";
import { Router } from "./Router";
import { AuthService } from "./AuthService";
import { TMDBService } from "./TMDBService";
import { sharedLazyLoader } from "./LazyLoader";
import { CartService } from "./CartService";

export const useOnline = () => {
  const [on, setOn] = useState(NetworkMonitor.get().online);
  useEffect(() => NetworkMonitor.get().subscribe(setOn), []);
  return on;
};

export const useLocation = () => { const r = Router.get(); return useSyncExternalStore(r.subscribe, r.getSnapshot); };

export const useUser = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => { try { return AuthService.get().onChange(setUser); } catch { setUser(null); } }, []);
  return user;
};

/** Runs `fn` whenever `deps` change; stale results from a superseded run are dropped. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const online = useOnline();
  useEffect(() => {
    let alive = true; setLoading(true); setError("");
    fn().then((d) => alive && setData(d)).catch((e: Error) => alive && setError(e.message)).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [...deps, online]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error, loading };
}

/** True once the element has scrolled near the viewport (from-scratch lazy loading). */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || seen) return;
    sharedLazyLoader.observe(el, () => setSeen(true));
    return () => sharedLazyLoader.unobserve(el);
  }, [seen]);
  return [ref, seen] as const;
}

export const useCart = () => {
  const c = CartService.get();
  useSyncExternalStore(c.subscribe, c.getSnapshot);
  return c;
};

/** Re-renders once TMDB genre names are loaded, so list rows can show tags. */
export function useGenres() {
  const [, bump] = useState(0);
  useEffect(() => { TMDBService.get().genres().then(() => bump(1)).catch(() => {}); }, []);
}
