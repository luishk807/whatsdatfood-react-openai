import { useCallback, useEffect, useRef, useState } from "react";
import {
  GEOLOCATION,
  GEOLOCATION_STATUS,
  GeolocationStatus,
} from "@/customConstants/location";
import { CoordinatesType } from "@/interfaces/location";

/**
 * The browser's idea of where the reader is.
 *
 * **It never prompts on its own.** `request()` is called from a tap and from
 * nowhere else, and a refusal is remembered for the session — a page that
 * re-prompts on every render is how somebody ends up blocking the permission
 * at the browser level, which cannot be undone from inside the page.
 *
 * **A permission already granted is resumed without asking.** That is not the
 * same thing as prompting, and the distinction is the whole design: when the
 * Permissions API reports `granted`, the reader has already agreed and
 * `getCurrentPosition` opens no dialog at all. Without this, somebody who
 * granted the permission yesterday came back to a homepage with every nearby
 * section missing and a button asking for something they had already given —
 * because a device fix is deliberately never written to disk, so nothing
 * survived the reload to say so.
 *
 * A brand-new visitor is in `prompt`, not `granted`, and nothing happens to
 * them. Where the Permissions API does not exist, nothing happens either:
 * guessing would mean prompting a first-time reader on load, which is exactly
 * the intrusion this avoids.
 *
 * Every outcome is a state rather than a silence: prompting, granted, denied,
 * unavailable, timed out. The caller shows something for each, because "the
 * button did nothing" is the worst of them and the easiest to ship.
 */
const useGeolocation = () => {
  const [status, setStatus] = useState<GeolocationStatus>(
    GEOLOCATION_STATUS.idle,
  );
  const [coordinates, setCoordinates] = useState<CoordinatesType | null>(null);

  /** The fix itself, shared by the tap and by the silent resume. */
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus(GEOLOCATION_STATUS.unavailable);
      return;
    }

    setStatus(GEOLOCATION_STATUS.prompting);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus(GEOLOCATION_STATUS.granted);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus(GEOLOCATION_STATUS.denied);
          return;
        }

        setStatus(
          error.code === error.TIMEOUT
            ? GEOLOCATION_STATUS.timedOut
            : GEOLOCATION_STATUS.unavailable,
        );
      },
      {
        // Good enough to name a neighbourhood, which is all this is for.
        // High accuracy costs battery and a GPS fix indoors, where the reader
        // is: they are sitting in a restaurant.
        enableHighAccuracy: false,
        timeout: GEOLOCATION.TIMEOUT_MS,
        maximumAge: GEOLOCATION.MAX_AGE_MS,
      },
    );
  }, []);

  // Once, on mount. A standing refusal is reported so the control can say
  // "location is blocked" rather than offering a button that opens nothing;
  // a standing grant is acted on, because asking somebody to re-authorise
  // what they already authorised is friction with nothing on the other side
  // of it.
  const resumed = useRef(false);

  useEffect(() => {
    let live = true;

    if (!navigator.permissions?.query) {
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (!live) {
          return;
        }

        if (result.state === "denied") {
          setStatus(GEOLOCATION_STATUS.denied);
          return;
        }

        // `prompt` is a brand-new visitor and is left alone. Only an explicit
        // standing grant resumes, and only once — `locate` is idempotent but
        // a second call would still spend a fix.
        if (result.state === "granted" && !resumed.current) {
          resumed.current = true;
          locate();
        }
      })
      .catch(() => {
        // Not every browser has it, and it is an optimisation rather than the
        // mechanism — `request()` finds out the same thing the hard way.
      });

    return () => {
      live = false;
    };
  }, [locate]);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus(GEOLOCATION_STATUS.unavailable);
      return;
    }

    // A standing refusal is not something to ask about again.
    if (status === GEOLOCATION_STATUS.denied) {
      return;
    }

    locate();
  }, [status, locate]);

  return { status, coordinates, request };
};

export default useGeolocation;
