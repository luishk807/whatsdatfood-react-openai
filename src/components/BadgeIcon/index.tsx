import { type FC } from "react";
import clsx from "clsx";
import { REPUTATION_ASSETS } from "@/customConstants/reputation";
import { BadgeIconInterface } from "@/interfaces/reputation";

/**
 * A badge's mark.
 *
 * The server sends an `icon` **key**, never a URL, so badge logic and badge
 * graphics stay uncoupled: swapping the artwork is
 * `REPUTATION_ASSETS.badges[key] = <imported file>` and nothing else. Until
 * then every badge shares one placeholder shape and is told apart by its name,
 * which is honest — nine bespoke placeholder drawings would be nine things to
 * throw away.
 *
 * An unearned badge is drawn hollow rather than hidden. You cannot work
 * towards something you cannot see.
 */
const BadgeIcon: FC<BadgeIconInterface> = ({ badgeId, earned, size = 40, className }) => {
  const custom = REPUTATION_ASSETS.badges[badgeId];

  if (custom) {
    return (
      <img
        src={custom}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={clsx(
          "inline-block shrink-0 object-contain",
          !earned && "opacity-40 grayscale",
          className,
        )}
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={clsx("inline-block shrink-0", className)}
    >
      <circle
        cx="20"
        cy="20"
        r="17"
        fill={earned ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={earned ? 0 : 1.5}
        opacity={earned ? 0.12 : 0.35}
        strokeDasharray={earned ? undefined : "4 3"}
      />
      <circle
        cx="20"
        cy="20"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity={earned ? 0.9 : 0.4}
      />
    </svg>
  );
};

export default BadgeIcon;
