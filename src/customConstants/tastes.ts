/**
 * Taste preferences: what somebody is into, so the front door can be about
 * their food.
 *
 * **No category list here.** The server owns which tastes exist, in what order
 * and under which heading — a copy in the browser is a second source of truth
 * and the one that goes stale the day somebody adds "Poke". What this file
 * holds is the behaviour around the list: where a guest's choices are kept,
 * how often we are allowed to ask, and how many sections a personalised
 * homepage may show.
 *
 * The same rule `customConstants/reputation.ts` follows for point values, for
 * the same reason.
 */

/**
 * How a category is grouped in the picker.
 *
 * Mirrors the server's `kind`, and is used only to caption the groups. An
 * unrecognised kind still renders — under its own heading — rather than
 * vanishing, because the server is allowed to invent one.
 */
export const TASTE_KIND = {
  food: "food",
  cuisine: "cuisine",
  /** Reserved. Nothing dietary is offered yet and the semantics differ. */
  dietary: "dietary",
} as const;

export type TasteKind = (typeof TASTE_KIND)[keyof typeof TASTE_KIND];

/**
 * A guest's choices, in the browser.
 *
 * Somebody must be able to personalise before they have an account — the whole
 * point is that this is not a sign-up questionnaire — and `localStorage` is
 * where this product has always kept a guest's discovery state. On sign-in
 * these merge into the account additively, so nothing chosen is lost and
 * nothing already there is overwritten.
 */
export const TASTE_STORAGE_KEY = "wdf.tastes";

/**
 * Whether somebody has answered, declined, or has not been asked.
 *
 * Tracked so the homepage can behave differently for each. Saved preferences
 * remove the card entirely; a dismissal quiets it for a while and leaves a
 * one-line invitation; never having been asked shows the card once there is a
 * location to make it useful.
 */
export const TASTE_PROMPT = {
  unanswered: "unanswered",
  saved: "saved",
  dismissed: "dismissed",
} as const;

export type TastePromptState =
  (typeof TASTE_PROMPT)[keyof typeof TASTE_PROMPT];

export const TASTE_PROMPT_STORAGE_KEY = "wdf.tastes.prompt";

export const TASTE_PICKER = {
  /**
   * Encouraged, never enforced.
   *
   * "Pick at least 3 for better recommendations" is advice; blocking Save
   * under it turns a two-second choice into a form with a validation error,
   * which is the questionnaire this feature exists not to be. Somebody who
   * wants one taste gets one taste.
   */
  SUGGESTED: 3,
  /**
   * How long a dismissal is respected before the quiet invitation returns.
   *
   * Thirty days, and it is a *quiet* return: the full picker never reappears
   * on its own. Somebody who said no should not be asked again next Tuesday,
   * and somebody who said no in March may well have changed their mind by
   * April — but they get one line, not a card.
   */
  RESURFACE_AFTER_DAYS: 30,
} as const;

/**
 * How many personalised sections the homepage may show at once.
 *
 * Somebody who picked eight tastes does not want eight strips; the page stops
 * being a recommendation and becomes an index. Two to four is enough to feel
 * like the page knows them and few enough to still be scannable in a dim room
 * on a phone.
 */
export const TASTE_SECTIONS = {
  MIN: 2,
  MAX: 4,
} as const;

/**
 * The shortcut row under the search box.
 *
 * Four, because a fifth wraps at 390px and a row that wraps stops reading as
 * a row. "More" carries the rest, so nothing is unreachable — which is what
 * lets the visible four be personalised without trapping anybody inside their
 * own preferences.
 */
export const QUICK_DISCOVERY = {
  SHOWN: 4,
} as const;
