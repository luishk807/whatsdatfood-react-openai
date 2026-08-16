import { FC } from "react";
import clsx from "clsx";
import { BadgeInterface } from "@/interfaces/ranking";
import { BADGE_TONE } from "@/customConstants/images";
import { BadgeToneType } from "@/types";

const TONE_CLASSES: Record<BadgeToneType, string> = {
  [BADGE_TONE.neutral]: "bg-black/60 text-white",
  [BADGE_TONE.community]: "bg-emerald-600/90 text-white",
  [BADGE_TONE.stock]: "bg-black/50 text-white/80",
  [BADGE_TONE.top]: "bg-amber-500/95 text-black",
};

const Badge: FC<BadgeInterface> = ({
  children,
  tone = BADGE_TONE.neutral,
  className,
}) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight tracking-wide backdrop-blur-sm",
      TONE_CLASSES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
