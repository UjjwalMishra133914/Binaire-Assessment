export interface Price { free: boolean; original: number; final: number; discount: number }


export class PriceEngine {
  private static readonly TIERS = [199, 299, 349, 499, 649, 799, 999, 1299, 1599, 1999, 2499, 2999, 3499, 3999, 4999];
  private static readonly CUTS = [10, 15, 20, 25, 33, 40, 50, 60, 66, 70, 75, 80, 90];
  private static readonly fmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  private static hash(n: number, salt: number) {
    let h = Math.imul(n ^ salt, 2654435761) >>> 0;
    h ^= h >>> 15;
    return Math.imul(h, 2246822519) >>> 0;
  }

  static of(m: { id: number }): Price {
    if (this.hash(m.id, 7) % 19 === 0) return { free: true, original: 0, final: 0, discount: 0 };
    const original = this.TIERS[this.hash(m.id, 1) % this.TIERS.length];
    const discount = this.hash(m.id, 3) % 5 < 2 ? this.CUTS[this.hash(m.id, 5) % this.CUTS.length] : 0;
    return { free: false, original, final: Math.round(original * (1 - discount / 100)), discount };
  }

  static format(amount: number) { return amount === 0 ? "Free" : `₹${this.fmt.format(amount)}`; }
}
