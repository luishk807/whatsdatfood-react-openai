import { useState, useEffect, type FC } from "react";
import clsx from "clsx";
import { StarIcon } from "@/components/icons";
import { RatingCustomInterface } from "@/interfaces/users";
import { STAR_COUNT, RATING_LABELS } from "@/customConstants/ranking";

const labelFor = (value: number) =>
  `${value} Star${value !== 1 ? "s" : ""}, ${RATING_LABELS[value] ?? ""}`.trim();

/**
 * Half-star fill without a second icon set: one muted star, one coloured star
 * clipped to the fraction that is earned.
 */
const Star: FC<{ fill: number; size: number }> = ({ fill, size }) => (
  <span
    className="relative inline-flex shrink-0"
    style={{ width: size, height: size }}
  >
    <StarIcon size={size} className="text-line" />
    <span
      className="absolute inset-y-0 left-0 overflow-hidden"
      style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
    >
      <StarIcon size={size} className="text-warn" />
    </span>
  </span>
);

const RatingCustom: FC<RatingCustomInterface> = ({
  isDisplay = false,
  label,
  defaultValue,
  oneStarMode,
  onClick,
}) => {
  const [value, setValue] = useState<number>(defaultValue ?? 0);

  useEffect(() => {
    setValue(defaultValue ?? 0);
  }, [defaultValue]);

  if (oneStarMode) {
    return (
      <span className="inline-flex items-center gap-0.5">
        (<StarIcon size={14} className="text-warn" />
        {defaultValue})
      </span>
    );
  }

  if (isDisplay) {
    return (
      <div
        className="flex flex-row items-center justify-center gap-1"
        role="img"
        aria-label={labelFor(defaultValue ?? 0)}
      >
        <span className="flex gap-0.5">
          {Array.from({ length: STAR_COUNT }, (_, index) => (
            <Star key={index} fill={(defaultValue ?? 0) - index} size={16} />
          ))}
        </span>
        <span>({defaultValue})</span>
      </div>
    );
  }

  const choose = (next: number) => () => {
    setValue(next);
    onClick && onClick(next);
  };

  return (
    <>
      {label && label}
      {/* Two targets per star is what buys half-star precision — the same thing
          MUI did by splitting the icon on hover, but as real buttons so it works
          from the keyboard as well as a thumb. */}
      <div role="group" aria-label={label ?? RATING_LABELS.group} className="flex gap-0.5">
        {Array.from({ length: STAR_COUNT }, (_, index) => {
          const whole = index + 1;

          return (
            <span key={index} className="relative inline-flex">
              <Star fill={value - index} size={28} />
              {[whole - 0.5, whole].map((score, half) => (
                <button
                  key={score}
                  type="button"
                  aria-label={labelFor(score)}
                  aria-pressed={value === score}
                  onClick={choose(score)}
                  className={clsx(
                    "absolute inset-y-0 w-1/2 cursor-pointer",
                    half === 0 ? "left-0" : "right-0",
                  )}
                />
              ))}
            </span>
          );
        })}
      </div>
    </>
  );
};

export default RatingCustom;
