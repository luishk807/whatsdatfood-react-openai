import { type FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { PhotoWallInterface, ShowcasePhoto } from "@/interfaces/ranking";
import { SHOWCASE, IMAGE_SOURCE } from "@/customConstants/images";
import { SHOWCASE_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import DishPhoto from "@/components/DishPhoto";

/**
 * The food, immediately under the search box.
 *
 * The homepage used to be a heading and a text box, which asks a first-time
 * visitor to already know a restaurant name. The wall answers "what is this
 * site" with photographs, and every tile is a link, so the way in is a tap on
 * something that looks good rather than a search you have to compose.
 *
 * Two columns on a phone: at three, a plate is too small to want.
 */
const tileKey = (photo: ShowcasePhoto, index: number) =>
  photo.id ?? `${photo.restaurant_slug}-${index}`;

const PhotoWall: FC<PhotoWallInterface> = ({
  photos,
  loading,
  eagerCount = SHOWCASE.EAGER_COUNT,
}) => {
  // Third-party photo hosts refuse requests often enough that some tiles arrive
  // with nothing in them. On a menu an empty tile is useful - it is the upload
  // funnel - but here it is a hole in the one thing the page exists to show,
  // and a short tile also drags its column out of line with its neighbour.
  const [unavailable, setUnavailable] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const drop = useCallback((key: string) => {
    setUnavailable((prev) => {
      if (prev.has(key)) {
        return prev;
      }

      return new Set(prev).add(key);
    });
  }, []);

  const shown = photos.filter(
    (photo, index) => !unavailable.has(tileKey(photo, index)),
  );

  // Nothing at all rather than an error or an empty-state apology. A visitor
  // with no photos to see still has a working search box above this, and a wall
  // that announces its own failure makes the whole page look broken.
  if (!loading && !shown.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="photo-wall-heading"
      className="flex flex-col gap-3"
    >
      <h2
        id="photo-wall-heading"
        className="text-sm font-medium uppercase tracking-wide text-ink-muted"
      >
        {SHOWCASE_LABELS.heading}
      </h2>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {loading
          ? Array.from({ length: SHOWCASE.LIMIT }, (_unused, index) => (
              <li
                key={`showcase-skeleton-${index}`}
                aria-hidden="true"
                className="aspect-square animate-pulse rounded-card bg-surface-sunken"
              />
            ))
          : shown.map((photo, index) => (
              <li key={tileKey(photo, index)}>
                <Link
                  to={buildMenuResultsPath(photo.restaurant_slug ?? "")}
                  aria-label={SHOWCASE_LABELS.tileLabel(
                    photo.dish_name ?? "",
                    photo.restaurant_name ?? "",
                  )}
                  className="group flex flex-col gap-1.5"
                >
                  <DishPhoto
                    url={photo.url_s || photo.url_m}
                    alt={photo.dish_name}
                    // Only community photos are badged here. A "Stock photo"
                    // chip on all twelve tiles is chrome competing with the
                    // food, and on the front door the food wins. The credit is
                    // not optional though - it is how an uploader is
                    // attributed, so it rides along whenever there is one.
                    source={photo.owner ? IMAGE_SOURCE.community : undefined}
                    credit={photo.owner}
                    eager={index < eagerCount}
                    onUnavailable={() => drop(tileKey(photo, index))}
                  />

                  {/* The caption is the dish, because that is what was
                      photographed; the restaurant is where the tap goes. */}
                  <span className="line-clamp-1 text-sm font-medium text-ink group-hover:underline">
                    {photo.dish_name}
                  </span>
                  <span className="line-clamp-1 text-xs text-ink-muted">
                    {photo.restaurant_name}
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
};

export default PhotoWall;
