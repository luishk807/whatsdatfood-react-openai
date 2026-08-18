import { FC, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { NoPhotographyIcon } from "@/components/icons";
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
 * Aspect-locked so a grid of photos from many sources stays uniform, and it
 * degrades to an empty state on a broken URL — third-party photo hosts return
 * 403 often enough that a missing image is a normal case, not an exception.
 *
 * The empty state is also the upload funnel: it appears on exactly the dishes
 * that need a photo, and opens the camera in one tap on a phone.
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
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url]);

  const isEmpty = !url || failed;

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

  // Only a tile with nothing to show asks for a photo, and only once it is
  // near the viewport — so scrolling past a dish costs nothing.
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
        "relative w-full overflow-hidden rounded-card bg-surface-sunken",
        // Always square, photo or not. A short tile where its neighbour is
        // square drags a whole grid column out of line with the one beside it,
        // and the page reads as broken rather than as a missing picture. The
        // cost is that a menu with little photography is a lot of empty squares
        // - which is why the empty state below is as quiet as it is.
        "aspect-square",
      )}
    >
      {isEmpty ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-center text-ink-muted">
          {!onAddPhoto && (
            <>
              <NoPhotographyIcon size={18} className="opacity-50" />
              <span className="text-[11px] opacity-70">
                {failed ? DISH_LABELS.photoFailed : DISH_LABELS.noPhoto}
              </span>
            </>
          )}
          {/* A placeholder that happens to be tappable, not a call to action.
              Bordered pills reading "Add the first photo" on two thirds of a
              menu made the upload funnel the loudest thing on the page,
              competing with the photographs it exists to collect. */}
          {onAddPhoto && (
            <PhotoUploadAction
              variant={UPLOAD_VARIANT.tile}
              onSelect={onAddPhoto}
              label={DISH_LABELS.addPhotoShort}
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
