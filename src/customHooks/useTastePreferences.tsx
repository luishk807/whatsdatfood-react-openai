import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  MERGE_TASTE_PREFERENCES,
  MY_TASTE_PREFERENCES,
  SAVE_TASTE_PREFERENCES,
  TASTE_CATEGORIES,
} from "@/graphql/queries/tastes";
import { TASTE_PROMPT } from "@/customConstants/tastes";
import useAuth from "@/customHooks/useAuth";
import {
  TasteCategoryType,
  TastePreferenceType,
} from "@/interfaces/tastes";
import {
  clearStoredTastes,
  readStoredTastes,
  writePromptState,
  writeStoredTastes,
} from "@/utils/tastes";
import { _get } from "@/utils";

/**
 * What somebody is into, whether or not they have an account.
 *
 * **One hook for both, deliberately.** A guest keeps their choices in
 * `localStorage` — the same place this product has always kept a guest's
 * discovery state — and a signed-in person keeps them in the database. Every
 * consumer asks the same question and gets the same shape back, so no
 * component has to know which kind of reader it is serving. Two hooks would
 * mean every caller branching, and one of them forgetting to.
 *
 * **Signing in merges rather than replaces.** Choices made before an account
 * existed were made by the same person, so they join whatever the account
 * already holds. It runs once per sign-in and the server's merge is
 * idempotent, so a double render costs nothing — but the local copy is cleared
 * afterwards, because leaving it would resurrect a taste on the next sign-in
 * that the person had since removed from their account.
 *
 * **Nothing here is billed.** Categories are one indexed read of seventeen
 * rows, cache-first; preferences are one more. A taste is a filter over
 * discovery data we already hold, which is what makes personalisation free per
 * visitor rather than billed per visitor.
 */
const useTastePreferences = () => {
  const { user } = useAuth();
  const signedIn = Boolean(user);

  const { data: categoryData, loading: categoriesLoading } = useQuery(
    TASTE_CATEGORIES,
    // The list changes when somebody adds a row to a seed table. Asking the
    // network again on every visit is a request whose answer cannot have
    // changed since this morning.
    { fetchPolicy: "cache-first" },
  );

  const { data: mineData, loading: mineLoading } = useQuery(
    MY_TASTE_PREFERENCES,
    { skip: !signedIn, fetchPolicy: "cache-first" },
  );

  const [saveRemote, { loading: saving }] = useMutation(SAVE_TASTE_PREFERENCES, {
    // The picker reflects what the server accepted, not what was sent — an
    // unknown slug is dropped there rather than refused, and the reader
    // should see the list that actually stuck.
    refetchQueries: [{ query: MY_TASTE_PREFERENCES }],
  });
  const [mergeRemote] = useMutation(MERGE_TASTE_PREFERENCES, {
    refetchQueries: [{ query: MY_TASTE_PREFERENCES }],
  });

  const categories = useMemo(
    () => _get<TasteCategoryType[]>(categoryData, "tasteCategories", []) ?? [],
    [categoryData],
  );

  const remote = useMemo(
    () =>
      _get<TastePreferenceType[]>(mineData, "myTastePreferences", []) ?? [],
    [mineData],
  );

  // A guest's list, held in state so the picker updates without a reload.
  const [local, setLocal] = useState<string[]>(readStoredTastes);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // --- the merge, once per sign-in ---------------------------------------
  const merged = useRef(false);

  useEffect(() => {
    if (!signedIn) {
      // Signing out returns this to a guest, and the next sign-in is a fresh
      // opportunity to merge whatever they chose in between.
      merged.current = false;
      return;
    }

    const pending = readStoredTastes();

    if (merged.current || !pending.length) {
      return;
    }

    merged.current = true;

    mergeRemote({ variables: { input: { slugs: pending } } })
      .then(() => {
        // Only after the server has it. Clearing first would lose the choices
        // outright if the request failed.
        clearStoredTastes();
        setLocal([]);
      })
      .catch(() => {
        // Kept locally and tried again on the next sign-in. A failed merge
        // must not silently discard what somebody picked.
        merged.current = false;
      });
  }, [signedIn, mergeRemote]);

  /** The slugs currently held, from whichever source is authoritative. */
  const selected = useMemo(
    () => (signedIn ? remote.map((one) => one.slug) : local),
    [signedIn, remote, local],
  );

  const save = useCallback(
    async (slugs: string[]) => {
      setError(null);

      if (!signedIn) {
        // A guest personalises too. Requiring an account to say "I like
        // coffee" is the sign-up wall this feature exists to avoid.
        writeStoredTastes(slugs);
        setLocal(slugs);
        writePromptState(TASTE_PROMPT.saved);
        setSaved(true);

        return true;
      }

      try {
        await saveRemote({ variables: { input: { slugs } } });
        writePromptState(TASTE_PROMPT.saved);
        setSaved(true);

        return true;
      } catch (caught) {
        // Shown verbatim where the server explained itself. A save that fails
        // quietly is indistinguishable from one that worked, and the reader
        // walks away believing something that is not true.
        setError(
          caught instanceof Error ? caught.message : "Could not save that.",
        );

        return false;
      }
    },
    [signedIn, saveRemote],
  );

  return {
    categories,
    /** Everything held, with its source. Empty is a real answer. */
    preferences: signedIn
      ? remote
      : local.map((slug) => ({
          slug,
          name: categories.find((one) => one.slug === slug)?.name ?? slug,
          kind: categories.find((one) => one.slug === slug)?.kind ?? "food",
          source: "explicit",
        })),
    selected,
    save,
    saving,
    saved,
    error,
    loading: categoriesLoading || (signedIn && mineLoading),
  };
};

export default useTastePreferences;
