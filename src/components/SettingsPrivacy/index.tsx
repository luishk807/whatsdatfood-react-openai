import { type FC } from "react";
import { Link } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { buildProfilePath } from "@/customConstants/routes";

/**
 * What we hold about somebody, and what other people can see of it.
 *
 * **Built from what already exists** rather than from new backend work.
 * Public profiles are already public - `/contributor/:username` is a real URL
 * because a leaderboard whose names lead nowhere is one most readers cannot
 * use - and the split between what is visible and what is not is a fact about
 * the product that had never been written anywhere a person could read it.
 *
 * There are no toggles here yet, and inventing a visibility column to put one
 * behind would be exactly the unnecessary backend work to avoid. What this
 * does is answer the question honestly, and point at the two controls that
 * are real: the saved area, and deleting the account.
 */
const SettingsPrivacy: FC = () => {
  const { user } = useAuth();
  const username = user?.username;

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <section className="flex flex-col gap-2 rounded-card border border-line p-4">
        <h2 className="text-sm font-medium text-ink">
          {SETTINGS_LABELS.privacyPublic}
        </h2>
        <p className="text-sm text-ink-muted">
          {SETTINGS_LABELS.privacyPublicBlurb}
        </p>

        {username && (
          <Link
            to={buildProfilePath(username)}
            className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4"
          >
            {`/contributor/${username}`}
          </Link>
        )}
      </section>
    </div>
  );
};

export default SettingsPrivacy;
