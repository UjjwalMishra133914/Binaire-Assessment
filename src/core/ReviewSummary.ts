export type ReviewTone = "positive" | "mixed" | "negative" | "none";


export class ReviewSummary {
  constructor(readonly percent: number, readonly count: number) {}

  static of(m: { vote_average: number; vote_count: number }) {
    return new ReviewSummary(Math.round(m.vote_average * 10), m.vote_count);
  }

  get label(): string {
    const { percent: p, count: n } = this;
    if (n < 10) return "No user reviews";
    if (p >= 95 && n >= 500) return "Overwhelmingly Positive";
    if (p >= 80 && n >= 50) return "Very Positive";
    if (p >= 80) return "Positive";
    if (p >= 70) return "Mostly Positive";
    if (p >= 40) return "Mixed";
    if (p >= 20) return "Mostly Negative";
    if (n >= 500) return "Overwhelmingly Negative";
    return n >= 50 ? "Very Negative" : "Negative";
  }

  get tone(): ReviewTone {
    if (this.count < 10) return "none";
    return this.percent >= 70 ? "positive" : this.percent >= 40 ? "mixed" : "negative";
  }

  get tooltip() {
    return this.count < 10 ? "Not enough reviews yet" : `${this.percent}% of the ${this.count.toLocaleString("en-IN")} user reviews for this title are positive.`;
  }
}
