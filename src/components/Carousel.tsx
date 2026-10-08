import { useEffect, useRef, useState, type ReactNode } from "react";
import { Carousel as CarouselModel } from "../core/Carousel";
import { ChevronLeft, ChevronRight } from "./Icons";

export function Carousel({ pages, render, label, autoplay = 0, className = "" }: {
  pages: number; render: (page: number) => ReactNode; label: string; autoplay?: number; className?: string;
}) {
  const model = useRef(new CarouselModel(pages, autoplay)).current;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");

  useEffect(() => { model.setCount(pages); }, [model, pages]);
  useEffect(() => {
    const off = model.subscribe(setIndex);
    model.start();
    return () => { off(); model.stop(); };
  }, [model]);

  const go = (d: "next" | "prev") => { setDir(d); model[d](); };
  const arrow = "absolute top-0 z-10 flex h-full w-[46px] items-center justify-center text-white/80 transition hover:text-white focus-visible:text-white active:scale-95 disabled:hidden";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={`relative ${className}`}
      onMouseEnter={model.pause} onMouseLeave={model.resume} onFocus={model.pause} onBlur={model.resume}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go("next"); if (e.key === "ArrowLeft") go("prev"); }}>
      <div className="relative">
        <button type="button" onClick={() => go("prev")} disabled={pages < 2} aria-label="Previous"
          className={`${arrow} -left-[46px] bg-[linear-gradient(to_right,rgba(0,0,0,.3)_5%,rgba(0,0,0,0)_95%)] hover:bg-[linear-gradient(to_right,rgba(171,218,244,.3)_5%,rgba(171,218,244,0)_95%)] max-lg:left-0`}>
          <ChevronLeft width={23} height={36} />
        </button>
        <div key={index} className={dir === "next" ? "anim-next" : "anim-prev"} aria-live={autoplay ? "off" : "polite"}>
          {render(index)}
        </div>
        <button type="button" onClick={() => go("next")} disabled={pages < 2} aria-label="Next"
          className={`${arrow} -right-[46px] bg-[linear-gradient(to_left,rgba(0,0,0,.3)_5%,rgba(0,0,0,0)_95%)] hover:bg-[linear-gradient(to_left,rgba(171,218,244,.3)_5%,rgba(171,218,244,0)_95%)] max-lg:right-0`}>
          <ChevronRight width={23} height={36} />
        </button>
      </div>
      {
      pages > 1 && (
        <div className="mt-2.5 flex justify-center gap-[3px]" role="tablist" aria-label={`${label} pages`}>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={`Page ${i + 1}`}
              onClick={() => { setDir(i > index ? "next" : "prev"); model.go(i); }}
              className={`h-[9px] w-[15px] rounded-sm transition-colors duration-300 ${i === index ? "bg-[hsla(202,60%,100%,.4)]" : "bg-[hsla(202,60%,100%,.2)] hover:bg-[hsla(202,60%,100%,.3)]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
