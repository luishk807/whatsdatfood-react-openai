import { type FC } from "react";
import { PinIcon } from "@/components/icons";
import { LOCATION_LABELS } from "@/customConstants/labels";
import { LocationBadgeInterface } from "@/interfaces/location";

/**
 * Where we are looking, said in one line.
 *
 * This is what a known location looks like: a pin, the area's name, and a way
 * to change it. The large "use my current location / enter a location" pair
 * belongs to somebody who has not answered — kept on screen afterwards it asks
 * a reader something they already told us, and takes a third of the first
 * screen to do it.
 *
 * **A drawn pin, never an emoji.** An emoji is a different picture on every
 * platform, cannot take the theme's colour, and cannot be replaced without
 * editing every call site. This is the same mark the rest of the product uses
 * for a place.
 *
 * **The name is an area, never an address.** The server picks it from the
 * nearest restaurant it knows, and until it has said anything the honest
 * caption is "Near you" — vague and true beats precise and invented.
 */
const LocationBadge: FC<LocationBadgeInterface> = ({ label, onChange }) => (
  <div className="flex items-center justify-center gap-2 text-sm">
    <span className="inline-flex min-w-0 items-center gap-1.5 text-ink">
      <PinIcon size={15} className="shrink-0 text-ink-muted" />
      <span className="truncate font-medium">
        {label || LOCATION_LABELS.unnamedArea}
      </span>
    </span>

    <span aria-hidden="true" className="text-ink-muted">
      &middot;
    </span>

    <button
      type="button"
      onClick={onChange}
      className="min-h-11 shrink-0 rounded-pill px-1 text-ink-muted underline underline-offset-2 hover:text-ink"
    >
      {LOCATION_LABELS.change}
    </button>
  </div>
);

export default LocationBadge;
