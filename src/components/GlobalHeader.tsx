import { Link } from "./Link";
import { Logo } from "./Icons";
import { AuthService } from "../core/AuthService";
import { useLocation, useUser } from "../core/hooks";

const MENU = [
  { label: "Store", to: "/" },
  { label: "Community", href: "#community" },
  { label: "About", href: "#about" },
  { label: "Support", href: "#support" },
];

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="8" r="4.5" fill="currentColor" />
    <path d="M3.5 21c0-4.7 3.8-7.5 8.5-7.5s8.5 2.8 8.5 7.5z" fill="currentColor" />
  </svg>
);

/** Top black bar: logo, primary menu and the login / account action. */
export function GlobalHeader() {
  const user = useUser();
  const path = useLocation().split("?")[0];
  const onStore = !["/login", "/join"].includes(path);
  const item = "relative block px-[7px] pb-2 pt-[45px] font-motiva text-[14px] uppercase tracking-[.02em] text-[#dcdedf] transition-colors hover:text-white focus-visible:text-white active:text-steam-link";
  const name = user ? user.displayName || user.email || "Account" : "";
  return (
    <header className="bg-steam-header">
      <a href="#main" className="sr-only z-[70] focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:rounded-sm focus:bg-steam-link focus:px-3 focus:py-2 focus:text-[#0e1c25]">Skip to main content</a>
      <div className="relative mx-auto flex h-[104px] max-w-[940px] items-start px-2 lg:px-0">
        <Link to="/" className="mr-10 mt-[30px] block text-[#c5c3c0] transition hover:text-white active:scale-[.98]" aria-label="Steam store home">
          <Logo className="h-11 w-[150px]" />
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
        <div className="ml-auto mt-[34px] flex items-center gap-3">
          {user ? (
            <>
              <span className="flex items-center gap-2" title={user.email ?? ""}>
                <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a9fff] font-motiva text-[14px] font-bold uppercase text-white">
                  {name.charAt(0)}
                </span>
                <span className="hidden max-w-[140px] truncate text-[14px] text-[#dcdedf] sm:inline">{name}</span>
              </span>
              <button type="button" onClick={() => AuthService.get().signOut()} className="btn-blue btn-sm !leading-[28px]">Sign out</button>
            </>
          ) : (
            <Link to="/login" className="btn-steamui gap-2 !px-5 !py-[7px] !text-[14px]">
              <UserIcon />Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}