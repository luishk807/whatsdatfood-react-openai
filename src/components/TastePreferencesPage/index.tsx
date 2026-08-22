import { type FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TastePreferencePicker from "@/components/TastePreferencePicker";
import { TASTE_LABELS } from "@/customConstants/labels";
import useAuth from "@/customHooks/useAuth";
import useTastePreferences from "@/customHooks/useTastePreferences";
import { ROUTES } from "@/customConstants/routes";
import { TastePreferencesPageInterface } from "@/interfaces/tastes";

/**
 * Account → Taste preferences. The permanent home for what somebody is into.
 *
 * **The same picker as the homepage card**, at a different `variant`. This is
 * where somebody goes to fix what they answered too quickly the first time, so
 * a second implementation would be the worst possible place for the two to
 * disagree — a chip that exists here and not there, or a save that behaves
 * differently, and the reader has no way to tell which one is real.
 *
 * **Open to guests too.** A guest's tastes live in the browser and personalise
 * their homepage just the same, so a page that demanded an account to edit
 * them would be locking somebody out of their own choices. Signing in later
 * merges the two.
 */
const TastePreferencesPage: FC<TastePreferencesPageInterface> = ({
  embedded,
}) => {
  const { categories, selected, save, saving, saved, error, loading } =
    useTastePreferences();
  // A guest personalises too, and has no settings page to go back to.
  const signedIn = Boolean(useAuth().user);

  // Edited as a draft so a half-made change is written nowhere until Save.
  const [draft, setDraft] = useState<string[]>([]);

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  return (
    <div
      className={
        embedded
          ? "flex w-full max-w-3xl flex-col gap-4"
          : "mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-16 pt-6"
      }
    >
      {/* Inside Settings the section already has a heading and the layout
          already owns the page padding. Rendering both would put the title
          twice on one screen - which is what a second copy of this page would
          have quietly become. */}
      <div className="flex flex-col gap-1">
        {!embedded && (
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {TASTE_LABELS.manageTitle}
          </h1>
        )}
        <p className="text-sm text-ink-muted">{TASTE_LABELS.manageBlurb}</p>
      </div>

      <TastePreferencePicker
        categories={categories}
        selected={draft}
        onChange={setDraft}
        onSave={() => save(draft)}
        loading={loading}
        saving={saving}
        saved={saved}
        error={error}
        variant="manage"
      />

      {/* On its own page this was a dead end: saved, a line saying so, and
          nothing to press. Embedded in Settings the layout already provides
          "‹ Settings", so this would be a second way back beside it. */}
      {!embedded && saved && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={ROUTES.home}
            className="inline-flex min-h-11 items-center rounded-pill bg-brand px-5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            {TASTE_LABELS.seeFeed}
          </Link>

          {signedIn && (
            <Link
              to={ROUTES.settings}
              className="inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-sm text-ink hover:border-ink"
            >
              {TASTE_LABELS.backToSettings}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TastePreferencesPage;
