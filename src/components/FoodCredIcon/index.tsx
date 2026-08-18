import { type FC } from "react";
import clsx from "clsx";
import { REPUTATION_ASSETS } from "@/customConstants/reputation";
import { FoodCredIconInterface } from "@/interfaces/reputation";

/**
 * The Food Cred mark.
 *
 * One component, used everywhere a Food Cred number appears, so the graphic is
 * a single edit rather than a search-and-replace. Point
 * `REPUTATION_ASSETS.foodCred` at an SVG or PNG and every instance in the app
 * becomes that file — the box is already reserved at the same size, so nothing
 * reflows and no component needs to change.
 *
 * Deliberately not an emoji. An emoji is a different picture on every platform,
 * cannot be replaced without touching every call site, and the food-adjacent
 * ones all read as either a currency or a snack.
 *
 * The placeholder is a plate seen from above — the thing the whole product is
 * about — drawn in `currentColor` so it inherits whatever tone it sits in and
 * never fights the photography.
 */
const FoodCredIcon: FC<FoodCredIconInterface> = ({ size = 16, className }) => {
  const custom = REPUTATION_ASSETS.foodCred;

  if (custom) {
    return (
      <img
        src={custom}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={clsx("inline-block shrink-0 object-contain", className)}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      // Decorative: every number this sits beside is already labelled
      // "Food Cred" in text, so announcing it again is noise.
      aria-hidden="true"
      focusable="false"
      className={clsx("inline-block shrink-0", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="5.2" fill="currentColor" opacity="0.9" />
    </svg>
  );
};

export default FoodCredIcon;
