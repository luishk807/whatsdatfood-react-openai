import { type FC } from "react";
import clsx from "clsx";
import FoodCredIcon from "@/components/FoodCredIcon";
import { FOOD_CRED_LABELS } from "@/customConstants/reputation";
import { FoodCredAmountInterface } from "@/interfaces/reputation";

const SIZES = {
  sm: { text: "text-xs", icon: 12, gap: "gap-1" },
  md: { text: "text-sm font-medium", icon: 14, gap: "gap-1.5" },
  lg: { text: "text-2xl font-semibold", icon: 20, gap: "gap-2" },
} as const;

/**
 * A Food Cred number, with its mark and its unit.
 *
 * Everywhere an amount is shown, so the wording stays "Food Cred" and never
 * drifts into "points" or a bare number next to a coin. `tabular-nums` because
 * these sit in lists and a total that shifts sideways as it counts up reads as
 * a slot machine.
 */
const FoodCredAmount: FC<FoodCredAmountInterface> = ({
  amount,
  signed = false,
  size = "md",
  muted = false,
  className,
}) => {
  const scale = SIZES[size];
  const positive = amount >= 0;
  const shown = signed && positive ? `+${amount}` : `${amount}`;

  return (
    <span
      className={clsx(
        // The unit never wraps away from its number. "440 Food / Cred" across
        // two lines reads as two facts rather than one.
        "inline-flex items-center whitespace-nowrap",
        scale.gap,
        scale.text,
        muted
          ? "text-ink-muted line-through"
          : signed && !positive
            ? "text-danger"
            : "text-brand",
        className,
      )}
    >
      <FoodCredIcon size={scale.icon} />
      <span className="tabular-nums">{shown}</span>
      <span className={clsx(size === "lg" ? "text-sm font-normal" : undefined)}>
        {FOOD_CRED_LABELS.unit}
      </span>
    </span>
  );
};

export default FoodCredAmount;
