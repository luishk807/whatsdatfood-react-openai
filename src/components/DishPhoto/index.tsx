import { FC, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Badge from "@/components/Badge";
import { DishPhotoInterface } from "@/interfaces/ranking";
import {
  IMAGE_SOURCE,
  BADGE_TONE,
  PHOTO_LOOKUP,
} from "@/customConstants/images";
import { DISH_LABELS } from "@/customConstants/labels";
import PhotoUploadAction from "@/components/PhotoUploadAction";
import { UPLOAD_VARIANT } from "@/interfaces/photos";

/**
 * A plate, drawn rather than photographed.
 *
 * The empty state used to be a crossed-out camera, which reads as "this is
 * broken". A plate reads as "this is waiting" — and on a menu where most
 * dishes have no photo yet, that difference is the difference between a page
 * that looks unfinished and one that looks like it is asking.
 */
const EmptyPlate: FC<{ size: number }> = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="24" cy="24" r="17" strokeWidth="1.6" opacity="0.45" />
    <circle
      cx="24"
      cy="24"
      r="10.5"
      strokeWidth="1.2"
      strokeDasharray="3 3"
      opacity="0.35"
    />
  </svg>
);

/**
 * Aspect-locked so a grid of photos stays uniform, and it degrades to an empty
 * state on a broken URL — third-party hosts return 403 often enough that a
 * missing image is a normal case, not an exception.
 *
 * **The empty state is now the common case, and it is designed as one.** Dish
 * photography is community uploads only: a search engine's guess is not
 * evidence of what a kitchen serves, so most dishes start with nothing. An
 * earlier version deliberately kept this placeholder quiet, on the reasoning
 * that loud "add a photo" pills on two thirds of a menu drowned out the
 * photographs. That reasoning assumed stock imagery was filling the other two
 * thirds. It is not any more — the empty tile *is* the menu until diners fill
 * it — so a placeholder that whispers just makes the page look broken. It
 * asks, clearly, and it is drawn to look intentional while it waits.
 */
const DishPhoto: FC<DishPhotoInterface> = ({
  url,
  alt,
  source,
  eager,
  onAddPhoto,
  onVisible,
  onUnavailable,
  credit,
  uploading,
  compact,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url]);

  // Generic imagery illustrates a cuisine or fills a marketing panel. It is
  // never a photograph of this dish, and rendering it here would erase the one
  // distinction the product's credibility rests on.
  const isGeneric = source === IMAGE_SOURCE.generic;
  const isEmpty = !url || failed || isGeneric;

  // Held in a ref rather than listed as a dependency. An inline callback is a
  // new identity on every render, and a new identity in an effect's dependency
  // list is how this codebase has produced request loops three times.
  const onUnavailableRef = useRef(onUnavailable);

  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    if (isEmpty) {
      onUnavailableRef.current?.();
    }
  }, [isEmpty]);

  // Dormant unless a caller passes onVisible. Nothing does today: the server
  // no longer searches for dish photography, so the request would only ever
  // confirm what the tile already shows.
  useEffect(() => {
    const node = containerRef.current;

    if (
      !isEmpty ||
      !onVisible ||
      !node ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible();
          observer.disconnect();
        }
      },
      { rootMargin: PHOTO_LOOKUP.ROOT_MARGIN },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isEmpty, onVisible]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative w-full overflow-hidden rounded-card",
        // Always square, photo or not. A short tile beside a square one drags
        // a whole grid column out of line and the page reads as broken.
        "aspect-square",
        isEmpty
          ? // A soft, warm well rather than a grey box: it should look like a
            // place a photo belongs, not like a failed request.
            "border border-dashed border-line bg-gradient-to-b from-surface-sunken to-surface"
          : "bg-surface-sunken",
      )}
    >
      {isEmpty ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center">
          <span className="text-ink-muted">
            <EmptyPlate size={compact ? 30 : 40} />
          </span>

          <span
            className={clsx(
              "font-medium text-ink-muted",
              compact ? "text-[11px]" : "text-xs",
            )}
          >
            {failed ? DISH_LABELS.photoFailed : DISH_LABELS.noPhoto}
          </span>

          {/* The ask. Prominent because on most dishes this tile is all there
              is — and because the person who can answer it is sitting at the
              table with the dish in front of them. */}
          {onAddPhoto && (
            <PhotoUploadAction
              variant={UPLOAD_VARIANT.tile}
              onSelect={onAddPhoto}
              label={compact ? DISH_LABELS.addPhotoShort : DISH_LABELS.beFirst}
              uploadingLabel={DISH_LABELS.uploading}
              uploading={uploading}
            />
          )}
        </div>
      ) : (
        <img
          src={url as string}
          alt={alt || DISH_LABELS.noPhoto}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={clsx(
            "h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {!isEmpty && source && (
        <div className="pointer-events-none absolute left-2 top-2">
          <Badge
            tone={
              source === IMAGE_SOURCE.community
                ? BADGE_TONE.community
                : BADGE_TONE.stock
            }
          >
            {source === IMAGE_SOURCE.community
              ? DISH_LABELS.communityPhoto
              : DISH_LABELS.stockPhoto}
          </Badge>
        </div>
      )}

      {!isEmpty && credit && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4">
          <span className="text-[11px] font-medium text-white/90">
            {DISH_LABELS.photoBy(credit)}
          </span>
        </div>
      )}
    </div>
  );
};

export default DishPhoto;
