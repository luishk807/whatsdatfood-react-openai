import { type FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@/components/icons";
import TastePreferencePicker from "@/components/TastePreferencePicker";
import { TASTE_LABELS } from "@/customConstants/labels";
import { TASTE_PROMPT } from "@/customConstants/tastes";
import { ROUTES } from "@/customConstants/routes";
import useTastePreferences from "@/customHooks/useTastePreferences";
import {
  readPromptState,
  shouldOfferPicker,
  shouldOfferReminder,
  writePromptState,
} from "@/utils/tastes";
import { TasteOnboardingInterface } from "@/interfaces/tastes";

/**
 * Asking what somebody is into, once, on the front door.
 *
 * **Never at sign-up.** A preference questionnaire in front of somebody who
 * has not yet seen a photograph is a wall, and this product's registration was
 * deliberately cut from seven fields to three. This asks later, on a page they
 * are already using, about food that is already nearby.
 *
 * **Only once there is a location.** "Coffee worth trying near you" is a
 * promise the page cannot keep without somewhere to look, so the question
 * waits for the answer that makes it useful. That ordering is also honest: by
 * the time this appears, the reader has seen what the product does.
 *
 * **Three states, three behaviours.** Answered removes this entirely; skipped
 * leaves a single line and does not ask again for a month; never asked shows
 * the card. A card that reappears every visit is nagging, and nagging is how
 * an optional feature makes an application feel like a form.
 */
const TasteOnboarding: FC<TasteOnboardingInterface> = ({ hasLocation }) => {
  const { categories, selected, save, saving, error, loading } =
    useTastePreferences();

  const [prompt, setPrompt] = useState(readPromptState);
  const [draft, setDraft] = useState<string[]>([]);

  // The picker is controlled from the draft so a half-made choice is not
  // written anywhere until Save. Seeded once from whatever is already held,
  // which is what makes this the same control as the account page.
  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  const hasPreferences = selected.length > 0;
  const offerPicker = shouldOfferPicker(prompt, hasLocation, hasPreferences);
  const offerReminder = shouldOfferReminder(prompt, hasLocation, hasPreferences);

  const skip = () => {
    writePromptState(TASTE_PROMPT.dismissed);
    setPrompt(readPromptState());
  };

  const handleSave = async () => {
    if (await save(draft)) {
      setPrompt(readPromptState());
    }
  };

  if (offerReminder) {
    // One line, not the card. Somebody who said no should not meet the same
    // question again next Tuesday — but a month later they may well have
    // changed their mind, and this is how they say so.
    return (
      <Link
        to={ROUTES.tastes}
        className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-ink underline underline-offset-2"
      >
        {TASTE_LABELS.reminder}
        <ChevronRightIcon size={15} />
      </Link>
    );
  }

  if (!offerPicker) {
    return null;
  }

  return (
    <TastePreferencePicker
      categories={categories}
      selected={draft}
      onChange={setDraft}
      onSave={handleSave}
      onSkip={skip}
      loading={loading}
      saving={saving}
      error={error}
      variant="onboarding"
    />
  );
};

export default TasteOnboarding;
