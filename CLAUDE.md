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
- **One dependency was added for the map**: `leaflet` (plus `@types/leaflet`).
  It is imported by `RestaurantMap` alone and lands in its own chunk. Nothing
  else in the app may import it.
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
- Target a main bundle under 250 KiB (currently ~534 KiB / 547,298 bytes).
  Leaflet is **not** in it: the map is a lazy component inside a lazy route,
  and its 164 KiB chunk is downloaded only by somebody who taps Map.
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

## Generic imagery is a separate thing, and says so

`CuisineStrip` on the homepage is the one place stock photography appears, and
three rules keep it from being mistaken for the real thing.

- **It is labelled.** "Stock photos, not from these restaurants" sits beside
  the heading. Every other photograph in this product is evidence somebody was
  at a table; a reader must never have to work out which kind they are looking
  at, and a per-photo credit is too quiet to carry that alone.
- **It sits below the diner photos, always.** When there are uploads, their
  work leads and this is a footnote.
- **`DishPhoto` refuses `IMAGE_SOURCE.generic`** outright, so a generic image
  cannot render as a photo of a dish even if one reached the component.

**Deliberately not interactive.** Searching a cuisine reaches the AI generation
path, which is the one place this product spends real money — a grid on the
front door where every tap opens the wallet is a bad idea whatever the rate
limit says, and there is no cuisine-browse route to land on either. The credit
links are the only interactive thing in a tile, which also means nothing is
nested inside anything else.

The credit **wraps rather than truncates**. `truncate` clipped it to "Photo by
Orijit Chatterjee on Uns…", and the Unsplash link is required by the API terms
— cutting it off is a compliance problem, not a cosmetic one.

## Leaderboards and the Champion

`TopContributors` sits **below the whole menu**, not above it. The food is the
page and reputation supports it; a ranking of photographers over the dishes
inverts that, and nobody arrived here to read one.

- **The number is Cred earned at this restaurant**, never a global total.
- **It renders nothing until somebody has earned some** — same rule as the
  "most loved" strip. A heading claiming a thing the data has not earned is
  worse than no section.
- **Three, then a link.** `LEADERBOARD_PREVIEW`.
- **`ChampionIcon` is a rosette, not a trophy.** A trophy reads as a
  competition that is over; this is a standing that changes hands the moment
  somebody contributes more. Same swap contract as `FoodCredIcon` —
  `REPUTATION_ASSETS.champion`.
- **First-photographed credit lives in the dish sheet**, and is separate from
  whoever's photo leads today. Two different facts; the product says both and
  the first never changes hands.
- **Profiles are public** (`/contributor/:username`), because a leaderboard
  whose names lead nowhere unless you have an account is one most readers
  cannot use. Unknown, blocked, inactive and erased all render identically —
  distinguishing them would make the page a way to find out whether an account
  exists and what happened to it.

**`restaurantInfo` in `MenuResults` is assembled field by field**, so a new
field on the query is invisible until it is named there. The Champion badge
silently did not render for exactly this reason.

## Badges

`BadgeIcon` takes the **icon key the server sent**, never a URL, so badge logic
and badge graphics stay uncoupled — swapping artwork is one entry in
`REPUTATION_ASSETS.badges` and nothing else. Until then every badge shares one
placeholder shape and is told apart by its name, which is honest: nine bespoke
placeholder drawings would be nine things to throw away.

- **Unearned badges render, greyed, with "7 / 10".** That is the whole reason
  they are shown. A badge you cannot see yourself approaching is a surprise
  rather than an incentive.
- **Public profiles pass `showProgress={false}`** and the server sends earned
  badges only. How close a stranger is to something is their business — belt
  and braces, on purpose.
- **The description is the `title`**, because on a phone there is no room for
  it under every tile.

## Suggesting a menu correction

The menus are extracted by a language model, so they are wrong in ordinary
ways. The person who can see that is sitting in front of the dish.

- **Collapsed, at the bottom of the sheet.** A repair tool, not a call to
  action — it must not compete with the photograph or the vote, which are what
  somebody opened the sheet for. It opens only for a reader who already thinks
  something is off.
- **It says nothing changes on the strength of one suggestion.** Without that
  line it reads as an edit button that silently did nothing.
- **The field list omits allergens, and says why.** `CORRECTABLE_FIELDS` is
  name, description, price and section. A test asserts no dietary field ever
  appears — they are the one thing where being wrong can hurt somebody, so they
  come from the kitchen or from nobody.
- **Server refusals are shown verbatim.** Each one explains a rule — already
  queued, not a number, that is what it already says — and rewording them here
  would turn an explanation into a failure message.

`CorrectionQueue` shows what a field says now beside what is proposed, because
approving a change you cannot see is not a decision. "was empty" is called out
rather than rendered blank: filling a hole and overwriting a fact are different
things to agree to.

## Signing up, and what a person is called

Registration asks for **three things: a display name, an email and a
password.** It used to ask for seven — first name, last name, email, phone,
username, password, password again — before anybody had seen a dish, and used
two of them.

- **The handle is derived server-side** from the display name
  (`app/helpers/usernames.py`), deduped, and changeable later in settings.
  `/contributor/:username` is a real URL so there has to be one, but nobody
  should have to invent it at the door.
- **Signing up signs you in.** `createUser` then `login(email, password)`, then
  home. Handing somebody back to a login form to retype the password they chose
  four seconds ago is a step that exists only because the two mutations are
  separate.
- **An email is a valid identifier on sign-in.** It has to be: the handle was
  derived and a new account holder has never seen theirs. `LoginService`
  matched a username only, for the whole life of a field labelled "Email or
  username".
- **Server refusals are shown verbatim** — "That email already has an account",
  "Password must be at least 8 characters". Each explains a rule; "Could not
  create that account" explains none of them.
- **`AUTH_PROVIDERS` is the slot for "Continue with Google".** It is empty, so
  the buttons and the "or continue with email" divider do not render. The
  backend has no OAuth endpoint, and a dead button at the front door is worse
  than an absent one — the same reason there is no "Forgot password?" link.
  Filling the array is all the frontend needs.
- **`displayName()` in `utils/people.ts` is the only place a name is worked
  out** — display name, then the legacy name parts, then the handle. Three
  components each had their own copy of `first_name last_name`.
- **`AuthField` is shared by both auth pages**, at 48px. They were built months
  apart and looked it.

## Finding food near you

The front door answers two questions now: which restaurant, and what is around
me. Search stays the primary action — somebody who knows the name should type
it — and the location control is a quieter line under it.

- **One location for the whole app.** `DiscoveryLocationProvider`, not a hook
  with its own state. It *was* a plain hook, and every test passed while the
  feature was broken: tapping "use my current location" on the home page and
  navigating to `/nearby` mounted a second copy with no fix in it, so the page
  asked "choose where to look" a second after being told. Every test rendered
  one component. Driving the app found it in one tap.
- **The device is asked once, from a tap, and never again on its own.** A page
  that re-prompts is how somebody blocks the permission at the browser level,
  which cannot be undone from inside the page. After a refusal the button is
  replaced by the typed alternative rather than left there doing nothing.
- **Every failure says which failure it was.** Denied, unavailable, timed out
  and unsupported lead to different next moves.
- **Only a typed choice is stored.** A device fix is never written to disk: it
  is the most sensitive thing this app touches, it is stale within the hour,
  and re-asking costs one tap. A choice beats a fix — somebody who typed
  "Flushing" in Brooklyn meant it.
- **The heading names an area, never an address.** "Trending near Flushing".
  The server picks the name from the nearest restaurant it knows; nothing
  reverse-geocodes anybody to a street and coordinates never reach a URL.
- **`LocationCue` is always mounted**, never rendered conditionally on having a
  location. Hiding it once located unmounted the component in the same render
  the fix arrived in, so the effect that navigates never ran — the button
  visibly did nothing.

## The map

`RestaurantMap`, and it is the only file that knows a map library exists.

- **Leaflet with OpenStreetMap tiles, because they need no key.** Google Maps
  and Mapbox both bill per load and both want a billing account before the
  first pin renders. There is no traffic to justify a metered dependency yet,
  and swapping later is this one component — the page passes places and
  receives bounds.
- **It is lazy, inside a lazy route.** Leaflet plus its stylesheet has no
  business in the bundle somebody downloads to read a menu, so the list is the
  default view and the map arrives on the tap that shows it.
- **The list is never replaced by the map.** No keyboard reaches a pin and no
  screen reader reads a tile layer, so the same places in the same order stay
  underneath it. A map is the appealing half and the unusable one.
- **The Leaflet instance is created once, behind a ref.** Rebuilding it on
  render loses the reader's pan and zoom, which is the whole interaction.
- **"Search this area" appears only after the map has moved.** Offered before,
  it invites a tap that re-runs the search just performed.

## Trending, and the honest version of it

`TrendingStrip`, above the stock imagery and below the search.

- **Real community photographs only.** The strip below it is stock and says so;
  if this one borrowed from it, the distinction the product rests on would be
  gone from the front door.
- **The server decides which of its two states this is** and sends `mode`. The
  threshold for "enough activity to call this trending" is a rule about the
  data, and a copy in the browser is a second source of truth.
- **The empty state is the ask, not an apology.** A real dish at a real
  restaurant nearby, "No dish photos yet", and a way into the upload flow.
  Nothing invented — no placeholder popularity, no rounded-up counts.
- **The place name is the control.** Somebody reading "near Flushing" in
  Brooklyn needs the fix to be where the wrong word is.

## Cuisine tiles go somewhere now

`CuisineStrip` was deliberately inert, and the reason was sound: a cuisine
search reached the AI generation path — the one place this product spends real
money — and there was no cuisine route to land on. Both changed. `/nearby?
cuisine=chinese` answers out of the database: a bounding box and a `cuisine`
column, no model, no third party.

- **The whole tile is the link**, not the word. A label-sized target inside a
  160px card is what a thumb misses.
- **The credit sits outside that link.** A link inside a link is invalid and
  browsers resolve it by dropping one — which would be the one Unsplash's
  terms require.
- **A swipe on a phone, a grid from `sm` up.** Two and a half cards visible at
  390px, which is what says "there is more to the right".
- **Most restaurants have no cuisine and so appear under no tile.** The
  classifier refuses to guess; see the backend note. A short list beats a
  wrong one.

## The reputation system on the front door

`ContributorIntro` introduces it in three lines and links to `/rankings`. The
rules, the badge shelf and the leaderboards live there.

- **No point values anywhere in the browser.** `customConstants/reputation.ts`
  still holds none, and `/rankings` describes the *shape* — which contributions
  are worth more and why — rather than the numbers. A figure here is a second
  source of truth and the one that goes stale.
- **Signed in, the pitch is replaced by the real standing.** `LevelProgress`
  and `useFoodCred` already existed; this is a swap, not a second system.
  `unavailable` still means "we could not ask", never "you have contributed
  nothing".

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

## The review queue

`/admin` is where a claim is decided, a reported photo is kept or removed, and
a suggested correction is applied. It is the one place photo removal exists,
which is what stops an owner deleting the unflattering pictures of their food.

- **It is on the account menu, for admins only.** `ACCOUNT_GROUPS` carries an
  `adminOnly` group. The page was reachable by typing the URL and by nothing
  else, so the one person who can work the queues was the one person never
  shown the door. Hiding a link is not access control — the server refuses the
  queries regardless.
- **Counts in every heading and one line at the top.** The common visit ends in
  "nothing to do", and that should cost a glance rather than three scrolls past
  three empty sections.
- **`useQueueDecision` owns the row state** — which row is busy, which row
  failed. All three queues used to fire and forget, so a click did nothing
  visible until the page reloaded behind it and a failed decision looked
  exactly like a successful one.
- **Removing a photo asks twice.** `QueueRowActions destructive`. Keeping is one
  click, because most reports are wrong and nothing happening is the common
  outcome.
- **A reported photo names its dish.** "Is this that dish?" is the question, and
  the queue used to show everything except the answer — picture, reason,
  uploader. `PhotoReport` carries `dish_name`/`restaurant_name`/slug, resolved
  one query per page rather than one per row.
- **Reasons are rendered in words.** `reportReasonLabel`; it printed
  `wrong_dish`.
- **A non-admin is told, not shown a blank.** It returned `null`, which under a
  heading reading "Review" looks like a page that failed to load.

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
