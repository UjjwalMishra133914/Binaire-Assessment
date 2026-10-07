type Listener = (online: boolean) => void;

/** Tracks connectivity (browser events) and notifies subscribers. */
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners = new Set<Listener>();
  private _online = navigator.onLine;

  static get(): NetworkMonitor { return (this.instance ??= new NetworkMonitor()); }

  private constructor() {
    window.addEventListener("online", () => this.set(true));
    window.addEventListener("offline", () => this.set(false));
  }
  get online() { return this._online; }
  private set(v: boolean) { if (v !== this._online) { this._online = v; this.listeners.forEach((l) => l(v)); } }
  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
}
