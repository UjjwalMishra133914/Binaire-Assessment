import { useEffect, useState, type FormEvent } from "react";
import { AuthService } from "../core/AuthService";
import { Router } from "../core/Router";
import { useOnline, useUser } from "../core/hooks";
import { Link } from "../components/Link";

type Fields = { name: string; email: string; confirm: string; password: string; agree: boolean };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: Fields, signup: boolean): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (signup && !f.name.trim()) e.name = "Please enter a display name.";
  if (!EMAIL.test(f.email)) e.email = "Please enter a valid email address.";
  if (signup && f.confirm !== f.email) e.confirm = "Please enter the same address in both email address fields.";
  if (f.password.length < 6) e.password = "Passwords must be at least 6 characters.";
  if (signup && !f.agree) e.agree = "You must be 13 or older and agree to the terms to create an account.";
  return e;
}

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6z" />
  </svg>
);

/** Sign-in and account creation, both backed by Firebase Authentication (email/password + Google). */
export default function Auth({ mode }: { mode: "join" | "login" }) {
  const signup = mode === "join";
  const online = useOnline();
  const user = useUser();
  const [f, setF] = useState<Fields>({ name: "", email: "", confirm: "", password: "", agree: false });
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const errors = touched ? validate(f, signup) : {};
  useEffect(() => { document.title = signup ? "Create Your Account" : "Sign In"; }, [signup]);

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setF((p) => ({ ...p, [k]: v }));
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setTouched(true); setErr("");
    if (Object.keys(validate(f, signup)).length) return;
    setBusy(true);
    try {
      const a = AuthService.get();
      if (signup) await a.signUp(f.name.trim(), f.email, f.password); else await a.signIn(f.email, f.password);
      Router.get().navigate("/");
    } catch (x) { setErr(AuthService.friendlyError(x)); } finally { setBusy(false); }
  };
  const google = async () => {
    setErr(""); setBusy(true);
    try {
      await AuthService.get().signInWithGoogle();
      Router.get().navigate("/");
    } catch (x) { setErr(AuthService.friendlyError(x)); } finally { setBusy(false); }
  };

  const label = "mb-1.5 block font-motiva text-[12px] font-bold uppercase tracking-wide text-[#1999ff]";
  const fieldErr = (k: keyof Fields) => errors[k] && <p id={`${k}-err`} className="mt-1 text-[12px] text-[#c15755]">{errors[k]}</p>;
  const aria = (k: keyof Fields) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });

  if (user) return (
    <div className="mx-auto max-w-[740px] px-4 py-16 text-center">
      <h1 className="font-motiva text-[32px] font-light text-white">You're signed in</h1>
      <p className="mt-2 text-[14px] text-[#c6d4df]">Signed in as {user.displayName || user.email}.</p>
      <div className="mt-6 flex justify-center gap-2"><Link to="/" className="btn-steamui">Go to the store</Link><button type="button" className="btn-blue" onClick={() => AuthService.get().signOut()}>Sign out</button></div>
    </div>
  );

  return (
    <div className="-mt-3 bg-[linear-gradient(to_bottom,#181a21_0%,#1b2838_100%)] px-4 pb-24 pt-14">
      <div className="mx-auto max-w-[740px]">
        <h1 className="anim-fade-up mb-6 font-motiva text-[32px] font-light uppercase tracking-wide text-white">{signup ? "Create your account" : "Sign in"}</h1>
        <div className="anim-fade-up rounded-[4px] bg-[#181a21] p-8 shadow-[0_0_20px_rgba(0,0,0,.6)] transition focus-within:shadow-[0_0_0_1px_rgba(26,159,255,.4),0_0_20px_rgba(0,0,0,.6)] max-sm:p-5" style={{ animationDelay: "60ms" }}>
          <form onSubmit={submit} noValidate className="max-w-[390px] space-y-4">
            {signup && (
              <div>
                <label htmlFor="name" className={label}>Display name</label>
                <input id="name" className="steam-input" autoComplete="nickname" value={f.name} onChange={(e) => set("name", e.target.value)} {...aria("name")} />
                {fieldErr("name")}
              </div>
            )}
            <div>
              <label htmlFor="email" className={label}>{signup ? "Email address" : "Sign in with email address"}</label>
              <input id="email" type="email" className="steam-input" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
              {fieldErr("email")}
            </div>
            {signup && (
              <div>
                <label htmlFor="confirm" className={label}>Confirm your address</label>
                <input id="confirm" type="email" className="steam-input" autoComplete="email" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} {...aria("confirm")} />
                {fieldErr("confirm")}
              </div>
            )}
            <div>
              <label htmlFor="password" className={`${label} !text-[#afafaf]`}>Password</label>
              <input id="password" type="password" className="steam-input" autoComplete={signup ? "new-password" : "current-password"} value={f.password} onChange={(e) => set("password", e.target.value)} {...aria("password")} />
              {fieldErr("password")}
            </div>
            {signup ? (
              <div>
                <label className="flex cursor-pointer items-start gap-2 text-[13px] text-[#afafaf] hover:text-white">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#1a9fff]" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} {...aria("agree")} />
                  I am 13 years of age or older and agree to the terms of the Steam Subscriber Agreement and the Privacy Policy.
                </label>
                {fieldErr("agree")}
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#afafaf] hover:text-white">
                <input type="checkbox" className="h-4 w-4 accent-[#1a9fff]" defaultChecked /> Remember me
              </label>
            )}
            {err && <p role="alert" className="rounded-sm bg-[#c15755]/15 px-3 py-2 text-[13px] text-[#e3797a]">{err}</p>}
            {!online && <p role="status" className="text-[13px] text-[#e97a4a]">You're offline — connect to the internet to {signup ? "create an account" : "sign in"}.</p>}
            <div className="flex justify-center pt-2 sm:justify-start">
              <button type="submit" className="btn-steamui min-w-[270px]" disabled={busy || !online}>{busy ? "Please wait…" : signup ? "Continue" : "Sign in"}</button>
            </div>

            <div className="flex items-center gap-3 pt-1 text-[12px] uppercase text-[#6d7880]" aria-hidden="true">
              <span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex justify-center sm:justify-start">
              <button type="button" onClick={google} disabled={busy || !online}
                className="flex min-w-[270px] items-center justify-center gap-3 rounded-[2px] bg-white px-5 py-2 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#f1f3f4] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60">
                <GoogleG />Continue with Google
              </button>
            </div>

            <p className="pt-2 text-[12px] text-[#afafaf]">
              {signup ? "Already have an account? " : "New to Steam? "}
              <Link to={signup ? "/login" : "/join"} className="text-white underline underline-offset-2 transition hover:text-[#1a9fff]">{signup ? "Sign in" : "Create a free account"}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}