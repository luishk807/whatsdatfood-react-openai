import { type FC, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuggestionsComponent from "@/components/Suggestions";
import useRestaurantSuggestions from "@/customHooks/useRestaurantSuggestions";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { AUTOCOMPLETE } from "@/customConstants/search";
import { SEARCH_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import { RestaurantSuggestionType } from "@/interfaces/search";

/**
 * The way in for somebody who knows the name.
 *
 * **It does not search per keystroke.** Every keystroke cancels the pending
 * lookup and starts a new timer, so typing a name straight through is one
 * request rather than one per character — and nothing is looked up at all
 * below `MIN_CHARS`, because two letters return noise and, past our own
 * database, still bill.
 *
 * **Our own restaurants first, Google only for the gap.** A restaurant this
 * product already holds has a menu, photographs and votes behind it, which is
 * the entire point, and finding it costs nothing. The external index is for
 * the restaurant nobody has looked up yet — the case that produced "Nothing
 * found for that name" to somebody who had typed the full name correctly.
 *
 * **Submitting is the deliberate act**, so it is the only path allowed to
 * reach the model. A single unambiguous suggestion goes straight there
 * instead.
 */
const MainSearchBar: FC = () => {
  const navigate = useNavigate();
  const { getRestaurantListByName } = useRestaurantMutation();
  const { location } = useDiscoveryLocation();
  const {
    suggestions,
    loading,
    searched,
    error,
    search,
    choosePlace,
    burnToken,
    clear,
  } = useRestaurantSuggestions();

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [generating, setGenerating] = useState(false);

  /**
   * Held in a ref, not a dependency.
   *
   * useRestaurantMutation returns a new function identity on every render, so
   * depending on it made the effect below re-run every render, which set
   * state, which re-rendered — an unbroken loop of requests for as long as the
   * box had anything in it.
   */
  const lookupRef = useRef(getRestaurantListByName);
  lookupRef.current = getRestaurantListByName;

  const pointRef = useRef(location);
  pointRef.current = location;

  useEffect(() => {
    const query = value.trim();

    if (query.length < AUTOCOMPLETE.MIN_CHARS) {
      clear();
      setOpen(false);
      return;
    }

    setOpen(true);

    // The cancel is the whole mechanism: a keystroke inside the window throws
    // the pending lookup away before it is made.
    const timeout = setTimeout(
      () => search(query, pointRef.current),
      AUTOCOMPLETE.DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
    // Only the typed value. `search` and `clear` are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const goToSlug = (slug: string) => {
    setOpen(false);
    burnToken();
    navigate(buildMenuResultsPath(slug));
  };

  const select = async (suggestion: RestaurantSuggestionType) => {
    // Already ours: no call, no cost, straight to the menu.
    if (suggestion.slug) {
      goToSlug(suggestion.slug);
      return;
    }

    if (!suggestion.place_id) {
      return;
    }

    // The one billed call in the session, and only ever on a deliberate tap.
    setResolving(true);

    try {
      const slug = await choosePlace(suggestion.place_id);

      if (slug) {
        goToSlug(slug);
      }
    } finally {
      setResolving(false);
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (suggestions.length === 1) {
      await select(suggestions[0]);
      return;
    }

    if (suggestions.length > 1) {
      setOpen(true);
      return;
    }

    // Nothing matched anywhere. Only now is the model asked, and only because
    // somebody pressed the button.
    setGenerating(true);

    try {
      const results = await lookupRef.current(value.trim(), true);

      if (Array.isArray(results) && results.length === 1 && results[0]?.slug) {
        goToSlug(results[0].slug);
        return;
      }
    } finally {
      setGenerating(false);
    }

    setOpen(true);
  };

  const busy = loading || resolving || generating;

  return (
    <form onSubmit={handleSubmit} className="relative w-full" role="search">
      <div className="flex items-center gap-2 rounded-pill border border-line bg-surface-raised px-4 py-2 shadow-tile focus-within:border-brand">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-ink-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>

        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={SEARCH_LABELS.placeholder}
          aria-label={SEARCH_LABELS.placeholder}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
        />

        <button
          type="submit"
          aria-label={SEARCH_LABELS.submit}
          disabled={!value.trim() || busy}
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? SEARCH_LABELS.searching : SEARCH_LABELS.submit}
        </button>
      </div>

      <SuggestionsComponent
        suggestions={suggestions}
        query={value}
        show={open}
        searching={loading}
        searched={searched}
        error={error}
        resolving={resolving}
        onSelect={select}
        onClose={() => setOpen(false)}
      />
    </form>
  );
};

export default MainSearchBar;
