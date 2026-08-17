import { useRef, useEffect } from "react";
import clsx from "clsx";
import { fullAddress } from "@/utils/venue";
import { splitOnMatch } from "@/utils/search";
import { SearchSuggestionsInterface } from "@/interfaces/search";
import { SEARCH_LABELS } from "@/customConstants/labels";
import { RestaurantType } from "@/interfaces/restaurants";

/** The address, short enough to survive a phone: street, city, state. */
const secondaryLine = (restaurant: RestaurantType): string =>
  [restaurant.address, restaurant.city, restaurant.state]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" · ") || fullAddress(restaurant) || "";

const SuggestionsComponent = ({
  suggestions,
  query,
  show,
  searching,
  searched,
  onSelect,
  onClose,
}: SearchSuggestionsInterface) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!show) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-card border border-line bg-surface-raised shadow-tile"
    >
      {/* Only when there is nothing to show yet. Replacing a list that is
          already on screen makes it blink out and back on every keystroke. */}
      {searching && suggestions.length === 0 && (
        <p className="px-4 py-3 text-sm text-ink-muted">
          {SEARCH_LABELS.searching}
        </p>
      )}

      {!searching && searched && suggestions.length === 0 && (
        <p className="px-4 py-3 text-sm text-ink-muted">
          {SEARCH_LABELS.nothingFound}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-busy={searching}
          className={clsx(
            "max-h-72 overflow-y-auto transition-opacity motion-reduce:transition-none",
            // Stale results stay put and fade slightly while the next lookup
            // runs, rather than disappearing.
            searching && "opacity-60",
          )}
        >
          {suggestions.map((restaurant) => (
            <li
              key={restaurant.slug ?? restaurant.name}
              className="border-b border-line last:border-b-0"
            >
              {/* One tap goes straight through. Selecting a restaurant and
                  then having to press a second button was a step that existed
                  only because the input needed filling in. */}
              {/* The whole row is the target, and it is 64px tall: this is
                  tapped with a thumb, in a restaurant, one-handed. */}
              <button
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => onSelect(restaurant)}
                className="flex min-h-16 w-full flex-col justify-center gap-0.5 px-4 py-3 text-left hover:bg-surface-sunken"
              >
                <span className="truncate text-[15px] leading-snug text-ink">
                  {splitOnMatch(restaurant.name, query).map((segment, index) =>
                    segment.match ? (
                      // Marked, not shouted: bolding the matched fragment
                      // hard makes the rest of the name look secondary.
                      <span key={index} className="font-semibold">
                        {segment.text}
                      </span>
                    ) : (
                      <span key={index}>{segment.text}</span>
                    ),
                  )}
                </span>

                {secondaryLine(restaurant) && (
                  <span className="truncate text-xs text-ink-muted">
                    {secondaryLine(restaurant)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuggestionsComponent;
