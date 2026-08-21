import { type FC } from "react";
import { CheckCircleIcon } from "@/components/icons";
import { VERIFIED_LABELS } from "@/customConstants/labels";
import { VerifiedBadgeInterface } from "@/interfaces/ownership";

/**
 * "Someone from this restaurant manages this page."
 *
 * **It says who runs the page, not how good the food is.** "Verified" beside
 * a restaurant's name reads as a quality rating if the wording lets it, and
 * this product has exactly one ranking claim - the community vote - which is
 * the thing its credibility rests on. So the mark is explained in words
 * wherever it appears rather than left as a tick to interpret.
 *
 * **It cannot be bought.** The server decides it from a live membership, and
 * `MEMBERSHIP_LABELS.notForSale` already says a plan buys nothing a role
 * decides. A badge somebody could pay for is not a badge.
 *
 * **It is absent, never greyed.** Most restaurants have no owner and never
 * will; a dimmed "not verified" mark on six thousand pages would be a
 * complaint about the catalogue printed on every restaurant in it.
 */
const VerifiedBadge: FC<VerifiedBadgeInterface> = ({ verified, className }) => {
  if (!verified) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border border-line px-2 py-0.5 text-xs text-ink-muted ${className ?? ""}`}
      // The explanation travels with the mark rather than being a legend
      // somewhere else on the page.
      title={VERIFIED_LABELS.explain}
    >
      <CheckCircleIcon size={13} />
      {VERIFIED_LABELS.badge}
    </span>
  );
};

export default VerifiedBadge;
