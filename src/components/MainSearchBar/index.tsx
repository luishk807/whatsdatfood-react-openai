import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuggestionsComponent from "@/components/Suggestions";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
import { RestaurantType } from "@/interfaces/restaurants";
import { SEARCH_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";

/** Long enough not to fire per keystroke, short enough to feel live. It was
 *  1000ms, which reads as broken on a phone. */
const DEBOUNCE_MS = 300;

const MainSearchBar: FC = () => {
  const navigate = useNavigate();
  const { getRestaurantListByName } = useRestaurantMutation();

  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<RestaurantType[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);

  // Only the most recent lookup may write state; a slow one that resolves
  // after a newer one would otherwise overwrite it with stale results.
  const requestId = useRef(0);

  /**
   * Held in a ref, not a dependency.
   *
   * useRestaurantMutation returns a new function identity on every render, so
   * depending on it made runSearch change every render, which re-ran the
   * effect, which set state, which re-rendered - an unbroken loop of requests
   * against the backend for as long as the box had anything in it.
   */
  const lookupRef = useRef(getRestaurantListByName);
  lookupRef.current = getRestaurantListByName;

  const runSearch = useCallback(
    async (term: string, generate = false) => {
      const trimmed = term.trim();

      if (!trimmed) {
        setSuggestions([]);
        setSearched(false);
        return [];
      }

      const id = ++requestId.current;
      setSearching(true);
      setOpen(true);

      try {
        const response = await lookupRef.current(trimmed, generate);
        const results = Array.isArray(response) ? response : [];

        if (id === requestId.current) {
          setSuggestions(results);
          setSearched(true);
        }

        return results;
      } catch {
        if (id === requestId.current) {
          setSuggestions([]);
          setSearched(true);
        }

        return [];
      } finally {
        if (id === requestId.current) {
          setSearching(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setSearched(false);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(() => runSearch(value), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // Only the typed value. runSearch is stable by construction above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const goTo = (restaurant: RestaurantType) => {
    if (!restaurant.slug) {
      return;
    }

    setOpen(false);
    navigate(buildMenuResultsPath(restaurant.slug));
  };

  /**
   * Submitting used to return early unless a suggestion had been clicked, so
   * typing a restaurant name and pressing the button did nothing at all - no
   * navigation, no message. Now it searches, and goes straight there when the
   * answer is unambiguous.
   */
  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    // Submitting is the deliberate act, so this one may reach the model.
    const results = suggestions.length
      ? suggestions
      : await runSearch(value, true);

    if (results.length === 1) {
      goTo(results[0]);
      return;
    }

    setOpen(true);
  };

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
          disabled={!value.trim() || searching}
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {searching ? SEARCH_LABELS.searching : SEARCH_LABELS.submit}
        </button>
      </div>

      <SuggestionsComponent
        suggestions={suggestions}
        query={value}
        show={open}
        searching={searching}
        searched={searched}
        onSelect={goTo}
        onClose={() => setOpen(false)}
      />
    </form>
  );
};

export default MainSearchBar;
