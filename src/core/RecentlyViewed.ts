export interface Viewed { id: number; title: string }

/** The last few store pages the visitor opened, newest first. */
export class RecentlyViewed {
  private static readonly KEY = "freznel:recent";
  private static readonly MAX = 5;

  static list(): Viewed[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? "[]") as Viewed[]; } catch { return []; }
  }
  static push(v: Viewed) {
    const next = [v, ...this.list().filter((x) => x.id !== v.id)].slice(0, this.MAX);
    try { localStorage.setItem(this.KEY, JSON.stringify(next)); } catch { /* quota */ }
  }
}
