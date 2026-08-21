import { type FC, useEffect, useRef } from "react";
import BottomSheet from "@/components/BottomSheet";
import LocationCue from "@/components/LocationCue";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { LOCATION_LABELS } from "@/customConstants/labels";
import {
  LocationSheetInterface,
  ResolvedLocationType,
} from "@/interfaces/location";

/**
 * Asking where to look, without taking the page away.
 *
 * **This exists so a cuisine tile lands on results.** Tapping "Italian" used
 * to reach a full page whose entire content was two buttons — a heading, an
 * explanation, "use my current location", "enter a location" — and the food
 * was a tap and a navigation further on. The results page now renders
 * underneath and this asks the one question over it, so answering reveals what
 * was already being loaded rather than starting a second journey.
 *
 * **It is the same control as everywhere else.** `LocationCue` owns the device
 * request, the typed form and every failure message; this is a container round
 * it. A second implementation of "ask for a location" is how an application
 * ends up with two location systems that disagree, which is the exact bug
 * `DiscoveryLocationProvider` was written to end.
 *
 * **It closes itself when the question is answered**, rather than leaving
 * somebody looking at a form for something they have just supplied. Watching
 * the location rather than the button press means a fix that arrives late — a
 * slow GPS lock — still dismisses it.
 */
const LocationSheet: FC<LocationSheetInterface> = ({ open, onClose }) => {
  const { location } = useDiscoveryLocation();

  // Only a location that lands *while this is open* closes it. Reacting to the
  // value alone would slam the sheet shut the instant it opened for somebody
  // changing a location they already had.
  const openedWith = useRef<ResolvedLocationType | null>(null);

  useEffect(() => {
    if (open) {
      openedWith.current = location;
    }
    // Captured on the transition to open, so a later fix is comparable against
    // what was showing when the reader asked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && location && location !== openedWith.current) {
      onClose();
    }
  }, [open, location, onClose]);

  return (
    <BottomSheet
      open={open}
      title={LOCATION_LABELS.chooseTitle}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 pb-2">
        {/* Not a way *in* — the page behind this is already the destination,
            so a fix has to reveal it rather than navigate somewhere else. */}
        <LocationCue navigateOnFix={false} />

        <p className="text-center text-xs text-ink-muted">
          {LOCATION_LABELS.privacyNote}
        </p>
      </div>
    </BottomSheet>
  );
};

export default LocationSheet;
