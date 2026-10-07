import { useEffect, useState, type FormEvent } from "react";
import { TMDBService } from "../core/TMDBService";
import { AgeGate } from "../core/AgeGate";
import { Router } from "../core/Router";
import { useAsync } from "../core/hooks";
import { Link } from "../components/Link";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1900 + 1 }, (_, i) => 1900 + i);

/** Steam's age gate: shown before the store page of a mature title. */
export default function AgeCheck({ id }: { id: string }) {
  const api = TMDBService.get();
  const { data: m, error } = useAsync(() => api.detail(id), [id]);
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(THIS_YEAR);
  const [denied, setDenied] = useState(false);
  useEffect(() => { if (m) document.title = `${m.title} on Freznel`; }, [m]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (AgeGate.get().submit(day, month, year)) Router.get().replace(`/app/${id}`);
    else setDenied(true);
  };

  const cert = m ? AgeGate.certification(m) : "";
  const bg = m?.images?.backdrops[1]?.file_path ?? m?.backdrop_path;
  return (
    <div className="relative isolate -mt-3 min-h-[640px] overflow-hidden pb-[150px] pt-[8%] font-motiva font-extralight">
      {bg && <div className="anim-fade-in absolute inset-0 -z-10 bg-cover bg-top opacity-40" style={{ backgroundImage: `url(${api.img(bg, "w1280")})` }} aria-hidden />}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(27,40,56,.3)_0%,#1b2838_85%)]" aria-hidden />
      {error && <p role="alert" className="mx-auto max-w-[550px] bg-black/40 p-4 text-center text-[14px] text-[#e97a4a]">{error}</p>}

      <div id="app_agegate" className="anim-pop mx-auto max-w-[940px] px-4">
        <div className="mt-12 rounded-[5px] border border-white/20 bg-[rgba(0,0,0,.25)] backdrop-blur-[2px]">
          {denied ? (
            <div className="mx-auto max-w-[550px] py-14 text-center">
              <h2 className="text-[24px] font-extralight text-white">Sorry, but you are not permitted to view these materials at this time.</h2>
              <Link to="/" className="btn-blue mt-8">Return to the store</Link>
            </div>
          ) : (
            <form onSubmit={submit} aria-labelledby="agegate-h">
              <div className="mx-auto max-w-[550px] text-center">
                <div className="-mt-[45px] mb-[15px]">
                  {m ? <img src={api.img(bg ?? m.poster_path, "w500")} alt={`${m.title} header`} className="mx-auto aspect-[460/215] w-1/2 bg-white/10 object-cover shadow-[0_0_5px_#000]" />
                    : <div className="skeleton mx-auto aspect-[460/215] w-1/2" />}
                </div>
                <h2 id="agegate-h" className="px-3 text-[24px] font-extralight leading-[1.3] text-white">
                  This title may contain content not appropriate for all ages,<br className="max-sm:hidden" /> or may not be appropriate for viewing at work.
                </h2>
                <div className="mt-5 px-3 text-[14px] text-[#9db2be]">
                  The publisher describes the content like this:
                  <p className="mt-1 text-[14px] text-[#dee6ed]">
                    “{m ? `${m.title} is rated ${cert || "for mature audiences"}${m.genres.length ? ` and contains ${m.genres.map((g) => g.name.toLowerCase()).slice(0, 3).join(", ")} themes` : ""}. ${m.tagline || ""}` : "Loading…"}”
                  </p>
                </div>
              </div>

              <fieldset className="mx-auto mt-5 max-w-[550px] rounded-[5px] bg-white/10 p-3 text-center transition focus-within:bg-white/[.14]">
                <legend className="sr-only">Date of birth</legend>
                <div className="pb-2.5 text-[14px] text-[#c6d4df]">Please enter your birth date to continue:</div>
                <div className="flex justify-center gap-1">
                  <label htmlFor="ageDay" className="sr-only">Day</label>
                  <select id="ageDay" className="steam-select" value={day} onChange={(e) => setDay(+e.target.value)}>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <label htmlFor="ageMonth" className="sr-only">Month</label>
                  <select id="ageMonth" className="steam-select" value={month} onChange={(e) => setMonth(+e.target.value)}>
                    {AgeGate.MONTHS.map((mo, i) => <option key={mo} value={i}>{mo}</option>)}
                  </select>
                  <label htmlFor="ageYear" className="sr-only">Year</label>
                  <select id="ageYear" className="steam-select" value={year} onChange={(e) => setYear(+e.target.value)}>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </fieldset>

              <div className="mx-auto mt-[6vh] flex max-w-[calc(100%-50px)] justify-center gap-3 pb-[30px]">
                <button type="submit" id="view_product_page_btn" className="btn-blue" disabled={!m} autoFocus>View Page</button>
                <Link to="/" className="btn-blue">Cancel</Link>
              </div>
            </form>
          )}
        </div>
        <p className="mx-auto mt-5 max-w-[550px] pt-5 text-center text-[11px] font-light text-[#9db2be]">This data is for verification purposes only and is kept only until you close this tab.</p>
      </div>
    </div>
  );
}
