import { KM_PER_MILE } from "@/customConstants/location";

/**
 * The server measures in kilometres; a reader in New York thinks in miles.
 *
 * Converted for display and nowhere else — never stored, never sent back, and
 * never used to compare two distances, so there is one unit in the data and
 * one in the interface.
 */
export const milesFrom = (km: number): number => km / KM_PER_MILE;
