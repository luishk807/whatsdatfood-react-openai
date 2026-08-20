import {
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import useGeolocation from "@/customHooks/useGeolocation";
import {
  GeolocationStatus,
  LOCATION_SOURCE,
  LOCATION_STORAGE_KEY,
  LocationSource,
} from "@/customConstants/location";
import { ResolvedLocationType } from "@/interfaces/location";

/**
 * Where the reader is looking, held once for the whole app.
 *
 * This started as a plain hook and was wrong in a way only driving the app
 * found: `useGeolocation` keeps its fix in component state, so tapping "use my
 * current location" on the home page and then navigating to `/nearby` mounted
 * a *second* copy of the hook with no fix in it — the page asked "choose where
 * to look" one second after being told. Every test passed, because every test
 * rendered one component.
 *
 * Two sources, in this order: a place the reader chose, then the device. A
 * choice wins over a fix — somebody who typed "Flushing" while sitting in
 * Brooklyn meant it.
 *
 * **Only a choice is written to disk.** A device fix is the most sensitive
 * thing this application touches, it is stale within the hour, and re-asking
 * the browser costs one tap.
 */
interface DiscoveryLocationInterface {
  location: ResolvedLocationType | null;
  source: LocationSource | null;
  status: GeolocationStatus;
  /**
   * Ask the device. Only ever called from a tap, and it means *now* — a
   * stored choice stops outranking the fix from here on.
   */
  request: () => void;
  choose: (place: ResolvedLocationType) => void;
  forget: () => void;
  /** What the server called this area, once it has said. */
  nameArea: (label: string) => void;
}

export const DiscoveryLocationContext = createContext<
  DiscoveryLocationInterface | undefined
>(undefined);

const readStored = (): ResolvedLocationType | null => {
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ResolvedLocationType;

    // Anything malformed is absent rather than trusted into a map centre of
    // NaN, NaN.
    if (
      typeof parsed?.latitude !== "number" ||
      typeof parsed?.longitude !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    // Private mode, a full quota, a hostile extension. None of them are worth
    // a broken homepage.
    return null;
  }
};

export const DiscoveryLocationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { status, coordinates, request } = useGeolocation();
  const [chosen, setChosen] = useState<ResolvedLocationType | null>(readStored);
  const [deviceLabel, setDeviceLabel] = useState("");

  // Which source the reader last asked for. A choice normally outranks a
  // device fix, but not when the reader has just tapped "use my current
  // location" — at that moment the stored choice is precisely the thing they
  // are trying to replace, and a fixed precedence made the fix arrive and
  // change nothing.
  const [preferred, setPreferred] = useState<LocationSource>(
    LOCATION_SOURCE.chosen,
  );

  const requestDevice = useCallback(() => {
    setPreferred(LOCATION_SOURCE.device);
    // The old area name belongs to the old point. Kept, it would head the
    // page "near Flushing" over results measured from somewhere else.
    setDeviceLabel("");
    request();
  }, [request]);

  const choose = useCallback((place: ResolvedLocationType) => {
    setPreferred(LOCATION_SOURCE.chosen);
    setChosen(place);

    try {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(place));
    } catch {
      // Remembering is a convenience; failing to remember is not an error
      // worth showing anybody.
    }
  }, []);

  const forget = useCallback(() => {
    setChosen(null);

    try {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch {
      // As above.
    }
  }, []);

  const nameArea = useCallback((label: string) => {
    setDeviceLabel((current) => (current === label ? current : label));
  }, []);

  const value = useMemo<DiscoveryLocationInterface>(() => {
    // The label comes from the server, which names the area from the nearest
    // restaurant it knows. Nothing here reverse-geocodes anybody to a street.
    const device = coordinates ? { ...coordinates, label: deviceLabel } : null;

    // A choice beats a fix — somebody who typed "Flushing" in Brooklyn meant
    // it — *unless* they have since asked for the device, in which case the
    // fix beats the choice and a refusal falls back to it rather than losing
    // it. Tapping a button should never cost somebody the location they set.
    const usingDevice =
      preferred === LOCATION_SOURCE.device ? device !== null : chosen === null;
    const location = (usingDevice ? device : chosen) ?? null;

    return {
      location,
      source: location
        ? usingDevice
          ? LOCATION_SOURCE.device
          : LOCATION_SOURCE.chosen
        : null,
      // The device's real state, never a choice standing in for it. Reported
      // as `granted` whenever anything was stored, "locating…" could not
      // render and a standing refusal could not be explained — so the button
      // sat there looking live and doing nothing.
      status,
      request: requestDevice,
      choose,
      forget,
      nameArea,
    };
  }, [
    chosen,
    coordinates,
    deviceLabel,
    preferred,
    status,
    requestDevice,
    choose,
    forget,
    nameArea,
  ]);

  return (
    <DiscoveryLocationContext.Provider value={value}>
      {children}
    </DiscoveryLocationContext.Provider>
  );
};
