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
- **One dependency was added for the map**: `mapbox-gl`. It is imported by
  `RestaurantMap` alone and lands in its own chunk. Nothing else in the app may
  import it.
- **Every icon comes from `src/components/icons/`, and Lucide draws them.**
  That module is the only file allowed to import `lucide-react`. Lucide
  replaced a hand-drawn set which had itself replaced `@mui/icons-material` —
  where every icon pulled in `SvgIcon` and therefore the whole emotion runtime
  for the sake of a chevron. Lucide reintroduces none of that: tree-shaken ES
  modules, no styling runtime, +7 KiB for the whole set. Two components
  reaching for their own icons is how an app ends up with three chevrons at
  three weights, and it defeats the seam. `AccountButton/icons.tsx` was a
  second hand-drawn set doing exactly that; it is now a lookup into the one
  module.
- **What Lucide cannot draw lives in `icons/food.tsx`** — sushi, a dumpling, a
  taco, noodles — on the same 24x24 grid at the same stroke. A second icon
  family for four glyphs would put two visual languages on one row; these are
  also the first WhatsDatFood food illustrations, which is where this was
  going anyway.

## Category slugs, icons, and the line between them

`customConstants/foodIcons.tsx` maps a category slug to a component and is the
only file that decides how food is drawn. Three surfaces use it: the taste
picker, the cuisine tiles, and the fallback on a restaurant card with no
photograph.

- **The database stores `coffee`, never `CoffeeIcon`.** A slug is business
  data; a component name is a rendering decision that changes. Storing the
  latter makes redrawing an icon a migration over everybody's saved
  preferences. A test asserts no category carries an icon identifier.
- **No flags for a cuisine.** Cuisine does not map onto nationality — a Chinese
  restaurant in Flushing is a Queens restaurant — and a flag makes a claim
  about a country where the card is about food. Every cuisine is drawn as
  something you would eat.
- **Never an emoji**, for the reason `FoodCredIcon` already gives: a different
  picture on every platform, no theme colour, and unswappable without editing
  every call site.
- An unknown slug renders crossed cutlery rather than nothing. A category
  invented on the server must not leave a hole in the page.

## What goes on a restaurant card

`utils/restaurantImage.ts` decides, and `RestaurantCover` draws it. The
homepage used to show six identical grey rectangles with a camera in each.

Priority: **community photo → owner cover → Google Places photo → logo →
our own cuisine artwork.**

- **Community work outranks everything, permanently.** The order is applied at
  render and nothing is written back over an image row, so the first upload at
  a restaurant replaces the borrowed picture everywhere. Google imagery
  physically cannot overwrite a contribution because it is never stored beside
  one.
- **The whole ordered list is returned, not just the winner.** A 403 is the
  common case — third-party hosts refuse hotlinks constantly and a Google photo
  resource expires — so the card walks to the next candidate. `fallback` is
  always last and always present, which is what guarantees a card is never
  empty and never shows the broken-image glyph.
- **Attribution travels with the candidate**, not beside it, so a card cannot
  render a Google photo while missing the credit Google's terms require.
- **Nothing is copied into our storage.** Google's terms permit caching the
  place identifier, not the photograph. We persist the reference; the picture
  is fetched through the supported flow.
- **No Google call was added to the free discovery path.** `nearbyRestaurants`
  and `restaurantsInArea` are our own PostgreSQL rows and reach no third party
  at all — `tests/test_discovery_is_free.py` enforces it. There is no existing
  Google response on that path to piggyback a photo field onto, so the tiers
  wired and live today are community, owner and the cuisine fallback. A Google
  photo reference is populated only where a Place Details call already happens
  for another reason, and served from our row afterwards. **Do not wire a photo
  lookup into the nearby path** to fill the gap; that turns the front door into
  a per-visitor charge.
- **A dish tile is not a restaurant card.** "Help put ___ on the food map" is
  about dishes that need *community* photos, so a restaurant photo must never
  fill that slot — it would tell the reader the dish is already photographed.

## Nearby results come ten at a time

- **`NEARBY.PAGE_SIZE` is 10**, matching `NEARBY_PAGE_SIZE` on the server.
  Opening a cuisine tile costs one query over ten rows; it used to fetch forty
  and throw most away.
- **Paging is an `offset`, and the radius widens per page.** Page one stops at
  the tightest radius that fills it, so ten restaurants within a mile and a
  half is what a dense city returns — nothing three towns away is offered to
  pad the list. Stable because a wider circle is a superset of a tighter one in
  the same distance order, so an offset never skips or repeats.
- **"Show more" is a tap, never a scroll.** An infinite list spends a query
  every time a thumb drifts.
- **The cuisine goes to the server.** `restaurantsInArea` takes one now; the
  page used to filter what came back, which turned "the ten nearest Italian
  places" into "however many of ten happen to be Italian" — usually none.
- **Coordinates are rounded before they become a cache key** (`utils/geo.ts`,
  three decimals; map bounds two, rounded outward so a box never shrinks). An
  unrounded GPS fix differs in the sixth decimal between readings, so every
  re-read was a fresh request for restaurants that had not moved.
- **List → Map fetches nothing.** The map is handed the array the list already
  has. Panning and zooming fetch nothing. Only "Search this area" spends a
  query, and only ten rows of one. Pointing at a row spends nothing either.
- **The map view is a workspace, not a page with a map on it.** From `lg` the
  results are a column and the map is the larger half beside them
  (45/55, widening to 38/62 at `xl`, with a pixel floor so the cards never
  become wrapped fragments — the width the recognition marks will need). It
  is the one screen allowed past the shell's `max-w-5xl`, because every other
  screen is a column of reading and this one is a tool.
- **The workspace pins under the header and the results own the scroll.** The
  title and filters scroll away like ordinary page content, then the split
  reaches the header and stays. Inside it the results pane is the only
  scroller, so a wheel over the list moves the list — the browser scrolls the
  innermost scroller that can still move before it touches the document.
  **Never `overscroll-contain` here**: chaining *is* the handoff, and
  containing it strands a reader who has run out of restaurants above a
  footer they cannot reach. `lg:min-h-0` on the pane is load-bearing — a grid
  item refuses to shrink below its content, so without it the pane grows to
  fit every restaurant and the document scrolls instead, carrying the map off
  the top of the window. The scrollbar is deliberately visible; a pane that
  scrolls without saying so reads as a list that simply ends.
- **The app shell must not wrap `Header` in a second `<header>`.** A sticky
  element can only travel inside its containing block, and that wrapper was a
  box exactly the height of the bar — travel of zero, so the bar scrolled away
  with the page and had never actually been pinned. Nothing looked wrong until
  something was pinned *below* it: the nearby map went on reserving a bar's
  height for a bar no longer on screen, and the list showed through the strip.
  A test asserts one `banner` landmark, which is the readable symptom of the
  same fault.
- **The map workspace subtracts the footer as well as the header.** A
  viewport-tall pinned element and a footer below it in the document cannot
  both be on screen — revealing the footer means the workspace moving up,
  which clips the top of the map and takes the zoom controls with it. Padding
  and sticky travel do not help; the only fix is leaving room, so bar +
  workspace + footer add up to one screen. `--height-footer` is the footer's
  own `min-height`, so the number describes the footer rather than guessing at
  it.
- **`--offset-header` is the only thing to pin against.** The bar's height was
  written three times in three numbers (`h-14`, `top-14`, `scroll-mt-16`), so
  anything sticky was guessing at it — and a guess made against a desktop
  window still renders on a phone. The token includes the bar's 1px border,
  because offsetting by the bar alone leaves a sliver of scrolling content
  above whatever is pinned.
- **Below `lg` the map pins above the list instead.** One thumb, one column:
  the map holds the top of the screen at `--height-map-phone` and the results
  scroll under it. `dvh` rather than `vh` — Safari's toolbar makes them differ
  by the height of a restaurant card, and a map sized in `vh` is cut off
  exactly when the toolbar slides back.
- **That fallback is a variable, never an `@supports` variant on the
  element.** Written as `[@supports(height:1dvh)]:h-[42dvh]`, Tailwind emits
  the block *after* every breakpoint rule in the layer — same specificity,
  later rule, no media query — so it beat `lg:h-full` at every width and the
  map drew into the top of the workspace with a blank half-screen under it.
  Resolving the fallback on `:root` keeps one height class on the element, so
  the breakpoint that overrides it actually can. When a responsive height
  looks ignored, read the built CSS and compare rule positions rather than
  adding `!important`.
- **The map is told when its box changes; it is never rebuilt.** Mapbox sizes
  its canvas to the container it measured once, and no CSS breakpoint reaches
  it — a window resize fires its own listener, going from stacked to split
  does not. A `ResizeObserver` calls `resize()` on the existing instance,
  which keeps the centre, the zoom, the markers, the clusters and the
  selection. Rebuilding to fit a new box throws all of that away while
  somebody is mid-scroll.
- **Hover and selection are two states.** Hover is a preview lasting exactly
  as long as the pointer or the focus; a choice survives the pointer moving
  on. They were one, so tapping a pin and then reading down the list threw the
  choice away on the very next row. Focus does everything hover does — the map
  is the half no keyboard reaches. **Only the map may scroll the list**
  (`scrollToId`, `block: "nearest"`): a row that scrolls itself under a
  pointer travelling down it is the list fighting its reader, which is the
  same trap the category bar hit.

## The map clusters now

`utils/cluster.ts`, and it is the promised revisit of the DOM-marker trade.
`markers.ts` justified DOM markers on the grounds that the server capped a map
query at forty pins so they could never smear — and warned that raising the cap
meant revisiting rather than stretching. Paging raised it.

- **The grouping runs before any marker is built**, so the marker stays a
  `<div>` that can hold a dish photograph. Mapbox's own clustering would need
  circle and symbol layers and sprite images, which is exactly what
  `markers.ts` exists to avoid.
- **Pixels, not degrees.** Everything is projected to Web Mercator at the
  current zoom and bucketed on a 64px grid, so "too close to draw separately"
  means the same thing at every zoom.
- **A lone pin is a cluster of one**, so the map renders one list and cannot
  draw a restaurant twice.
- **Tapping a cluster is a camera move, never a search.** It zooms over places
  already in hand. A test asserts no query fires, and that our own `easeTo`
  does not then offer "Search this area".
- **Hovering shows a name; choosing shows the card.** The hover label is a
  real `mapboxgl.Popup` at the restaurant's own coordinates. It was a
  `position: absolute` span inside the marker element and rendered visibly to
  one side — that element belongs to Mapbox, it is transformed every frame,
  and it carries `line-height: 0` and touch padding of its own, so anything
  measured against it is measured against a moving target. **No anchor is
  passed**, which is the whole edge-collision behaviour: given none, Mapbox
  picks from the space left in the container and flips the label near an
  edge. Never both for one restaurant.
- **Hovering a result reveals it even when a cluster is hiding it.**
  `findCluster`/`placeInClusters` find the place, and the map draws *one extra
  pin* at its own coordinates above the group, carrying its name — the only
  marker that does, because it is the only one that appears on top of others
  and would otherwise be an eighth anonymous dot. The zoom is never touched:
  expanding the group for real would let a mouse crossing a list rewrite the
  view the reader chose. Mapbox's `getClusterExpansionZoom`/`getClusterLeaves`
  are the API for doing it that way and are unavailable to us anyway — the
  grouping is ours precisely so a marker can stay a `<div>`.
- **A camera effect fires from an intent, never from the camera having
  moved.** `clusters` is recomputed from `zoom` and `zoom` is set on every
  `moveend`, so any effect listing it as a dependency re-runs whenever the map
  moves — including when the *reader* moves it. Both camera effects did, and
  the result was a map that could not be zoomed: tapping `+` zoomed in, the
  effect re-ran, and it dragged the view back to whatever was still selected.
  They read the grouping through a ref now and depend on `activeId` and the
  focus nonce alone. If a camera effect ever needs `clusters`, it is the wrong
  effect.
- **The location button on a row focuses; it does not open the card.**
  `fromMap` says where a choice came from, and the two ask different
  questions: tapping a pin asks "what is this", which the card answers, while
  tapping a row's button asks "where is this" — answered by the camera going
  there, and answered worse by a card sliding over the map to cover it.
- **The camera moves only when it has to.** `insideView` measures an inset
  against the visible span, so "near the edge" means the same thing at every
  zoom and a pin two pixels inside the frame still counts as missed. A place
  already comfortably on screen is emphasised where it stands and nothing
  moves — which is the common case, since the list and the map show the same
  ten results. When it does move it is a short pan at the same zoom.

## The homepage knows where you are

- **A permission already granted is resumed silently.** `useGeolocation` acts
  on `permissions.query` reporting `granted` — no dialog appears, because the
  reader already agreed. Without it, somebody who granted yesterday came back
  to a homepage with every nearby section missing, because a device fix is
  deliberately never written to disk.
- **A first-time visitor is never prompted on load.** Only an explicit standing
  grant resumes; `prompt` is left alone, and so is a browser with no Permissions
  API — guessing there would mean prompting a stranger on arrival, which is how
  a permission gets blocked at the browser level where the page cannot reach it.
- **Two states, one of them only.** `LocationPrompt` pitches ("Discover food
  near you") to somebody we cannot place; `LocationBadge` is one line with
  "Change" for somebody we can. The old page showed the same large pair of
  buttons in both cases, asking a reader something they had already answered,
  above sections already using the answer.
- **`LocationSheet` is the one way to change it**, on the homepage and on
  `/nearby`. It wraps `LocationCue` — one location control, one provider. The
  earlier "never unmount `LocationCue`" rule was about its navigate-on-fix
  effect; nothing navigates from the homepage and the request belongs to
  `DiscoveryLocationProvider`, which outlives both.

## The homepage tells one story

Search → what is popular → what *you* like → explore → contribute → earn
recognition. The order is the argument: somebody arriving has not decided
where to eat, so the broad question is answered before the narrow one.

- **Popular leads, For You follows.** They used to be the other way round,
  which asked a reader to care about their saved tastes before the page had
  shown them anything. Saved tastes shape the Popular ranking rather than
  replacing it, so the personalisation is in both.
- **Cross-section deduplication runs down the page** — Popular's restaurants,
  including its hot pick, are excluded from the taste rows beneath it. Seeing
  the loudest thing on the front door again four rows later is the repetition
  a reader notices most.
- **It is a preference, never a guarantee.** `withoutSeen` abandons filtering
  entirely when it would leave a row below `NEARBY.MIN_AFTER_DEDUPE`, because
  on a catalogue this size a thin row costs the reader a real recommendation
  to gain a cosmetic tidiness. Half-deduplicated is the worst of both.
- **A few taste rows, then "Show more tastes".** Somebody who saved eight
  things does not want eight rows on arrival — that is the page becoming an
  index instead of deciding for them — but a hard cap silently discards
  preferences they deliberately chose, so the rest is one tap away.
- **"New around you" does not exist**, and must not be approximated.
  `created_at` is the OpenStreetMap import date, not an opening date, and
  labelling imported restaurants as new is a claim the data cannot support.
  The section arrives when a trustworthy `opened_at` does; nothing assumes its
  absence, so adding it later is additive.

## Taste preferences

`TastePreferencePicker` is the one picker; the homepage card and
`/account/tastes` differ by a heading and a Skip button.

- **Never at sign-up.** Registration is three fields and stays three. This asks
  later, on a page somebody is already using — and **only once there is a
  location**, because "Coffee near you" is a promise the page cannot keep
  without one.
- **Chips, one bit each.** "I am interested in this" is the whole statement. No
  1-5 rating, no minimum enforced, and an empty save is valid — somebody who
  wants no personalisation must be able to say so. A test asserts no range,
  radio or checkbox input exists.
- **Asked once.** Answered removes the card; skipped leaves one quiet line and
  does not ask again for thirty days. A card that reappears every visit is
  nagging.
- **A guest personalises too**, in `localStorage`, and `/account/tastes` is not
  behind `ProtectedRoute`. Signing in **merges additively** and clears the local
  copy only after the server has it — a failed merge must never discard what
  somebody picked.
- **Explicit choices belong to the person.** `source` is the load-bearing
  column: an inference may fill a gap and nothing more. It cannot overwrite,
  remove, or revive a taste somebody deliberately deselected. A test holds each
  of those.
- **Personalisation reaches no model.** "Sushi near you" is
  `nearbyRestaurants(cuisine: "japanese")` — the filter that already existed,
  pointed at a taste somebody chose. Flushing-and-sushi is the same answer for
  everybody interested in sushi in Flushing, shared through the Apollo cache.
- **Two to four sections, never one per taste.** More and the page stops being
  a recommendation and becomes an index.
- **No superlatives.** "Worth trying", "popular near you" — never "best in
  NYC" or "#1". 6,783 of 6,786 restaurants have no menu; a ranking claim here
  is one the data cannot support, and a product that overclaims once is not
  believed the next time.
- **Nothing dietary is offered yet.** The schema allows a third `kind`, the
  seed does not use it: a dietary preference should probably filter rather than
  rank, and being wrong about one can hurt somebody. Same rule as
  `CORRECTABLE_FIELDS`.

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
- Target a main bundle under 250 KiB (currently 631 KiB raw; the 609 KiB
  figure predated Lucide, taste preferences and the cover-image system, which
  together cost 22 KiB).
  Mapbox is **not** in it: the map is a lazy component inside a lazy route,
  and its 1.78 MiB chunk (505 KiB gzipped) is downloaded only by somebody who
  taps Map. Check that with `grep -c mapbox dist/main.*.js` after a build —
  the answer must stay 0.
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
- **A menu being prepared looks like work, not like a missing page.**
  `MenuStatusPanel` names what is happening to the *restaurant* over an
  indeterminate bar. It used to be a two-pixel pulsing dot, on the theory that
  a spinner reads as "nothing here works" — the wrong trade for the one panel
  on the page that genuinely is working, over a wait measured in tens of
  seconds, on a catalogue where most restaurants have no menu and "this looks
  broken" is the impression worth spending pixels to prevent. **Never a
  percentage**: the server does not know how far through an extraction is, and
  a test asserts the bar carries no `aria-valuenow`. It always says the work
  continues in the background, because it does and nobody should sit guarding
  it. "Add a dish we missed" is absent while the first menu is still coming —
  over an empty page it claims we finished looking and came up short.
- **"Add a dish we missed" becomes "Help add this menu" when there is none.**
  The first wording claims we read the menu and overlooked one dish; where
  extraction found nothing that is false twice over — we have no menu, and
  this is the first entry rather than a correction. It also understates the
  ask: somebody patching a gap adds one dish.
- **"Try again" runs the restaurant query, never a retry mutation.** There is
  exactly one call site allowed to generate a menu and
  `tests/test_menus_stay_demand_driven.py` fails if a second appears, so retry
  lands on the same one and is refused by the same claim, backoff and budget
  guards however often it is pressed. It is drawn only when the server sends
  `retryable` — a restaurant out of attempts gets the sentence and no button.
- **Polling backs off and stops.** `utils/menuPolling.ts`, 3s → 8s → 20s, ended
  by every terminal state and by unmount. It cannot reach a model by
  construction; free of AI cost is not free of server.
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

## Recognition — why this restaurant, out of thirty

`RecognitionBadges`, `customConstants/recognition.ts`, `utils/recognition.ts`.
Thirty restaurants within a mile is a directory; this is what lets a card say
which ones deserve attention.

- **Two families, drawn so they can never be confused.** An outlined ink mark
  is somebody else's judgement — a guide with a name worth citing. A filled
  `brand-soft` chip is ours, from what this community has done. A badge that
  lets our ranking borrow a guide's authority is a lie about who is
  recommending the place, and it is the kind a product only gets to tell once.
  Our own marks name us in their accessible label, because a screen reader
  gets nothing from the difference between an outline and a tint.
- **Never `brand` itself.** Brand is the vote's colour; a recommendation badge
  in it trades one signal for another.
- **The exact distinction, never its family.** A Bib Gourmand is not a star and
  Michelin Selected is not one either. `RECOGNITION_LABELS` maps the award the
  server sent to words — the server never sends the words, for the same reason
  the database stores `coffee` and not `CoffeeIcon`.
- **Two on a card, hardest to earn first.** Past that the badges become the
  card and the reader is back to reading everything. The rest belong on the
  restaurant's own page.
- **No logos and no emoji.** Michelin's mark is theirs and we have not
  established that we may use it, so stars are typographic — U+2605 renders as
  text everywhere and takes the surrounding colour. A test asserts no
  `Emoji_Presentation` character and no `img` or `svg`.
- **An award with no label renders nothing**, rather than a raw slug. A signal
  invented on the server appears once it has words.
- **On the map, recognition is drawn around the glyph, never instead of it.**
  A reader telling coffee from sushi at a glance is the pin's whole job, and
  an award mark replacing that trades the thing every pin can say for
  something almost none of them can. A guide's award is a small typographic
  star in the corner; one of ours is a `brand-soft` ring around the disc.
  Neither changes the pin's size or colour. Forty pins each shouting is a map
  nobody can read — the value of a mark is entirely in how few there are.
- **The detail page shows all of them, a card shows two.** `RECOGNITION_
  DETAIL_LIMIT` against `RECOGNITION_CARD_LIMIT`: a card is a glance, and the
  page somebody chose to open is where the full list has to be readable.
- **Our own signals are earned on the server, in the trending recompute.**
  They come off the same measurement the score does, so the badge and the
  ranking cannot disagree about the same window, and they are precomputed so a
  page costs one indexed query. Must Visit needs a score well clear of the
  trending floor *and* real contributions *and* more than one contributor —
  activity, never completeness, because ranking on completeness is how the
  first run in Flushing nominated a Dunkin' Donuts. Signals are replaced
  wholesale so one can be lost; the delete filters on `kind = house`, because
  a bug in our ranking must never retract a guide's judgement.
- **"Why Must Visit?" describes only what was counted**, and says nothing when
  there is nothing real to describe. An official award never gets our words —
  the guide's reasoning is theirs.
- **An admin curates external recognitions in `/admin`, not in SQL.**
  `RecognitionQueue` is a short list with contextual actions under the queues,
  because a distinction is moderation metadata rather than a product area of
  its own — there is deliberately no awards dashboard. Saving records a row;
  it stays hidden until somebody verifies it against the source, and the form
  says so. Our own signals appear read-only: they are recomputed on every
  trending run, so a button to edit one would be undone by the next.
- **One form, two modes.** Adding and amending are the same facts about the
  same thing, so `RecognitionQueue` opens the same fields either way — a
  second form is a second place for the rules to drift, which is how a field
  ends up required when adding and optional when editing. Amending warns that
  it withdraws the verification and takes the badge off the site, because
  somebody asserted that *those* values were accurate and the person changing
  them should know before they save rather than after.
- **The wording is "Admin verified", never "Michelin verified".** A person
  checked a source and believes it is currently accurate; they are not the
  guide, and we have no relationship with the guide. A test asserts the copy
  contains neither that phrase nor "official Michelin".
- **Server refusals are shown verbatim.** No source, no reference link, a
  duplicate edition, one of our own signals typed by hand — each explains a
  rule, and rewording them turns an explanation into a failure message.
- **`internal_notes` and `status` never reach a public read.** They are
  working notes about what was ambiguous; on a card they would be our internal
  deliberation printed under somebody else's name.
- **Nothing external is populated.** The table exists with provenance columns;
  the Michelin rows are absent because no source whose terms permit reuse has
  been established, and a backend test asserts the catalogue holds none. Ask
  before building any ingestion.

## A menu photograph is an artifact, not a menu

- **The photograph is the source and stays the source.** Whatever is read out
  of it later is derived, and derived things can be wrong and be corrected
  against this. Nothing deletes the original once dishes exist.
- **Uploading publishes no dishes**, and neither does approving one. Reading a
  menu out of an image is a separate step and a separate decision — a wrong
  dish is somebody ordering something that does not exist. Tests hold both,
  and assert the service exposes no extraction at all.
- **It waits for review**, unlike a dish photo. Food goes up immediately
  because a contributor who sees nothing until tomorrow does not come back;
  this is a document that may carry a phone number or a face at the next
  table, it is not what a reader came to see, and nothing is lost by looking
  first.
- **Never square-cropped.** `process_image` fits to the short edge, which is
  right for a grid of food and destructive here — a portrait photograph of a
  menu board loses its top and bottom, which is where the menu is.
  `process_document` keeps the aspect ratio and holds it larger, because the
  point is that the words can be read. Validation, screening, storage and
  duplicate handling are the dish path's.
- **The camera control is `PhotoUploadAction`**, like every other entry point.
  It owns the hidden input, `capture` and the reset that lets the same file be
  chosen twice.
- **The page says queued, never published.** Promising it is live when it is
  waiting is a promise that breaks the next time they look.
- **No Food Cred for it.** A dish photograph is a finished contribution the
  moment it lands; this is raw material whose worth is unknown until somebody
  has looked, and paying up front is an incentive to upload anything.

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

## Editing a menu

The extracted menu is a seed, not a source of truth. It was an inference the
day it was made and goes stale the week a restaurant reprints, so the two
people who can fix it get deliberately different powers.

- **A diner adds; a diner never edits.** `AddDishAction` sits at the very end
  of the menu — after the food, before anything about the product — because it
  is for the reader who scrolled the whole thing and can see something missing.
  Rewriting a dish that is already there stays a *suggestion* through the
  correction queue; letting the same person do it directly is an edit war with
  extra steps.
- **The wording admits the gap is ours.** "Add a dish we missed". Menus here
  are read automatically and they miss things, and nobody files a bug report
  against a menu.
- **An owner edits and publishes immediately.** Making a restaurant wait for a
  moderator to approve its own corrected price would make the feature useless.
  What makes that safe is `MenuItemRevision`: every change records who made it
  and what it replaced, so a bad edit is visible and reversible afterwards
  rather than prevented in advance.
- **`source` and `verification_status` are separate.** Source is where a row
  came from and never changes; status is what has since been established. A
  dish a diner added and the owner later confirmed is still community-sourced,
  and collapsing them would erase who found it.
- **`is_available` is not a soft delete.** A restaurant forced to delete a
  seasonal dish to mark it sold out would lose its photographs and its votes
  every winter. `deleted_at` is the archive; rejection archives too, because a
  contributor asking why deserves an answer that still exists.
- **Pending dishes are shown, labelled.** Hiding one until review means the
  diner who added it watches nothing happen, and on a menu that is mostly empty
  the contribution is the point. Vandalism is answered by an owner archiving it
  in one tap, faster than any queue.
- **`DishProvenance` renders nothing for an ordinary extracted dish**, which is
  most of the catalogue. A badge on all of them is a badge on none of them. It
  speaks only for: not available, confirmed by the restaurant, added by a named
  diner, waiting to be checked — one at a time.
- **`MenuTrust` says it once**, under the restaurant's name, and says nothing
  when nothing has happened. "Menu last updated: never" draws attention to an
  absence nobody was worried about.
- **`ManageMenu` is a route, not a toggle.** A diner should never see a delete
  button and an owner should not hunt for one between the photographs. Removing
  a dish asks twice; marking one unavailable does not, because that is weekly
  and reversible. Sections reorder with buttons rather than drag — dragging
  fights the page scroll on a phone and has no keyboard equivalent.
- **Every owner method re-checks an approved claim on that specific
  restaurant.** A global owner role would let whoever held it rewrite every menu
  in the catalogue, and that bug is invisible until it is catastrophic.
- **Three correction reasons are flags, not fields.** Gone, listed twice,
  something else. Approving one takes the dish off the menu, archives it, or
  deliberately does nothing. They are awarded as *reports*: a flag has no
  previous value, so the existing branch would have read every one as
  identifying the dish. Dietary fields are still absent from the whole list.

## Menus are demand-driven, and must stay that way

**Never bulk-generate menus. Ask first, every time.** 6,783 of the 6,786
restaurants have none, and a menu costs an AI call — so a populate job is the
one thing here that turns a rounding error into a real bill with nobody
watching. This holds after the OpenAI rate limit is resolved; the limit was
never the reason.

There is exactly one way a menu comes into existence: somebody opens a
restaurant page and `aiRestaurantBySlug` generates it. One call site, and
`tests/test_menus_stay_demand_driven.py` fails if a second appears — the
guarantee is structural rather than written in the code, so a single new
caller would remove it silently.

Four things bound the damage if that guard is ever wrong:

| Guard | Value |
|---|---|
| New menus per day | `MAX_NEW_RESTAURANT_AI_GENERATIONS_PER_DAY` = 30 |
| OpenAI spend per day | `OPENAI_DAILY_BUDGET_USD` = 2.00 |
| Kill switch | `AI_ENRICHMENT_ENABLED=false`, no deploy needed |
| Per restaurant | Enrichment gate — once, ever, with backoff on failure |

At 30 a day the whole catalogue takes most of a year, which is what makes the
cap meaningful rather than decorative. A test asserts that arithmetic.

`scripts/compare_extraction_models.py` is the single script allowed to reach
the extractor, and only because it takes three restaurants by default, writes
nothing, and re-runs restaurants already extracted. A test asserts all three.

If bulk population is ever wanted, it needs a batch size, a spend ceiling and
a person who said yes — not a loop over `restaurants`.

## The catalogue is frozen, deliberately

Production holds ~6,786 restaurants — Manhattan, Flushing and part of Brooklyn
— imported from OpenStreetMap. **Do not import more without asking**, and
expect the answer to be "once menus work".

6,783 of those 6,786 have no menu. Widening the map makes the catalogue bigger
and the emptiness bigger with it, and a directory of thirty thousand
restaurants with no food in it is a worse product than six thousand with the
same problem. The import fixed discovery — nearby returned zero from anywhere
before it — and it does nothing at all for "what should I order here", which
is what the product is for.

Nothing resumes it on its own: no cron exists, the deploy command does not
touch it, and `scripts/import_restaurants.py` exits with its help text unless
a person names an area. That is the design, not an accident.

**Nothing already imported may be deleted or rewritten either.** The rows
carry `osm_id`, so a re-run updates rather than duplicates, and `fill_blanks`
only ever writes where a column is empty.

## Trending, and the word it will not use

`RestaurantTrendingService` and `TrendingRestaurants`, above the dish strip —
somebody who has not decided where to eat cannot use a row of dishes yet.

- **The server decides what the section is called.** "Enough activity to call
  this trending" is a rule about the data; a copy in the browser is a second
  source of truth and the one that goes stale. Below the threshold it says
  Discover and ranks on what we hold.
- **Every signal already existed.** Views, votes, orders, favourites, community
  photographs — all with timestamps and a restaurant behind them. A ranking
  needing fresh instrumentation reports nothing for a month. `UserSearch` is
  excluded: it stores a typed string with no restaurant attached.
- **Recency in three bands, not a decay curve.** A half-life needs a constant
  nobody can defend; 7/14/30 is legible in the SQL and arguable in a sentence.
- **A hot pick must have earned it.** With no activity the ranking degenerates
  to nearest, and the first run in Flushing nominated a Dunkin' Donuts 400
  metres away as the standout place to eat. It is absent unless something has
  real activity or a photograph — the loudest element on the page is where an
  unearned claim does the most damage.
- **It rotates on the day, never on refresh.** A different answer every reload
  makes a recommendation feel arbitrary.
- **The hero is the food**, with the restaurant as its caption. That is the
  difference between "what should I eat" and "what restaurants are near me".
- **Restaurant photos have their own weight.** Reusing the dish strip's
  `TRENDING_WEIGHT_PHOTO` was a real bug: at 2.0, three page views outscored
  somebody photographing their dinner.

## Where somebody wants recommendations from

`DiscoveryAreaService`, for signed-in people. Guests keep theirs in
`localStorage` and always have.

- **An area, not a location history.** One row, overwritten, never appended to.
  A preference somebody keeps for months, not a record of everywhere they have
  been — building the second while needing the first is how a food app ends up
  holding a movement log.
- **A device fix is refused outright.** Precise enough to be a home address,
  stale within the hour, one tap to ask again.
- **Stored coordinates are rounded to three decimals** — about 110 metres.
  Enough to centre a search, not enough to name a building.

## Writing to us

`ContactPage` and `app/api/sendgrid.py`. The footer used to offer a `mailto:`,
which opens nothing on a phone with no mail client and loses the message
entirely on a shared computer.

- **The HTML template is in the repository, not a SendGrid dynamic template.**
  One in their dashboard is production behaviour with no version history and no
  way to tell which revision sent a message somebody is asking about.
- **Table markup and inline styles.** Outlook strips a `<style>` block and
  renders a `div` layout as a stack of full-width blocks. Clean typography
  inside markup from 1999 is what "modern" means in email.
- **Two messages.** The enquiry, with reply-to set to the sender; and a receipt
  quoting what they wrote, because a form with no acknowledgement is
  indistinguishable from a broken one. A failed receipt does not fail the
  enquiry, which is already away.
- **Newlines are stripped from the name and subject and kept in the message.**
  A newline in a header appends one of the sender's choosing to mail going out
  with our domain's reputation behind it.
- **Nothing is stored.** Correspondence belongs in a mailbox somebody answers,
  not in a table of unsolicited personal information nobody owns.
- **Five an hour**, the tightest limit here: the only unauthenticated path that
  sends mail from our domain.
- **No key is a supported state.** `contactAvailable` lets the page offer an
  address rather than a form that fails on submit.

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

## Membership is prepared, not shipped

`MEMBERSHIP_PLANS` is empty and everything that draws it is built. Add an
entry and the plans section appears; leave it empty and nothing renders.

**Nothing can be bought.** No provider, no checkout, no price anywhere. A plan
card with a price and no working button is a worse version of the dead
sign-in button — that one only fails to open a door, this one makes a claim
about a commercial relationship that does not exist. A plan whose `href` is
missing renders without a button rather than with a dead one, so a
half-configured plan cannot ship a control that goes nowhere.

**Two things a plan must never include**, both load-bearing and both tested:

- *Food Cred, badges, leaderboard position.* Reputation is earned by
  photographing food and being useful. A leaderboard somebody can pay to enter
  is not a leaderboard, and the ranking is the product. The award rules have
  no idea membership exists, and a test asserts the word does not appear in
  them.
- *Anything a role decides.* Moderation, claim decisions, photo removal.
  Membership is what somebody paid for; a role is what they may do to other
  people's work. Separate columns, separate concepts, and `MEMBERSHIP_LABELS.
  notForSale` says so on the page rather than only here.

**`membershipOf()` in `utils/entitlement.ts` is the only way to ask.** A gate
written as `user.membership_tier === "x"` in a component is how a tier rename
becomes a fortnight of grep. The server owns the value and already reports a
lapsed membership as absent, so nothing in the browser handles dates.

## The cost page

`ApiUsagePanel`, last in the admin console because it is the only section that
is not a queue — nothing there is waiting on a decision.

**The hit rate is the headline, not the spend.** The bill is a symptom; the
proportion of searches answered from our own rows is what decides it, and it
should climb on its own as the catalogue fills. A rate that stops moving means
the local matcher is missing restaurants we already have — a bug that shows up
here long before it shows up on an invoice.

**A quiet day is not a zero per cent hit rate.** With no searches the figure is
absent, because "0%" would read as total failure of the thing that is working.

## The search box does not search per keystroke

`MainSearchBar` plus `useRestaurantSuggestions`. Every keystroke cancels the
pending lookup, so typing a name straight through is **one** request, not one
per character — and below `AUTOCOMPLETE.MIN_CHARS` there is no request at all,
because two letters return noise and, past our own database, still bill.

- **300ms, not 2000.** A two-second wait means the suggestions arrive after
  somebody has typed the whole name — too late to save them anything, so they
  press Search, and that is the Text Search path at roughly six times the cost
  of a Place Details call. A long debounce optimises the cheap path by pushing
  people onto the expensive one.
- **One session token per search, burned on selection.** It is what makes the
  predictions free and leaves only the details call billed. Reusing a spent
  one, or minting a fresh one per request, is the same as having none.
- **A query that found nothing short-circuits its own extensions**, and answers
  are cached for the session so backspacing costs nothing.
- **A superseded request is aborted, not merely ignored.** Discarding the
  answer stops it corrupting the list; aborting stops the work being done,
  which is what the bill is for.
- **Rows we already hold are marked and come first.** That is the most useful
  thing a row can say and also the free one — choosing it makes no external
  call at all.
- **The option's accessible name is set explicitly.** Highlighting the matched
  fragment splits the name across elements, which made a screen reader
  announce "Luc ali".
- **Submitting is the only path that may reach the model**, and only when
  nothing matched anywhere.

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
`customConstants/map.ts` is the only other file that names the provider.

**Mapbox GL, replacing Leaflet.** The earlier note here argued for Leaflet
because OpenStreetMap tiles need no key and Mapbox meters; that call was
overridden deliberately. What it got right was the seam — the page passes
places and receives bounds, so the swap was one component, its markers file
and a token.

- **It draws our data and never fetches any.** Every pin came out of our own
  PostgreSQL rows via `nearbyRestaurants` and `restaurantsInArea`. Panning,
  zooming and selecting a pin reach no network at all, and neither Google nor
  OpenAI is reachable from this screen. A metered map that only renders is
  billed per load; one wired to a moving viewport is billed per drag, and that
  distinction is the whole cost argument for this page.
- **`REACT_APP_MAPBOX_TOKEN` is a *public* token (`pk.`)** and is meant to ship
  in the bundle — every web map exposes one. It is protected by a URL
  restriction set on the token in the Mapbox account, not by hiding it. A
  secret token (`sk.`) must never go here. **Unset, the app offers no map at
  all** rather than a Map button opening a grey rectangle: the list is the half
  that always works, so losing the map costs a reader nothing.
- **It is lazy, inside a lazy route** — and much more so than before. Mapbox is
  a 1.78 MiB chunk (505 KiB gzipped) against Leaflet's 164 KiB. That is
  affordable only because it is downloaded by somebody who tapped Map, and it
  is the price of the swap.
- **The list is never replaced by the map.** No keyboard reaches a pin and no
  screen reader reads a tile layer, so the same places in the same order stay
  underneath it. Markers are `aria-hidden`: announcing forty of them would put
  forty stops in front of the readable half.
- **The instance is created once, behind a ref.** Rebuilding it on render loses
  the reader's pan and zoom, which is the whole interaction. Markers are
  repainted rather than replaced when the selection changes — rebuilding them
  destroys the one being tapped.
- **"Search this area" appears only after the map has moved far enough.** Any
  twitch is not enough; `MAP_MOVEMENT` measures the pan against the span
  currently on screen so the threshold means the same thing at every zoom.
  Offered sooner, it invites a tap that re-runs results still being read.
  Programmatic camera moves are excluded by checking `originalEvent` — our own
  recentre must not look like the reader going somewhere.
- **`markers.ts` is the seam for richer pins.** Dish thumbnails, a trending
  mark, a verified tick and a rank all belong in that file, and the map learns
  about none of them. It builds DOM markers rather than a clustered GeoJSON
  layer precisely because of that list: clustering wants Mapbox expressions and
  sprite images, where a per-restaurant photograph is painful, and a photo in a
  `<div>` is an `<img>`. That trade holds only while the server caps a map
  query at `NEARBY.MAP_LIMIT` — forty pins cannot smear. Raise the cap and this
  has to be revisited rather than stretched.
- **`cooperativeGestures` is on.** One finger scrolls the page, two move the
  map. The map sits inside a scrolling page, and without it a thumb landing on
  the map captures the drag and the page looks frozen.
- **The preview is a card, not a modal.** `RestaurantPreview` rises from the
  bottom edge on a phone and sits lower-left from `sm` up, with no backdrop and
  no scroll lock — the reader is mid-comparison, and a dialog that must be
  dismissed before the next pin turns browsing into a sequence of decisions.
  Everything it shows arrived with the pin, so selecting one costs no request.
- **The "you are here" dot is drawn only for a measured fix.** A typed place is
  an area; a dot in the middle of Flushing claims a precision nobody gave us.
- **jsdom has no WebGL**, so `src/test/mapboxMock.ts` stands in — a recorder,
  not a pretend map. What it makes testable is the part worth testing: that
  dragging fires no query, that the bounds handed up are the ones on screen,
  and that our own camera moves do not offer "search this area".

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
