# whatsdatfood-react

Frontend for whatsdatfood. The product answers two questions and nothing else:
**what does this dish look like**, and **what should I order here**.

Anything that does not help someone at a table decide what to order is out of
scope. Friends, favorites-as-a-destination, search history and venue metadata
(Michelin scores, parking, payment methods) still exist but are not invested in.

## Commands

CI runs `npm run verify`, the build and `npm audit` on every push, so the
testing rule below is enforced rather than remembered.

```bash
npm start          # webpack dev server on :3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm test           # jest
npm run verify     # typecheck + test — run this before saying work is done
```

The backend is **`whatsdatfood-python` on :8081**. Search and photo uploads
are rate limited there, so expect `TOO_MANY_REQUESTS` under a hammering.
 `whatsdatfood-node` is retired
— the whole app flow was verified with it stopped. The URL comes from `.env`:
`REACT_APP_GRAPHQL_BACKEND_URL`; `.env.node-backup` holds the old settings.

The GraphQL contract is unchanged, so every document here and the Apollo
`typePolicies` work against Python exactly as they did against Node.

## Testing is required, not optional

**Write tests with the code, not after.** A change is not finished until
`npm run verify` passes.

- Pure logic (`src/utils/`) gets unit tests covering the real edge cases —
  empty input, one item, the threshold boundary. This is where most value is.
- Components get behaviour tests via `@testing-library/react`: what the user
  sees and what handlers receive. Query by role, label or text — never by class
  name or test id unless there is no alternative.
- Hooks that own logic get tests. Hooks that only wrap Apollo usually do not.
- Colocate: `src/utils/ranking.test.ts`, `src/components/DishCard/index.test.tsx`.

`jest.config.js` `moduleNameMapper` is order-sensitive: the first match wins and
nothing re-maps the result. The asset patterns must come **before** `^@/`, or
`import gif from "@/assets/loading.gif"` resolves to a real GIF that Jest tries
to parse as JavaScript — which is why anything importing `Loading`, and so the
whole menu page, could not be tested at all.

Tests assert what the code actually guarantees. If a test fails because a
comment or a claim was too strong, fix the claim — do not weaken the test into
tautology. This has already happened once: shrinkage narrows the gap between a
one-vote dish and a fifty-vote dish, but does not by itself reverse the order;
the vote threshold is what keeps a barely-voted dish out of the ranking.

## Conventions

- **TypeScript everywhere. No `any`.** If a type is awkward, fix the type.
- **Literals live in `src/customConstants/`** — `routes.ts`, `ranking.ts`,
  `images.ts`, `labels.ts`. No inline strings for routes, labels or magic
  numbers. Derive union types from constants
  (`type X = (typeof CONST)[keyof typeof CONST]`).
- **Interfaces live in `src/interfaces/`**, shared types in `src/types/`.
  Component props are an exported interface, not an inline object type.
- **Components are reusable and prop-driven.** They take data and callbacks;
  they do not reach into global state or fetch their own data. Data access goes
  in `src/customHooks/`.
- **Narrow rather than restate.** `MenuInterfaceItemType extends MenuItemType`;
  do not copy a field list between two types.
- **Stable keys.** Use the entity id, never the array index — lists reorder by
  rank.
- **Styling is Tailwind.** MUI is gone — do not reintroduce it, or
  `@emotion/*`, which only ever came along as its styling engine. The
  per-component `index.css` files are still being deleted as their components
  are touched; do not add new ones.
- **Icons are inline SVG in `src/components/icons/`.** Every
  `@mui/icons-material` import pulled in `SvgIcon` and therefore the whole
  emotion runtime for the sake of a chevron. Add a new icon to that module
  rather than reaching for a package.

## Design system

Tailwind 4 is configured **in CSS** (`src/index.css`), not JavaScript. The old
`tailwind.config.js` was being ignored entirely — its theme extensions never
existed — and the v3 `@tailwind` directives meant **no `dark:` rule was ever
generated**, so dark mode silently did nothing across the whole app. Both are
fixed; do not reintroduce a JS config.

Style through the semantic tokens, not raw palette classes:

| Token | Use |
|---|---|
| `surface` / `surface-raised` / `surface-sunken` | page, panels, wells |
| `ink` / `ink-muted` | primary and secondary text |
| `line` | borders |
| `brand` / `brand-soft` | the vote, and nothing that competes with it |
| `warn` / `danger` / `spice` | allergens, destructive actions, heat |

A token flips with the theme, so `bg-surface-raised` replaces
`bg-white dark:bg-neutral-900`. **Do not add `dark:` variants for neutrals** —
they are the half somebody forgets to update, and the token already handles it.

### Which theme is showing

`data-theme="light" | "dark"` on `<html>` is the single source of truth. An
inline script in `public/index.html` resolves the stored preference — or the OS,
when it is `system` — before first paint, so the page never flashes the wrong
theme. `useTheme` owns it from there; nothing else should write the attribute or
read `prefers-color-scheme` directly.

The preference is `light | dark | system` and defaults to `system`. That third
value is the reason the switch is three-way: a two-state toggle pins the viewer
to one theme the moment they touch it.

**Never hardcode `white`, `black`, or a hex in CSS.** A white panel with
inherited text colour is invisible in dark mode — that bug shipped in the search
suggestions, both modals and the account menu. Use the tokens; they are
available to plain CSS as `var(--color-surface-raised)` and friends.

Focus is styled once globally on `:focus-visible`; components do not need their
own ring utilities. Reduced motion is honoured globally too.

## Design
Mobile-first: one hand, dim room, cellular in a basement, deciding in under a
minute. Design for the phone and let desktop be the override, never the reverse.

- The photo is the interface — chrome recedes.
- Vote controls sit in the lower third, within thumb reach.
- Detail opens as a bottom sheet, not a route change.
- Dark mode matters; restaurants are dim.
- Target a main bundle under 250 KiB (currently ~516 KiB / 528,727 bytes).
  Deleting unreferenced components does not move this number — webpack only
  bundles what the entry graph reaches, so dead code costs repo clarity, not
  bytes. Removing MUI and emotion took 90,364 bytes off; the remaining gap is
  Apollo plus React itself, so the next real move is route-level splitting, not
  another dependency sweep.

## Architecture worth knowing

- **Ranking runs client-side** in `utils/ranking.ts` from the ratings already
  nested in the menu payload. No extra request. Bayesian shrinkage toward the
  restaurant mean; below `MIN_VOTES_TO_RANK` show the count, never a rank.
- **Voting reuses `addUserRating`.** Thumbs map onto the 1–5 scale
  (`VOTE.up`/`VOTE.down`), so no schema change was needed. The backend keys on
  user + dish, so a second vote updates rather than duplicates.
- **Apollo cache is normalised**: `Restaurant` by `slug`, `RestaurantMenuItem`
  and `UserRating` by `id`. A vote is written into the cache directly rather
  than refetching the menu, because a cold menu costs the backend an AI call.
- **The menu query is cache-first.** After any write, refetch with
  `forceNetwork` or you will read back the data you just replaced.
- **Photo lookup is capped and visibility-driven** — only dishes with no photo,
  only when scrolled near, at most `PHOTO_LOOKUP.MAX_PER_PAGE_VIEW` per page
  view, with a session-level negative cache. Every dish firing a lookup on every
  load is what made a single page view cost 21 image searches.
- **"Most loved here" only exists when it has been earned.** `getTopDishes` is
  empty until a dish clears `MIN_VOTES_TO_RANK`, and the page then renders no
  strip at all. It used to fall back to the AI's `top_choice` flag under the
  heading "Popular picks · not yet voted on" — a contradiction, printed above a
  copy of the top of the menu. Do not reintroduce a fallback: the ranking is the
  product, and claiming it early is what makes it untrustworthy.
- **A missing price is `—`, never `$0.00`.** Use `dishPrice`, which treats zero
  as absent. The extraction leaves price null or zero across most of a menu, and
  a currency formatter turns that into a claim that a $180 omakase is free.
- **The sticky category bar is the long-menu answer.** `CategoryNav` plus
  `useActiveSection`. Two rules learned the hard way: never call
  `scrollIntoView` to keep the active chip visible — it scrolls the page too and
  cancels the jump the reader just asked for; and the last section can sit below
  the maximum scroll offset, so "at the bottom" has to select it explicitly.
- **The homepage wall is `recentDishPhotos`** — one cheap server query, no AI
  call, cache-first, and every tile links into that restaurant's menu. The
  server returns one photo per dish and no repeated URL; without that the wall
  showed the same salad three times. It renders **nothing at all** when the
  query is empty or fails, because the search box above it is what people came
  for.
- **A tile whose photo the host refuses is dropped, not shown empty.**
  `DishPhoto` reports it via `onUnavailable`. On a menu the empty tile is the
  upload funnel and belongs there; on the front door it is a hole in the one
  thing the page shows. Third-party hosts 403 often — this is a normal case, not
  an edge one.
- **The dish sheet holds an id, not the dish.** `selectedDishId` plus a lookup
  against the live list. Holding the object made the sheet a snapshot taken when
  it opened: recording an order refetched the menu and the sheet went on showing
  the old row, so the button still said "I ordered this" and the recommend share
  never moved until it was closed and reopened.
- **Never wrap `DishPhoto` in a button.** A 403 turns a tile that had a URL into
  an empty one carrying the upload button, and that commit still has the wrapper
  around it — a button inside a button, which no after-the-fact state update can
  unrender. The open-the-sheet control is an absolutely positioned sibling.

## Contributor reputation — Food Cred

The server owns every number. The frontend renders what it is told and computes
nothing: `src/customConstants/reputation.ts` deliberately contains **no point
values and no level thresholds**, because a copy in the browser is a second
source of truth and invites a component to display a level the server never
agreed to.

- **`<FoodCredIcon />` is the only place the mark is drawn.** Point
  `REPUTATION_ASSETS.foodCred` at an imported SVG or PNG and every instance
  becomes that file — the box is already reserved at the same size, so nothing
  reflows and no component changes. `champion` and `badges` have the same
  contract, ready for Phases 2 and 3.
- **Never an emoji.** An emoji is a different picture on every platform and
  cannot be swapped without editing every call site. A test asserts no
  pictographic character renders.
- **Never money.** No `$`, no "points", "balance", "wallet" or "redeem" — a
  test asserts that too. It is a reputation; the moment it looks like currency
  somebody asks what it is worth.
- **`<FoodCredAmount />` is used for every number**, so the unit stays spelled
  "Food Cred" and never drifts.
- **Two numbers, both true.** `LevelProgress` captions the total against the
  next threshold ("620 / 750") and fills the bar across the band the
  contributor is actually in (300→750, so 71%). Measured from zero every level
  would look nearly finished.
- **The award is carried on the upload response**, not fetched afterwards.
  `useDishPhotoUpload` returns it, and `FoodCredAward` shows it while the
  contributor is still looking at the dish they photographed. A duplicate
  upload earns nothing and shows nothing — announcing "+0" would claim it was a
  contribution.

## The empty photo tile is the common case

Dish photography is community uploads only — the server no longer serves stock
imagery for a dish — so on most menus most tiles are empty, and the empty state
is designed as the main case rather than as a failure.

- **It names the absence and asks**: "No photos yet", then a real button. An
  earlier version deliberately kept this quiet, because loud pills on two
  thirds of a menu drowned out the photographs. That reasoning assumed stock
  imagery filled the other two thirds. It does not any more — the empty tile
  *is* the menu until diners fill it — so a placeholder that whispers just
  makes the page look broken.
- **Prominent through contrast and shape, never `brand`.** Brand is the vote's
  colour; an upload button in it trades one signal for another.
- **A drawn plate, not a crossed-out camera.** One reads as "waiting", the
  other as "broken".
- **`compact` on cards.** "Be the first to add a photo" wraps to four lines in
  a 140px tile, so cards get the short form and the dish sheet gets the
  sentence.
- **`DishPhoto` refuses `IMAGE_SOURCE.generic`.** Cuisine tiles and marketing
  panels illustrate an idea; rendering one under a restaurant's name erases the
  distinction the product's credibility rests on.
- **`useDishPhotoLookup` is dormant.** The server no longer searches, so every
  request would return null — a round trip per dish to be told what the tile
  already says. `MenuResults` no longer calls it. The hook and its budget are
  kept because "every dish fires a lookup on every load" is what made one page
  view cost 21 image searches, and that lesson should not need relearning.

## Photo uploads

The empty photo tile *is* the upload funnel: it appears on exactly the dishes
that need one, and `capture="environment"` opens the camera in one tap, because
the person who can take the photo is sitting at the table.

- `utils/image.ts` resizes and square-crops in the browser first. A 12MP phone
  photo is ~4MB; this sends roughly a tenth. On restaurant wifi that is the
  difference between an upload that finishes and one that is abandoned.
  `computeSquareCrop` is pure and tested; the canvas work around it is thin.
- The file goes as multipart to `POST /uploads/dish/{id}` via
  `useDishPhotoUpload`, not through GraphQL. Image bytes do not belong in a
  JSON transport.
- Community photos are credited through the existing `owner` field.
- An empty tile does not open the detail sheet — it carries the upload button,
  and a button cannot be nested inside another button.
- **There are three ways in, and `PhotoUploadAction` owns all of them.** The
  empty tile on the menu, the stock-photo disclosure in the dish sheet
  ("Have the real dish? Add your photo"), and a prompt straight after somebody
  says they ordered it. One component holds the hidden input, `capture`, and the
  reset that lets the same file be chosen twice — four copies of that is how one
  entry point quietly stops opening the camera. Do not put an upload control on
  cards that already have a photo; discovery happens in the sheet.
- **A diner's photo is the hero.** `getDishPhoto` prefers a community photo over
  a stock one rather than taking whichever came first, which had the search
  result keeping the slot because it was stored earlier.

## Dependencies

`npm audit` must stay at **0 vulnerabilities**. It was 34 (4 critical) before
the August 2026 sweep.

The build chain is `ts-loader` for TypeScript and `ts-jest` for tests — there is
**no Babel**. Do not add `babel-loader` or `.babelrc` back; the previous ones
were dead weight the build never referenced.

Three majors are deliberately deferred, each for a reason:

| Held back | Why |
|---|---|
| `@apollo/client` 3 → 4 | Real breaking changes to cache APIs the `typePolicies` and `updateFragment` vote-write depend on. Needs its own pass with the tests green. |
| `typescript` 5.9 → 7 | Large jump; do it deliberately, not incidentally. |

Before removing a dependency, check it is actually imported — `axios`,
`react-window`, `openai` and the whole Babel toolchain were all installed and
never used. `openai` in particular has no business in a browser bundle.

## Gotchas

- **Do not define `process.env.NODE_ENV` in `webpack.config.js`.** Webpack's
  `mode` already defines it; defining both made them collide and shipped React's
  development build. That fix alone cut 207 KiB.
- **This machine intercepts TLS.** HTTPS from curl and pip fails with
  `unable to get local issuer certificate`. npm is unaffected. For git use
  `git config http.sslBackend schannel`.
