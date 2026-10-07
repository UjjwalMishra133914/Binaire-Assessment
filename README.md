# Binaire_Freznel_Assessment — Web-Store UI

A Steam-store-style web store built with React + TypeScript + Tailwind CSS and CSS keyframe animations.
Content (titles, art, ratings) comes from the TMDB API. Client-side only, so no SSR, and no router, pagination or lazy-loading libraries.

## Run
```bash
npm install
cp .env.example .env     # add your TMDB v3 key + Firebase web config
npm run dev              # http://localhost:5173
```
Offline test: `npm run build && npm run preview`, browse once while online, then switch to **Offline** in DevTools → Network.

## Setup
- **TMDB**: https://www.themoviedb.org/settings/api → `VITE_TMDB_KEY`
- **Firebase**: console → new project → *Authentication → Sign-in method → Email/Password* → add a Web app → copy its config into `.env`

## Pages (mapped to the three reference pages)
| Route | Reference | What it shows |
|---|---|---|
| `/` | store.steampowered.com | Featured & Recommended carousel, Special Offers, Browse by Category, tabbed lists (New & Trending / Top Sellers / Popular Upcoming / Specials) with the hover preview pane, sign-in prompt, left gutter |
| `/agecheck/app/:id` | store.steampowered.com/agecheck/app/1091500 | Age gate (day / month / year). Opening a mature title (R, NC-17, 18…) at `/app/:id` redirects here; under-18 visitors see the "not permitted" message |
| `/explore/new` | store.steampowered.com/explore/new | New Releases: headline capsules, New Release Queue, New Top Sellers carousel, Popular New Releases / New Releases tabs **with pagination**, Under ₹500 / Under ₹250 |
| `/app/:id` | (target of the age gate) | Store page: media player (trailer + screenshots), summary, reviews, tags, Buy box with Add to Cart, wishlist, More like this |
| `/search` | (Steam search) | Result rows, sort, price slider, section & genre filters, **pagination** |
| `/login`, `/join` | (Steam sign in) | Firebase email/password authentication |

## Architecture (OOP)
| Class | Role |
|---|---|
| `TMDBService` | API client; mirrors every response to localStorage and de-duplicates in-flight requests |
| `AuthService` | Firebase Authentication (sign up / sign in / sign out) |
| `NetworkMonitor` | online/offline events → status pill in the header + banner |
| `Router` | History-API router (`navigate` / `replace`); the URL hash stays free for `:target` |
| `Paginator` | from-scratch page-window maths (`1 … 4 5 6 … 12`) |
| `LazyLoader` | from-scratch lazy loading on IntersectionObserver, for images and whole sections |
| `Carousel` | paged carousel state, wrap-around, autoplay that pauses on hover/focus |
| `AgeGate` | certification lookup, age calculation, session-scoped verification |
| `PriceEngine` | stable INR price + discount per title (TMDB has no prices) |
| `ReviewSummary` | Steam review label ("Very Positive"…) from TMDB score and vote count |
| `CartService` | cart + wishlist persisted in localStorage, synced across tabs |
| `RecentlyViewed` | last five opened store pages (left gutter) |

The service worker (`public/sw.js`) caches the app shell, TMDB responses and images, so the whole app works offline after one online visit.

## Interaction states
- **Hover / active:** every button, link, capsule, tab and row.
- **Focus / focus-visible:** a blue focus ring site-wide, plus input focus borders.
- **Focus-within:** store nav flyouts open on keyboard focus; search box, filter blocks, the age-gate date picker and the auth card highlight when a child has focus.
- **`:target`:** the cart drawer (`#cart`) exists only while targeted; footer sections (`#about`, `#community`, `#support`) and home sections flash when linked.

## Accessibility
- Skip link, landmarks and breadcrumbs.
- Labelled form controls with `aria-invalid` / `aria-describedby` error messages.
- `role="tablist"` tabs with arrow-key navigation; keyboard-operable carousels (← →).
- `aria-live` connectivity status, `aria-current` / `aria-selected`, discount prices read as full sentences.
- `prefers-reduced-motion` support; focus moves to `<main>` on route change.

## Notes
- The Steam logo and trademarks are not used; the brand is "Freznel". Steam's font (Motiva Sans) is not freely available, so headings use Nunito Sans, and body text is Arial, the same as Steam.
