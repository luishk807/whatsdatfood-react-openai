import { _get } from "@/utils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat); // register the plugin
import { localTimeInt } from "@/interfaces";
import { BusinessHours } from "@/interfaces/businessHours";
export const getDate = (date?: string | Date, format?: string) => {
  if (!format) {
    format = "MM/DD/YYYY";
  }

  return dayjs(date).isValid()
    ? dayjs(date).format(format)
    : dayjs().format(format);
};

export const convertTimeToLocal = (time: string, format?: string) => {
  if (!time) {
    return null;
  }
  return dayjs(time, "HH:mm").format(format ? format : "h:mm A");
};

export const getLocalHours = (
  times: localTimeInt,
): Record<string, string | null> => {
  let timeObject: Record<string, string | null> = {};
  Object.keys(times).forEach((key: string) => {
    timeObject[key] = convertTimeToLocal(times[key] as string);
  });

  return timeObject;
};

export const checkIfStoreOpen = (businessHours: BusinessHours) => {
  if (!businessHours) {
    return false;
  }

  const now = dayjs();

  const open_time = dayjs(businessHours.open_time, "h:mm A");
  const close_time = dayjs(businessHours.close_time, "h:mm A");

  return now > open_time && now < close_time ? true : false;
};

/**
 * "3 days ago", for a menu that was last touched at some point.
 *
 * Rounded to the day on purpose. "Updated 4 hours ago" invites a reader to
 * believe the menu is live, and it is not — somebody changed something four
 * hours ago, which says nothing about the dish they are looking at. The day
 * is the honest resolution for a claim this weak.
 *
 * Returns null rather than a string for anything unparseable, so a caller
 * renders nothing instead of "Invalid Date" under a restaurant's name.
 */
export const relativeDay = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const then = dayjs(value);

  if (!then.isValid()) {
    return null;
  }

  const days = dayjs().startOf("day").diff(then.startOf("day"), "day");

  // A clock skew between the server and the browser must not print
  // "updated -1 days ago".
  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "yesterday";
  }

  if (days < 30) {
    return `${days} days ago`;
  }

  // Past a month the count stops meaning anything and the month is what a
  // reader actually wants: "Menu updated March 2026".
  return then.format("MMMM YYYY");
};
