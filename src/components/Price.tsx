import { PriceEngine, type Price as P } from "../core/PriceEngine";

/** Steam discount block: green percentage tile + struck-through original + final price. */
export function Price({ price, size = "sm", className = "", solid = false, onLight = false }: { price: P; size?: "sm" | "md" | "lg"; className?: string; solid?: boolean; onLight?: boolean }) {
  const pct = { sm: "text-[15px] leading-[34px] px-1", md: "text-[17px] leading-[38px] px-1.5", lg: "text-[25px] leading-[34px] px-1.5" }[size];
  const fin = { sm: "text-[13px]", md: "text-[15px]", lg: "text-[15px]" }[size];
  const label = price.free ? "Free"
    : price.discount ? `${price.discount}% off. ${PriceEngine.format(price.original)} normally, discounted to ${PriceEngine.format(price.final)}`
    : PriceEngine.format(price.final);
  return (
    <div className={`flex shrink-0 items-stretch ${className}`} aria-label={label} role="text">
      {price.discount > 0 && <div aria-hidden className={`bg-steam-greenbg font-motiva font-medium text-steam-green ${pct}`}>-{price.discount}%</div>}
      <div aria-hidden className={`flex flex-col items-end justify-center px-1.5 ${price.discount ? "bg-steam-price" : solid ? "bg-black/60" : ""}`}>
        {price.discount > 0 && <span className="text-[11px] leading-3 text-[#738895] line-through decoration-[#738895]">{PriceEngine.format(price.original)}</span>}
        <span className={`${fin} leading-4 ${price.discount ? "text-steam-green" : onLight ? "text-[#10161b]" : "text-[#c7d5e0]"}`}>{PriceEngine.format(price.final)}</span>
      </div>
    </div>
  );
}
