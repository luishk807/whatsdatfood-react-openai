import { type FC } from "react";
import { Link } from "react-router-dom";
import { AddAPhotoIcon, FlameIcon } from "@/components/icons";
import { LOCATION_LABELS, DISCOVERY_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import { HotPickInterface } from "@/interfaces/trending";
import { milesFrom } from "@/utils/distance";

/**
 * One place worth going, as a photograph.
 *
 * **The hero is the food.** Somebody opening this product should see a dish
 * before they see anything else — it is the difference between "what should I
 * eat" and "what restaurants are near me", and only one of those is what this
 * is for. The restaurant's name is the caption on the photograph, not the
 * headline above it.
 *
 * **It renders nothing when nothing has earned it**, which on a fresh
 * catalogue is the normal state. The server refuses to nominate a restaurant
 * with no activity and no photographs, because the alternative is whatever
 * happens to be nearest presented as the standout place to eat — on the first
 * run in Flushing that was a Dunkin' Donuts 400 metres away. This is the
 * loudest element on the page, so an unearned one is the most damaging.
 *
 * **The heading follows the mode**, which the server sets. "Hot near you" is
 * a claim about other people's behaviour and needs the activity to back it;
 * "Worth a look" needs only that we know the place.
 */
const HotPick: FC<HotPickInterface> = ({ pick, mode }) => {
  if (!pick) {
    return null;
  }

  const trending = mode === "trending";
  const meta = [
    pick.neighborhood,
    LOCATION_LABELS.miles(milesFrom(pick.distance_km)),
  ].filter(Boolean);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
        {trending && <FlameIcon size={15} />}
        {trending ? DISCOVERY_LABELS.hotPick : DISCOVERY_LABELS.worthALook}
      </h2>

      <Link
        to={pick.slug ? buildMenuResultsPath(pick.slug) : "#"}
        className="group relative block overflow-hidden rounded-card border border-line bg-surface-raised"
      >
        {pick.top_dish_photo_url ? (
          <img
            src={pick.top_dish_photo_url}
            alt=""
            /* Eager: it is the largest thing above the fold and the reason
               the section exists. */
            className="h-56 w-full object-cover sm:h-72"
          />
        ) : (
          /* No photograph yet, which is most restaurants. The panel asks for
             one rather than pretending — and never borrows a stock image,
             which would erase the distinction the product rests on. */
          <span className="flex h-40 w-full flex-col items-center justify-center gap-2 bg-surface-sunken text-ink-muted sm:h-48">
            <AddAPhotoIcon size={26} />
            <span className="text-xs">{DISCOVERY_LABELS.noPhotoYet}</span>
          </span>
        )}

        <span className="flex flex-col gap-0.5 p-3">
          {/* The dish leads where we know it. "Soup Dumplings" is the answer
              to what somebody came here asking; the restaurant is where to
              get it. */}
          {pick.top_dish_name && (
            <span className="text-base font-semibold leading-tight text-ink">
              {pick.top_dish_name}
            </span>
          )}
          <span
            className={
              pick.top_dish_name
                ? "text-sm text-ink-muted"
                : "text-base font-semibold leading-tight text-ink"
            }
          >
            {pick.name}
          </span>
          <span className="text-xs text-ink-muted">{meta.join(" · ")}</span>
        </span>
      </Link>

      {/* Says why, in words that are true of the data behind them. Never a
          fabricated count. */}
      <p className="text-xs text-ink-muted">
        {trending
          ? DISCOVERY_LABELS.whyHot(pick.contributor_count)
          : DISCOVERY_LABELS.whyLook}
      </p>
    </section>
  );
};

export default HotPick;
