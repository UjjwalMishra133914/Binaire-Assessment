import { useEffect, useRef, useState } from "react";
import { useOnline } from "../core/hooks";


export function StatusBanner() {
  const online = useOnline();
  const [flash, setFlash] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!online) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 3500);
    return () => clearTimeout(t);
  }, [online]);
  if (online && !flash) return null;
  return (
    <div role="alert" className={`anim-banner sticky top-0 z-[60] flex items-center justify-center gap-2 px-3 py-2 text-center text-[13px] text-white shadow-[0_2px_6px_rgba(0,0,0,.5)] ${online ? "bg-[linear-gradient(90deg,#5c7e10,#4c6b22)]" : "bg-[linear-gradient(90deg,#a34c25,#7a3a1c)]"}`}>
      <span className={`h-2 w-2 rounded-full bg-white ${online ? "" : "anim-pulse"}`} aria-hidden />
      {online ? "You're back online — the store is refreshing with the latest data." : "You're offline. Showing saved store pages; sign-in and new searches need a connection."}
    </div>
  );
}
