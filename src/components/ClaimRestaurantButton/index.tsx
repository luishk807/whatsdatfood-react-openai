import { FC, useEffect, useState } from "react";
import ClaimWizard from "@/components/ClaimWizard";
import { StorefrontIcon } from "@/components/icons";
import useRestaurantOwnership from "@/customHooks/useRestaurantOwnership";
import useAuth from "@/customHooks/useAuth";
import { OWNER_LABELS } from "@/customConstants/labels";
import { ClaimStatus } from "@/interfaces/ownership";

interface ClaimRestaurantButtonInterface {
  slug?: string;
  restaurantName?: string;
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
const ClaimRestaurantButton: FC<ClaimRestaurantButtonInterface> = ({
  slug,
  restaurantName,
}) => {
  const { user } = useAuth();
  const { loadClaims } = useRestaurantOwnership();
  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [open, setOpen] = useState(false);

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
      <span className="text-xs text-ink-muted">
        {STATUS_LABEL[status]}
      </span>
    );
  }

  return (
    <>
      {/* Opens the wizard rather than submitting. It used to send a slug and
          nothing else, so every claim reached a moderator as "this person
          pressed a button" and had to be decided on that. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-3 text-xs font-medium text-ink"
      >
        <StorefrontIcon size={14} />
        {OWNER_LABELS.claimCta}
      </button>

      <ClaimWizard
        slug={slug}
        restaurantName={restaurantName}
        open={open}
        onClose={() => setOpen(false)}
        onSubmitted={() => setStatus("pending")}
      />
    </>
  );
};

export default ClaimRestaurantButton;
