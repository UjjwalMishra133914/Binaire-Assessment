import { Link } from "./Link";

export function SaleHero() {
  return (
    <section aria-label="Steam Autumn Sale"
      className="relative mb-8 flex h-[260px] flex-col items-center justify-center overflow-hidden rounded-sm bg-[radial-gradient(circle_at_30%_30%,#7a2433_0%,#3a1118_70%)] text-center shadow-[0_0_12px_rgba(0,0,0,.5)] max-md:h-[200px]">
      <h1 className="font-motiva text-[64px] font-black uppercase leading-none tracking-wide text-[#e0476b] [text-shadow:0_4px_0_#7a1030] max-md:text-[40px]">
        Autumn Sale
      </h1>
      <p className="mt-3 font-motiva text-[20px] font-bold uppercase text-[#f3b6c4] max-md:text-[14px]">
        On now · deals up to 90% off
      </p>
      <Link to="/search?filter=specials" className="btn-green mt-5">Browse deals</Link>
    </section>
  );
}