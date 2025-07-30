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
