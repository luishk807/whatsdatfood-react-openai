import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import NoPhotographyOutlinedIcon from "@mui/icons-material/NoPhotographyOutlined";
import Badge from "@/components/Badge";
import { DishPhotoInterface } from "@/interfaces/ranking";
import {
  IMAGE_SOURCE,
  BADGE_TONE,
  PHOTO_LOOKUP,
} from "@/customConstants/images";
import { DISH_LABELS } from "@/customConstants/labels";

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
  credit,
  uploading,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url]);

  const isEmpty = !url || failed;

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

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && onAddPhoto) {
      onAddPhoto(file);
    }

    // Reset so choosing the same file twice still fires.
    event.target.value = "";
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative w-full overflow-hidden rounded-card bg-surface-sunken",
        // A dish with no photo takes a fraction of the height of one that
        // has. Square empty tiles gave a menu like Peter Luger's sides a
        // full screen of identical grey boxes, which buried the food that
        // does have photography - the opposite of the point.
        isEmpty ? "h-20" : "aspect-square",
      )}
    >
      {isEmpty ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center text-ink-muted">
          {!onAddPhoto && (
            <>
              <NoPhotographyOutlinedIcon fontSize="small" />
              <span className="text-xs">
                {failed ? DISH_LABELS.photoFailed : DISH_LABELS.noPhoto}
              </span>
            </>
          )}
          {onAddPhoto && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                // Opens the camera directly on a phone, which is the whole
                // point: the person who can take the photo is at the table.
                capture="environment"
                onChange={handleFile}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
              {/* Quiet rather than black-on-grey. It is still the upload
                  funnel - it appears on exactly the dishes that need one -
                  but it no longer shouts over the photographs. */}
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-ink-muted hover:border-ink hover:text-ink disabled:opacity-60"
              >
                <AddAPhotoOutlinedIcon sx={{ fontSize: 14 }} />
                {uploading ? DISH_LABELS.uploading : DISH_LABELS.addPhoto}
              </button>
            </>
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
