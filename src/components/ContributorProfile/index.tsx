import { type FC } from "react";
import { useParams } from "react-router-dom";
import ContributorSummary from "@/components/ContributorSummary";
import BadgeGrid from "@/components/BadgeGrid";
import useContributorProfile from "@/customHooks/useContributorProfile";
import { PROFILE_PARAM } from "@/customConstants/routes";
import { PROFILE_LABELS } from "@/customConstants/reputation";
import { getDate } from "@/utils/time";

/**
 * A contributor as everyone else sees them.
 *
 * Reuses `ContributorSummary` rather than growing a second layout: the same
 * facts are the same facts whether you are looking at yourself or somebody
 * else. What differs is what the server is willing to say, and that decision
 * lives on the server — this page cannot show an email because the type it
 * receives does not have one.
 */
const ContributorProfile: FC = () => {
  const params = useParams();
  const username = params[PROFILE_PARAM];
  const { profile, loading } = useContributorProfile(username);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="h-44 w-full animate-pulse rounded-card bg-surface-sunken motion-reduce:animate-none" />
      </div>
    );
  }

  // Unknown, blocked, inactive and erased all land here, and deliberately read
  // the same. Distinguishing them would turn this page into a way to find out
  // whether an account exists and what happened to it.
  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="rounded-card border border-dashed border-line px-4 py-8 text-center text-sm text-ink-muted">
          {PROFILE_LABELS.notFound}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <ContributorSummary
        name={profile.display_name}
        stats={profile}
        subtitle={
          profile.joinedAt
            ? PROFILE_LABELS.joined(getDate(profile.joinedAt))
            : profile.level?.name
        }
      />

      {/* Earned only, and no progress bars: how close a stranger is to
          something is their business, not a visitor's. The server sends only
          earned badges here, so this is belt and braces. */}
      <BadgeGrid badges={profile.badges ?? []} showProgress={false} />
    </div>
  );
};

export default ContributorProfile;
