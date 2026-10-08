import type { MovieDetail } from "./TMDBService";

const MATURE = new Set(["R", "NC-17", "X", "18", "18+", "A", "R18", "R18+"]);


export class AgeGate {
  static readonly MIN_AGE = 18;
  static readonly MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  private static instance: AgeGate;
  static get(): AgeGate { return (this.instance ??= new AgeGate()); }
  private readonly key = "Steam:birthtime";

  
  static certification(m: MovieDetail): string {
    const results = m.release_dates?.results ?? [];
    const pick = (r?: (typeof results)[number]) => r?.release_dates.find((d) => d.certification)?.certification ?? "";
    return pick(results.find((r) => r.iso_3166_1 === "US")) || results.map((r) => pick(r)).find(Boolean) || "";
  }
  static isMature(m: MovieDetail) { return !!m.adult || MATURE.has(this.certification(m).toUpperCase()); }

  static ageOn(birth: Date, today = new Date()) {
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  get verified(): boolean {
    const t = Number(sessionStorage.getItem(this.key));
    return !!t && AgeGate.ageOn(new Date(t)) >= AgeGate.MIN_AGE;
  }

  
  submit(day: number, monthIndex: number, year: number): boolean {
    const birth = new Date(year, monthIndex, day);
    sessionStorage.setItem(this.key, String(birth.getTime()));
    return AgeGate.ageOn(birth) >= AgeGate.MIN_AGE;
  }
}
