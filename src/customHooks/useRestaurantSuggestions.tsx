import { useCallback, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  RESOLVE_PLACE,
  RESTAURANT_SUGGESTIONS,
} from "@/graphql/queries/discovery";
import { AUTOCOMPLETE } from "@/customConstants/search";
import { RestaurantSuggestionType } from "@/interfaces/search";
import { _get } from "@/utils";

/**
 * Type-ahead over our own restaurants, then Google Places.
 *
 * Every request past our own database costs money, so this hook is mostly
 * about *not* making them:
 *
 * - **Nothing under `MIN_CHARS`.** "R" and "Ru" return noise and still bill.
 * - **One session token per search.** It groups a run of predictions and the
 *   final selection into one billed session — without it each prediction is
 *   charged separately, about three times the cost for the same answer. It is
 *   burned the moment a suggestion is chosen; reusing one is the same as not
 *   having one.
 * - **A query that found nothing short-circuits its own extensions.** If
 *   "Russ and Daughtx" returned nothing, "Russ and Daughtxy" will too, and
 *   asking is paying to be told so again.
 * - **Answers are remembered for the session.** Backspacing re-issues a query
 *   that was just made; a cache turns that into nothing.
 *
 * The debounce lives in the component, because it belongs to the input.
 */
const useRestaurantSuggestions = () => {
  const client = useApolloClient();
  const [suggestions, setSuggestions] = useState<RestaurantSuggestionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useRef<string | null>(null);
  const cache = useRef<Map<string, RestaurantSuggestionType[]>>(new Map());
  const empty = useRef<string[]>([]);
  // Answers can arrive out of order; only the newest query may write.
  const latest = useRef(0);

  const sessionToken = useCallback(() => {
    if (!token.current) {
      token.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
    }

    return token.current;
  }, []);

  /** After a selection. The next search is a new billable session. */
  const burnToken = useCallback(() => {
    token.current = null;
  }, []);

  const search = useCallback(
    async (
      raw: string,
      point?: { latitude: number; longitude: number } | null,
    ) => {
      const query = raw.trim();

      if (query.length < AUTOCOMPLETE.MIN_CHARS) {
        setSuggestions([]);
        setSearched(false);
        return;
      }

      const cached = cache.current.get(query.toLowerCase());

      if (cached) {
        setSuggestions(cached);
        setSearched(true);
        return;
      }

      // Anything that extends a query which came back empty is empty too.
      if (
        empty.current.some((barren) => query.toLowerCase().startsWith(barren))
      ) {
        setSuggestions([]);
        setSearched(true);
        return;
      }

      const ticket = ++latest.current;
      setLoading(true);
      setError(null);

      try {
        const response = await client.query({
          query: RESTAURANT_SUGGESTIONS,
          variables: {
            query,
            sessionToken: sessionToken(),
            latitude: point?.latitude,
            longitude: point?.longitude,
          },
          fetchPolicy: "no-cache",
        });

        if (ticket !== latest.current) {
          return;
        }

        const found =
          _get<RestaurantSuggestionType[]>(
            response,
            "data.restaurantSuggestions",
            [],
          ) ?? [];

        cache.current.set(query.toLowerCase(), found);

        if (!found.length) {
          empty.current = [...empty.current, query.toLowerCase()];
        }

        setSuggestions(found);
        setSearched(true);
      } catch (caught) {
        if (ticket !== latest.current) {
          return;
        }

        // A refusal is not an absence. Reporting "nothing found" when the
        // server said "too many lookups" sends somebody hunting for a
        // restaurant that is sitting right there.
        setError(
          caught instanceof Error && caught.message
            ? caught.message
            : AUTOCOMPLETE.FAILED,
        );
        setSuggestions([]);
      } finally {
        if (ticket === latest.current) {
          setLoading(false);
        }
      }
    },
    [client, sessionToken],
  );

  /**
   * Turn a chosen Places suggestion into a restaurant we hold, and hand back
   * its slug. This is the one billed call in the session.
   */
  const choosePlace = useCallback(
    async (placeId: string): Promise<string | null> => {
      const token = sessionToken();

      try {
        const response = await client.mutate({
          mutation: RESOLVE_PLACE,
          variables: { placeId, sessionToken: token },
        });

        return _get<string | null>(response, "data.resolvePlace.slug", null);
      } catch {
        return null;
      } finally {
        // Burned whether or not it worked: a token that has been spent on a
        // details call cannot be reused, and one that failed is not worth the
        // risk of being billed twice under it.
        burnToken();
      }
    },
    [burnToken, client, sessionToken],
  );

  const clear = useCallback(() => {
    setSuggestions([]);
    setSearched(false);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    searched,
    error,
    search,
    choosePlace,
    burnToken,
    clear,
  };
};

export default useRestaurantSuggestions;
