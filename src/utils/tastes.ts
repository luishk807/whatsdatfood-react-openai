import {
  TASTE_PICKER,
  TASTE_PROMPT,
  TASTE_PROMPT_STORAGE_KEY,
  TASTE_STORAGE_KEY,
  TastePromptState,
} from "@/customConstants/tastes";
import {
  TasteCategoryType,
  TasteGroupType,
  TastePreferenceType,
} from "@/interfaces/tastes";

/**
 * A guest's tastes, and when to stop asking about them.
 *
 * Pure functions over `localStorage` and over a category list, kept out of the
 * hook so the parts worth testing can be tested without a component. Every
 * read is defensive: private mode, a full quota and a hostile extension are
 * all real, and none of them is worth a broken homepage.
 */

export const readStoredTastes = (): string[] => {
  try {
    const raw = window.localStorage.getItem(TASTE_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    // Anything malformed is "no preferences" rather than trusted into a
    // filter that then returns nothing and looks like an empty catalogue.
    return Array.isArray(parsed)
      ? parsed.filter((one): one is string => typeof one === "string")
      : [];
  } catch {
    return [];
  }
};

export const writeStoredTastes = (slugs: string[]): void => {
  try {
    window.localStorage.setItem(TASTE_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Remembering is a convenience; failing to remember is not an error worth
    // showing anybody.
  }
};

/**
 * Forget a guest's copy once it has been merged into an account.
 *
 * Left behind, it would merge again on the next sign-in — harmless, because
 * merging is idempotent, but it would also quietly resurrect a taste the
 * person had since removed from their account.
 */
export const clearStoredTastes = (): void => {
  try {
    window.localStorage.removeItem(TASTE_STORAGE_KEY);
  } catch {
    // As above.
  }
};

/** `{ state, at }` — the second is only meaningful for a dismissal. */
interface StoredPrompt {
  state: TastePromptState;
  at: number;
}

export const readPromptState = (): StoredPrompt => {
  try {
    const raw = window.localStorage.getItem(TASTE_PROMPT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredPrompt>) : null;

    if (
      parsed &&
      typeof parsed.state === "string" &&
      Object.values(TASTE_PROMPT).includes(parsed.state as TastePromptState)
    ) {
      return {
        state: parsed.state as TastePromptState,
        at: typeof parsed.at === "number" ? parsed.at : 0,
      };
    }
  } catch {
    // As above.
  }

  return { state: TASTE_PROMPT.unanswered, at: 0 };
};

export const writePromptState = (
  state: TastePromptState,
  at: number = Date.now(),
): void => {
  try {
    window.localStorage.setItem(
      TASTE_PROMPT_STORAGE_KEY,
      JSON.stringify({ state, at }),
    );
  } catch {
    // As above.
  }
};

/**
 * Whether to put the full picker in front of somebody.
 *
 * Three states, three answers, and the restraint is the design:
 *
 *   saved        never — the question has been answered
 *   dismissed    never on its own; a one-line invitation returns after a month
 *   unanswered   yes, but only once there is a location to make it useful
 *
 * A card that reappears on every visit is nagging, and nagging is how an
 * optional feature makes an application feel like a form.
 */
export const shouldOfferPicker = (
  prompt: StoredPrompt,
  hasLocation: boolean,
  hasPreferences: boolean,
  now: number = Date.now(),
): boolean => {
  if (hasPreferences || prompt.state === TASTE_PROMPT.saved) {
    return false;
  }

  // Asked before there is anywhere to apply it, "Coffee near you" is a promise
  // the page cannot keep. The location is what makes the question worth
  // answering, so it is what unlocks it.
  if (!hasLocation) {
    return false;
  }

  return prompt.state !== TASTE_PROMPT.dismissed || _expired(prompt, now);
};

/**
 * Whether to show the quiet one-line invitation instead.
 *
 * For somebody who dismissed the card and has not come back to it, and for
 * anybody who simply has no preferences yet. Never both this and the card.
 */
export const shouldOfferReminder = (
  prompt: StoredPrompt,
  hasLocation: boolean,
  hasPreferences: boolean,
  now: number = Date.now(),
): boolean =>
  hasLocation &&
  !hasPreferences &&
  !shouldOfferPicker(prompt, hasLocation, hasPreferences, now);

const _expired = (prompt: StoredPrompt, now: number): boolean =>
  now - prompt.at >= TASTE_PICKER.RESURFACE_AFTER_DAYS * 24 * 60 * 60 * 1000;

/**
 * Categories grouped for display, in the server's order.
 *
 * The server decides what exists and in what sequence; this only collects
 * them under their `kind`. A kind the browser has never heard of gets its own
 * group rather than disappearing — the server is allowed to invent one, and a
 * category that silently fails to render is worse than an unstyled heading.
 */
export const groupCategories = (
  categories: TasteCategoryType[],
): TasteGroupType[] => {
  const groups: TasteGroupType[] = [];

  [...categories]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .forEach((category) => {
      const existing = groups.find((group) => group.kind === category.kind);

      if (existing) {
        existing.categories.push(category);
        return;
      }

      groups.push({ kind: category.kind, categories: [category] });
    });

  return groups;
};

/**
 * The tastes to build homepage sections from, best first.
 *
 * Explicit choices lead: somebody who said they like coffee gets coffee before
 * anything we merely inferred about them. Capped by the caller — a homepage
 * with eight strips is an index rather than a recommendation.
 */
export const orderedTastes = (
  preferences: TastePreferenceType[],
): TastePreferenceType[] => [
  ...preferences.filter((one) => one.source === "explicit"),
  ...preferences.filter((one) => one.source !== "explicit"),
];
