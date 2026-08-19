import { type FC, type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PinIcon } from "@/components/icons";
import useDiscoveryLocation from "@/customHooks/useDiscoveryLocation";
import { useResolveLocation } from "@/customHooks/useNearby";
import { GEOLOCATION_STATUS } from "@/customConstants/location";
import { LOCATION_LABELS } from "@/customConstants/labels";
import { buildNearbyPath } from "@/customConstants/routes";
import { LocationCueInterface } from "@/interfaces/location";

/**
 * The second way in, under the search box: find food near me.
 *
 * Search stays the primary action — somebody who knows the restaurant should
 * type it — so this is a quiet line rather than a second button competing with
 * the first.
 *
 * **It asks the device once, from a tap, and never again on its own.** A page
 * that re-prompts is how somebody ends up blocking the permission at the
 * browser level, which cannot be undone from inside the page. After a refusal
 * the control stops being a button and becomes the typed alternative, because
 * offering a tap that opens nothing is worse than offering nothing.
 *
 * Every failure says which failure it was. "Location is off for this site" and
 * "that took too long" lead to different next moves, and a spinner that
 * quietly stops is the version that gets reported as "the button does
 * nothing".
 */
const LocationCue: FC<LocationCueInterface> = ({ cuisine }) => {
  const { location, status, request, choose } = useDiscoveryLocation();
  const { resolve, loading: resolving } = useResolveLocation();
  const navigate = useNavigate();

  const [typing, setTyping] = useState(false);
  const [query, setQuery] = useState("");
  const [missed, setMissed] = useState(false);
  // Only the tap that asked for a fix should navigate. Without this the
  // control would send a reader to /nearby the moment they landed on a page
  // holding a location they set last week.
  const asked = useRef(false);

  const refused =
    status === GEOLOCATION_STATUS.denied ||
    status === GEOLOCATION_STATUS.unavailable;

  const goToNearby = (place?: string) =>
    navigate(buildNearbyPath({ cuisine, place }));

  const handleDevice = () => {
    // Already located: no reason to ask the device again.
    if (location) {
      goToNearby();
      return;
    }

    asked.current = true;
    request();
  };

  const handleTyped = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMissed(false);

    const place = await resolve(query);

    if (!place) {
      setMissed(true);
      return;
    }

    choose(place);
    goToNearby(place.label);
  };

  // A fix landed for somebody who asked: go, rather than making them tap a
  // second time for the thing they already requested. In an effect, not in
  // the render — navigating while rendering is a side effect during render,
  // and React runs it twice in development.
  useEffect(() => {
    if (asked.current && status === GEOLOCATION_STATUS.granted && location) {
      asked.current = false;
      navigate(buildNearbyPath({ cuisine }));
    }
  }, [status, location, cuisine, navigate]);

  const message = refused
    ? status === GEOLOCATION_STATUS.denied
      ? LOCATION_LABELS.denied
      : LOCATION_LABELS.unavailable
    : status === GEOLOCATION_STATUS.timedOut
      ? LOCATION_LABELS.timedOut
      : "";

  return (
    <div
      id="discovery-place-cue"
      className="flex flex-col items-center gap-2 scroll-mt-20"
    >
      {!refused && (
        <button
          type="button"
          onClick={handleDevice}
          disabled={status === GEOLOCATION_STATUS.prompting}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-60"
        >
          <PinIcon size={16} />
          {status === GEOLOCATION_STATUS.prompting
            ? LOCATION_LABELS.locating
            : LOCATION_LABELS.useMyLocation}
        </button>
      )}

      {message && (
        <p role="status" className="text-xs text-ink-muted">
          {message}{" "}
          {refused && <span>{LOCATION_LABELS.deniedHelp}</span>}
        </p>
      )}

      {!typing ? (
        <button
          type="button"
          onClick={() => setTyping(true)}
          className="min-h-11 text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {LOCATION_LABELS.enterLocation}
        </button>
      ) : (
        <form
          onSubmit={handleTyped}
          className="flex w-full max-w-sm items-center gap-2"
        >
          <label htmlFor="discovery-place" className="sr-only">
            {LOCATION_LABELS.enterLocation}
          </label>
          <input
            id="discovery-place"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={LOCATION_LABELS.placeholder}
            className="h-11 min-w-0 flex-1 rounded-pill border border-line bg-surface-raised px-4 text-base text-ink"
          />
          <button
            type="submit"
            disabled={resolving || !query.trim()}
            className="h-11 shrink-0 rounded-pill bg-brand px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {resolving ? LOCATION_LABELS.finding : LOCATION_LABELS.find}
          </button>
        </form>
      )}

      {missed && (
        <p role="alert" className="text-xs text-danger">
          {LOCATION_LABELS.notFound}
        </p>
      )}
    </div>
  );
};

export default LocationCue;
