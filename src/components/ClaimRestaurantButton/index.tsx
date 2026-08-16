import { FC, useEffect, useState } from "react";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import useRestaurantOwnership from "@/customHooks/useRestaurantOwnership";
import useAuth from "@/customHooks/useAuth";
import { OWNER_LABELS } from "@/customConstants/labels";
import { ClaimStatus } from "@/interfaces/ownership";

interface ClaimRestaurantButtonInterface {
  slug?: string;
}

const STATUS_LABEL: Record<ClaimStatus, string> = {
  pending: OWNER_LABELS.claimPending,
  approved: OWNER_LABELS.claimApproved,
  rejected: OWNER_LABELS.claimRejected,
};

/**
 * The way a restaurant owner finds this at all.
 *
 * Sits on the menu page because that is where an owner will arrive — someone
 * sends them a link to their own restaurant and the data is wrong.
 */
const ClaimRestaurantButton: FC<ClaimRestaurantButtonInterface> = ({ slug }) => {
  const { user } = useAuth();
  const { loadClaims, claim, claiming } = useRestaurantOwnership();
  const [status, setStatus] = useState<ClaimStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!user || !slug) {
        return;
      }

      const claims = await loadClaims();
      const mine = claims.find((row) => row.restaurant?.slug === slug);

      if (!cancelled) {
        setStatus(mine?.status ?? null);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [user, slug, loadClaims]);

  if (!user || !slug) {
    return null;
  }

  if (status) {
    return (
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {STATUS_LABEL[status]}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={claiming}
      onClick={async () => {
        await claim(slug);
        setStatus("pending");
      }}
      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-neutral-700 dark:text-neutral-200"
    >
      <StorefrontOutlinedIcon sx={{ fontSize: 14 }} />
      {OWNER_LABELS.claimCta}
    </button>
  );
};

export default ClaimRestaurantButton;
