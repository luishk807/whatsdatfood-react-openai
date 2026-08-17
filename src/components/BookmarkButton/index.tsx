import { type FC, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import useAuth from "@/customHooks/useAuth";
import useUserFavorite from "@/customHooks/useUserFavorites";
import useSnackbarHook from "@/customHooks/useSnackBar";
import { FAVORITE_LABELS } from "@/customConstants/labels";
import { BookmarkButtonInterface } from "@/interfaces/favorites";

const HeartIcon: FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

/**
 * Saving a restaurant.
 *
 * It used to ask "is this one of my favourites?" whether or not anybody was
 * signed in, so every anonymous visit to a menu page produced an UNAUTHORIZED
 * error - and it logged the answer to the console while it was at it. Signed
 * out it now asks nothing, and says what to do instead of reporting a failure.
 */
const BookmarkButton: FC<BookmarkButtonInterface> = ({ slug, defaultValue }) => {
  const { user } = useAuth();
  const { saveFavorites, isUserFavorite } = useUserFavorite();
  const { SnackbarComponent, showSnackBar } = useSnackbarHook();
  const [isSaved, setIsSaved] = useState(Boolean(defaultValue));
  const [busy, setBusy] = useState(false);

  const signedIn = Boolean(user);

  // Same trap as the search box: the hook hands back a new function identity
  // on every render, so depending on it makes the effect re-run every render.
  const lookupRef = useRef(isUserFavorite);
  lookupRef.current = isUserFavorite;

  const refresh = useCallback(async () => {
    if (!slug || !signedIn) {
      return;
    }

    try {
      setIsSaved(Boolean(await lookupRef.current(slug)));
    } catch {
      // Whether it is saved is not worth interrupting a page for.
      setIsSaved(false);
    }
  }, [slug, signedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleClick = async () => {
    if (!signedIn) {
      showSnackBar(FAVORITE_LABELS.signInToSave, "info");
      return;
    }

    setBusy(true);

    try {
      const saved = await saveFavorites(slug);

      if (saved) {
        showSnackBar(FAVORITE_LABELS.savedToast, "success");
      } else {
        showSnackBar(FAVORITE_LABELS.failed, "error");
      }
    } catch {
      showSnackBar(FAVORITE_LABELS.failed, "error");
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  const label = !signedIn
    ? FAVORITE_LABELS.signInToSave
    : isSaved
      ? FAVORITE_LABELS.remove
      : FAVORITE_LABELS.save;

  return (
    <>
      {SnackbarComponent}
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-label={label}
        aria-pressed={isSaved}
        title={label}
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-50 motion-reduce:transition-none",
          isSaved ? "text-danger" : "text-ink-muted hover:text-ink",
        )}
      >
        <HeartIcon filled={isSaved} />
      </button>
    </>
  );
};

export default BookmarkButton;
