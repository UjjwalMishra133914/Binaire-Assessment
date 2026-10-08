
export class Paginator {
  constructor(public page = 1, public totalPages = 1, private windowSize = 5) {}
  update(page: number, totalPages: number) { this.page = page; this.totalPages = Math.max(1, Math.min(totalPages, 500)); }
  get hasPrev() { return this.page > 1; }
  get hasNext() { return this.page < this.totalPages; }
  
  pages(): (number | "…")[] {
    const { page, totalPages: t, windowSize: w } = this;
    const start = Math.max(1, Math.min(page - Math.floor(w / 2), t - w + 1));
    const end = Math.min(t, start + w - 1);
    const out: (number | "…")[] = [];
    if (start > 1) { out.push(1); if (start > 2) out.push("…"); }
    for (let i = start; i <= end; i++) out.push(i);
    if (end < t) { if (end < t - 1) out.push("…"); out.push(t); }
    return out;
  }
}
