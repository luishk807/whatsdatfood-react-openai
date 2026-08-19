import { useCallback, useEffect, useState } from "react";
import {
  GEOLOCATION,
  GEOLOCATION_STATUS,
  GeolocationStatus,
} from "@/customConstants/location";
import { CoordinatesType } from "@/interfaces/location";

/**
 * The browser's idea of where the reader is.
 *
 * **It never asks twice on its own.** `request()` is called from a tap and from
 * nowhere else, and a refusal is remembered for the session — a page that
 * re-prompts on every render is how somebody ends up blocking the permission
 * at the browser level, which cannot be undone from inside the page.
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

  // Asked once, not watched: the Permissions API tells us a previous refusal
  // is standing, so the control can say "location is blocked" instead of
  // offering a button that opens nothing.
  useEffect(() => {
    let live = true;

    if (!navigator.permissions?.query) {
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (live && result.state === "denied") {
          setStatus(GEOLOCATION_STATUS.denied);
        }
      })
      .catch(() => {
        // Not every browser has it, and it is an optimisation rather than the
        // mechanism — `request()` finds out the same thing the hard way.
      });

    return () => {
      live = false;
    };
  }, []);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus(GEOLOCATION_STATUS.unavailable);
      return;
    }

    // A standing refusal is not something to ask about again.
    if (status === GEOLOCATION_STATUS.denied) {
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
  }, [status]);

  return { status, coordinates, request };
};

export default useGeolocation;
