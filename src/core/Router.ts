type Listener = () => void;

/** Minimal History-API router (no external router lib). Keeps the hash free for :target. */
export class Router {
  private static instance: Router;
  private listeners = new Set<Listener>();
  static get(): Router { return (this.instance ??= new Router()); }
  private constructor() { window.addEventListener("popstate", () => this.emit()); }

  navigate(to: string, { replace = false } = {}) {
    if (to === location.pathname + location.search) return;
    history[replace ? "replaceState" : "pushState"]({}, "", to);
    window.scrollTo({ top: 0 });
    this.emit();
  }
  replace(to: string) { this.navigate(to, { replace: true }); }

  subscribe = (l: Listener) => { this.listeners.add(l); return () => { this.listeners.delete(l); }; };
  getSnapshot = () => location.pathname + location.search;
  private emit() { this.listeners.forEach((l) => l()); }
}
