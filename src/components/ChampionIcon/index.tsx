import { type FC } from "react";
import clsx from "clsx";
import { REPUTATION_ASSETS } from "@/customConstants/reputation";
import { ChampionIconInterface } from "@/interfaces/reputation";

/**
 * The Restaurant Champion mark.
 *
 * Same contract as `FoodCredIcon`: point `REPUTATION_ASSETS.champion` at an
 * SVG or PNG and every instance becomes that file, at the same size, with no
 * component change and no reflow.
 *
 * The placeholder is a rosette rather than a trophy or a crown. A trophy reads
 * as a competition somebody won and is over; this is a standing that can change
 * hands the moment somebody else contributes more, and the mark should not
 * oversell it. Reputation is a supporting element here — the food is the page.
 */
const ChampionIcon: FC<ChampionIconInterface> = ({ size = 16, className }) => {
  const custom = REPUTATION_ASSETS.champion;

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
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative: the title sits beside it in text.
      aria-hidden="true"
      focusable="false"
      className={clsx("inline-block shrink-0", className)}
    >
      <circle cx="12" cy="9.4" r="6.2" />
      <path d="M8.6 14.6L7.2 21l4.8-2.5 4.8 2.5-1.4-6.4" />
    </svg>
  );
};

export default ChampionIcon;
