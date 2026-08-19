import {
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import useGeolocation from "@/customHooks/useGeolocation";
import {
  GEOLOCATION_STATUS,
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
  /** Ask the device. Only ever called from a tap. */
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

  const choose = useCallback((place: ResolvedLocationType) => {
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
    const location = chosen
      ? chosen
      : coordinates
        ? // The label comes from the server, which names the area from the
          // nearest restaurant it knows. Nothing here reverse-geocodes anybody
          // to a street.
          { ...coordinates, label: deviceLabel }
        : null;

    return {
      location,
      source: chosen
        ? LOCATION_SOURCE.chosen
        : coordinates
          ? LOCATION_SOURCE.device
          : null,
      status: chosen ? GEOLOCATION_STATUS.granted : status,
      request,
      choose,
      forget,
      nameArea,
    };
  }, [chosen, coordinates, deviceLabel, status, request, choose, forget, nameArea]);

  return (
    <DiscoveryLocationContext.Provider value={value}>
      {children}
    </DiscoveryLocationContext.Provider>
  );
};
