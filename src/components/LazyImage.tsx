import { useEffect, useRef, useState } from "react";
import { sharedLazyLoader } from "../core/LazyLoader";

/** Image that only requests its source once it nears the viewport, then fades in. */
export function LazyImage({ src, alt, className = "", imgClassName = "" }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loaded" | "error">("idle");
  useEffect(() => {
    const el = ref.current; if (!el) return;
    setState("idle"); setUrl("");
    if (!src) { setState("error"); return; }
    sharedLazyLoader.observe(el, () => setUrl(src));
    return () => sharedLazyLoader.unobserve(el);
  }, [src]);
  return (
    <div ref={ref} className={`relative overflow-hidden ${state === "loaded" ? "bg-black" : "skeleton"} ${className}`}>
      {url && state !== "error" && (
        <img src={url} alt={alt} decoding="async" onLoad={() => setState("loaded")} onError={() => setState("error")}
          className={`h-full w-full object-cover transition-opacity duration-500 ${state === "loaded" ? "opacity-100" : "opacity-0"} ${imgClassName}`} />
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0e1c25] p-2 text-center font-motiva text-[11px] uppercase tracking-wider text-steam-dim" aria-hidden={!alt}>{alt || "No image"}</div>
      )}
    </div>
  );
}
