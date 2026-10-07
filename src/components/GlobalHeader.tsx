import { Link } from "./Link";
import { Logo } from "./Icons";
import { AuthService } from "../core/AuthService";
import { useLocation, useOnline, useUser } from "../core/hooks";

const MENU = [
  { label: "Store", to: "/" },
  { label: "Community", href: "#community" },
  { label: "About", href: "#about" },
  { label: "Support", href: "#support" },
];

/** Top black bar: logo, primary menu, account actions and the live connection indicator. */
export function GlobalHeader() {
  const user = useUser();
  const online = useOnline();
  const path = useLocation().split("?")[0];
  const onStore = !["/login", "/join"].includes(path);
  const item = "relative block px-[7px] pb-2 pt-[45px] font-motiva text-[14px] uppercase tracking-[.02em] text-[#dcdedf] transition-colors hover:text-white focus-visible:text-white active:text-steam-link";
  return (
    <header className="bg-steam-header">
      <a href="#main" className="sr-only z-[70] focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:rounded-sm focus:bg-steam-link focus:px-3 focus:py-2 focus:text-[#0e1c25]">Skip to main content</a>
      <div className="relative mx-auto flex h-[104px] max-w-[940px] items-start px-2 lg:px-0">
        <Link to="/" className="mr-10 mt-[30px] block text-[#c5c3c0] transition hover:text-white active:scale-[.98]" aria-label="Freznel store home">
          <Logo className="h-11 w-[176px]" />
        </Link>
        <nav aria-label="Global" className="hidden md:block">
          <ul className="flex">
            {MENU.map((m) => {
              const active = m.to === "/" && onStore;
              const cls = `${item} ${active ? "!text-steam-blue after:absolute after:inset-x-[7px] after:bottom-0 after:h-[3px] after:bg-steam-blue" : ""}`;
              return <li key={m.label}>{m.to ? <Link to={m.to} className={cls} aria-current={active ? "page" : undefined}>{m.label}</Link> : <a href={m.href} className={cls}>{m.label}</a>}</li>;
            })}
          </ul>
        </nav>
        <div className="ml-auto mt-1.5 flex items-center gap-2 text-[11px] text-[#b8b6b4]">
          <span role="status" aria-live="polite" className={`flex items-center gap-1.5 rounded-sm px-2 py-[3px] ${online ? "bg-[#5c7e10]/30 text-[#a4d007]" : "bg-[#c35c2c]/25 text-[#e97a4a]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-[#a4d007]" : "anim-pulse bg-[#e97a4a]"}`} />
            {online ? "Online" : "Offline"}
          </span>
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-[#dcdedf] sm:inline" title={user.email ?? ""}>{user.displayName || user.email}</span>
              <span aria-hidden>|</span>
              <button type="button" onClick={() => AuthService.get().signOut()} className="text-[#b8b6b4] transition hover:text-white active:text-steam-link">sign out</button>
            </>
          ) : (
            <>
              <Link to="/join" className="flex items-center gap-1 rounded-sm bg-[#5c7e10] px-2.5 py-[3px] text-white transition hover:bg-[#6b9312] active:translate-y-px">Join Freznel</Link>
              <Link to="/login" className="transition hover:text-white active:text-steam-link">login</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
