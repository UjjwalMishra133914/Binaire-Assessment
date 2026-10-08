type Listener = (index: number) => void;


export class Carousel {
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  index = 0;

  constructor(public count: number, private intervalMs = 0) {}

  setCount(count: number) {
    this.count = Math.max(0, count);
    if (this.index >= this.count) this.go(0);
  }
  go(i: number) {
    if (!this.count) return;
    this.index = ((i % this.count) + this.count) % this.count;
    this.listeners.forEach((l) => l(this.index));
  }
  next = () => this.go(this.index + 1);
  prev = () => this.go(this.index - 1);

  pause = () => { this.paused = true; };
  resume = () => { this.paused = false; };
  start() {
    if (!this.intervalMs || this.timer) return;
    this.timer = setInterval(() => { if (!this.paused && !document.hidden) this.next(); }, this.intervalMs);
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }

  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
}
