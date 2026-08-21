import { type FC } from "react";
import LocationCue from "@/components/LocationCue";
import { PinIcon } from "@/components/icons";
import { LOCATION_LABELS } from "@/customConstants/labels";

/**
 * What the front door says to somebody we cannot place yet.
 *
 * **Nothing asks the browser on load.** A first-time visitor meeting a
 * permission dialog before they have seen a photograph is how the permission
 * gets blocked at the browser level, which cannot be undone from inside the
 * page. So this is a pitch: it names what they get, and waits for a tap.
 *
 * It replaces a bare pair of controls floating under the search box. Those
 * said what to do without ever saying why, on a homepage whose nearby sections
 * were simply absent until somebody guessed that pressing one of them would
 * summon them.
 *
 * Once a location is known this is gone entirely — see `LocationBadge`. The
 * large ask belongs to people who have not answered; left up afterwards it is
 * a question being put to a reader who already answered it, and it pushes the
 * food down the page to do so.
 */
const LocationPrompt: FC = () => (
  <section
    aria-labelledby="discovery-prompt"
    className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface-raised px-4 py-5 text-center"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunken text-ink-muted">
      <PinIcon size={20} />
    </span>

    <h2 id="discovery-prompt" className="text-base font-semibold text-ink">
      {LOCATION_LABELS.discoverTitle}
    </h2>
    <p className="max-w-xs text-sm text-ink-muted">
      {LOCATION_LABELS.discoverBlurb}
    </p>

    {/* The one control, shared with the sheet and the results page. Not a way
        in: the sections this fills are on this page, and navigating away meant
        they never visibly updated. */}
    <LocationCue navigateOnFix={false} />
  </section>
);

export default LocationPrompt;
