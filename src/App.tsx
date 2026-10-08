import { useEffect } from "react";
import { useLocation } from "./core/hooks";
import { GlobalHeader } from "./components/GlobalHeader";
import { StoreNav } from "./components/StoreNav";
import { StatusBanner } from "./components/StatusBanner";
import { Footer } from "./components/Footer";
import { Link } from "./components/Link";
import Home from "./pages/Home";
import ExploreNew from "./pages/ExploreNew";
import AgeCheck from "./pages/AgeCheck";
import AppPage from "./pages/AppPage";
import Search from "./pages/Search";
import Auth from "./pages/Auth";

function route(path: string, search: string) {
  let m: RegExpMatchArray | null;
  if (path === "/") return <Home />;
  if (path === "/explore/new" || path === "/explore/new/") return <ExploreNew />;
  if ((m = path.match(/^\/agecheck\/app\/(\d+)\/?$/))) return <AgeCheck id={m[1]} />;
  if ((m = path.match(/^\/app\/(\d+)(\/.*)?$/))) return <AppPage id={m[1]} />;
  if (path === "/search" || path === "/search/") return <Search search={search} />;
  if (path === "/login") return <Auth mode="login" />;
  if (path === "/join") return <Auth mode="join" />;
  return (
    <div className="mx-auto max-w-[940px] px-2 py-20 text-center">
      <h1 className="font-motiva text-[26px] text-white">Oops, sorry!</h1>
      <p className="mt-2 text-[14px] text-[#c6d4df]">We couldn't find that page.</p>
      <Link to="/" className="btn-blue mt-6">Return to the store</Link>
    </div>
  );
}

export default function App() {
  const loc = useLocation();
  const [path, search = ""] = loc.split("?");
  const hideNav = path === "/login" || path === "/join";
  useEffect(() => { document.getElementById("main")?.focus({ preventScroll: true }); }, [path]);
  return (
    <>
      <StatusBanner />
      <GlobalHeader />
      {!hideNav && <StoreNav />}
      <main id="main" key={path} tabIndex={-1} className="anim-page min-h-[70vh] pt-3 outline-none">{route(path, search)}</main>
      <Footer />
    </>
  );
}
