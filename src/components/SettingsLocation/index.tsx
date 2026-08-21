import { type FC, useState } from "react";
import LocationSheet from "@/components/LocationSheet";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { LOCATION_LABELS, SETTINGS_LABELS } from "@/customConstants/labels";
import { LOCATION_SOURCE } from "@/customConstants/location";

/**
 * Where we look when somebody asks what is nearby.
 *
 * This existed and had no home. The only way to change it was a control on
 * the homepage and another on `/nearby`, so somebody looking for it in
 * Settings - which is where a person looks for a setting - found nothing at
 * all, and Settings quietly did not contain everything about them.
 *
 * **The same sheet, not a second one.** `LocationSheet` wraps `LocationCue`,
 * and the whole app has exactly one location control and one provider. A
 * settings-specific copy is how two places start disagreeing about where you
 * are.
 *
 * **Forgetting is offered plainly**, because a stored area is the most
 * personal thing this product keeps and removing it should not require
 * deleting an account. A device fix is never stored at all, which is why the
 * page says which kind this is.
 */
const SettingsLocation: FC = () => {
  const { location, source, forget } = useDiscoveryLocation();
  const [changing, setChanging] = useState(false);

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <p className="text-sm text-ink-muted">{SETTINGS_LABELS.locationBlurb}</p>

      <div className="flex flex-col gap-3 rounded-card border border-line p-4">
        <p className="text-sm font-medium text-ink">
          {location?.label || SETTINGS_LABELS.locationNone}
        </p>

        {location && (
          <p className="text-xs text-ink-muted">
            {source === LOCATION_SOURCE.device
              ? LOCATION_LABELS.fromDevice
              : LOCATION_LABELS.fromChoice}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="min-h-11 rounded-pill border border-ink px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
          >
            {LOCATION_LABELS.change}
          </button>

          {location && (
            <button
              type="button"
              onClick={forget}
              className="min-h-11 rounded-pill border border-line px-4 text-sm text-ink-muted hover:text-ink"
            >
              {SETTINGS_LABELS.locationForget}
            </button>
          )}
        </div>
      </div>

      <LocationSheet open={changing} onClose={() => setChanging(false)} />
    </div>
  );
};

export default SettingsLocation;
