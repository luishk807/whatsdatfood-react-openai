import { type FC, useEffect, useState } from "react";
import TastePreferencePicker from "@/components/TastePreferencePicker";
import { TASTE_LABELS } from "@/customConstants/labels";
import useTastePreferences from "@/customHooks/useTastePreferences";

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
const TastePreferencesPage: FC = () => {
  const { categories, selected, save, saving, saved, error, loading } =
    useTastePreferences();

  // Edited as a draft so a half-made change is written nowhere until Save.
  const [draft, setDraft] = useState<string[]>([]);

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-16 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          {TASTE_LABELS.manageTitle}
        </h1>
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
    </div>
  );
};

export default TastePreferencesPage;
