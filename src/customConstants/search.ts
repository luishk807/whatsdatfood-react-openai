/**
 * Restaurant autocomplete.
 *
 * Every number here is a spend decision as much as a UX one, because past our
 * own database each lookup is a billed request. Kept in step with
 * `app/constants.py`, which is what actually enforces them.
 */
export const AUTOCOMPLETE = {
  /**
   * Nothing is looked up below this. "R" and "Ru" return noise and still
   * bill; this alone removes roughly two of every five requests a naive
   * implementation would make.
   */
  MIN_CHARS: 3,

  /**
   * How long a pause counts as "stopped typing".
   *
   * Every keystroke cancels the pending request, so typing a name straight
   * through is one request rather than one per character.
   *
   * 300ms. Long enough that a name typed straight through is one request,
   * short enough that the list feels attached to the keyboard.
   *
   * Not 2000, which was considered: a two-second wait means the suggestions
   * arrive after somebody has typed the whole name — too late to save them
   * anything, so they press Search instead, and that is the Text Search path
   * at roughly six times the cost of a Place Details call. A long debounce
   * optimises the cheap path by pushing people onto the expensive one.
   */
  DEBOUNCE_MS: 300,

  FAILED: "Search is unavailable for a moment. Try again shortly.",
} as const;
