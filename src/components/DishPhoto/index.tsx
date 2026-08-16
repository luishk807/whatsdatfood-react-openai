import { FC, useEffect, useRef, useState } from "react";
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
 */
const DishPhoto: FC<DishPhotoInterface> = ({
  url,
  alt,
  source,
  eager,
  onAddPhoto,
  onVisible,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url]);

  const isEmpty = !url || failed;

  // Only a tile with nothing to show asks for a photo, and only once it is
  // near the viewport — so scrolling past a dish costs nothing.
  useEffect(() => {
    const node = containerRef.current;

    if (!isEmpty || !onVisible || !node || typeof IntersectionObserver === "undefined") {
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
      className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800"
    >
      {isEmpty ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-neutral-500 dark:text-neutral-400">
          <NoPhotographyOutlinedIcon fontSize="small" />
          <span className="text-xs">
            {failed ? DISH_LABELS.photoFailed : DISH_LABELS.noPhoto}
          </span>
          {onAddPhoto && (
            <button
              type="button"
              onClick={onAddPhoto}
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-white/90 dark:text-black"
            >
              <AddAPhotoOutlinedIcon sx={{ fontSize: 14 }} />
              {DISH_LABELS.addPhoto}
            </button>
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
    </div>
  );
};

export default DishPhoto;
