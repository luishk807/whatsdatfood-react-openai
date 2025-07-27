import _ from "lodash";
import { DEFAULT_CURRENCY } from "@/customConstants";
import { getTypeFn, getBuiltAddressType } from "@/types";
import { UserRating } from "@/interfaces/users";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { MenuItemType, RestaurantType } from "@/interfaces/restaurants";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat); // register the plugin

export const _get: getTypeFn = <T>(
  obj: any,
  flag: string,
  defaultvalue?: T,
) => {
  return _.get(obj, flag, defaultvalue);
};

export const getDate = (date?: string, format?: string) => {
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

export const getRestNameAddress = (restaurant: RestaurantType) => {
  const address = getBuiltAddress({
    address: restaurant.address as string,
    city: restaurant.city,
    state: restaurant.state,
    postal_code: restaurant.postal_code,
    country: restaurant.country,
  });
  const name = _get(restaurant, "name");
  return name + " " + address;
};

export const capitalizedWord = (word: string) =>
  !word ? word : word.charAt(0).toUpperCase() + word.toLowerCase().slice(1);

export const handleHighlightSuggest = (value: string, target: string) => {
  const regex = new RegExp("(" + target + ")", "gi");
  return value.replace(regex, `<b>$1</b>`);
};

export const convertCurrency = (amount: number, currency?: any) => {
  const defaultCurrency = currency ? currency : DEFAULT_CURRENCY;
  const { code, name } = defaultCurrency;
  return new Intl.NumberFormat(code, {
    style: "currency",
    currency: name,
  }).format(amount);
};

export const removeDashDBName = (name: string) => {
  if (!name) {
    return name;
  }

  const rev = name.split("_");
  const title = rev.map((item) => {
    return capitalizedWord(item);
  });

  return title.join(" ");
};

export const getBuiltAddress: getBuiltAddressType = (address) => {
  let new_address = "";
  const { address: c_address, city, country, state, postal_code } = address;
  if (address) {
    new_address += `${c_address} `;
  }
  if (city) {
    new_address += `${city} `;
  }
  if (state) {
    new_address += `${state} `;
  }
  if (postal_code) {
    new_address += `${postal_code} `;
  }
  if (country) {
    new_address += `${country} `;
  }
  return new_address.trim();
};

export const isHomePage = () => {
  const location = useLocation();
  return location.pathname === "/";
};

export const getMissingField = (requiredFields: string[], fields: string[]) => {
  const formKeys = new Set(fields);
  return requiredFields.filter((item) => !formKeys.has(item));
};

export const getLabelFromKey = (allFields: any[], fields: any[]) => {
  return allFields
    .filter((item) => fields.includes(item.name))
    .map((item) => item.label);
};

export const getAverageStarsTotal = (data: UserRating[]) => {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + item.rating, 0);
  const average = total / data.length;
  return Math.round(average * 2) / 2;
};

export const getTotalRatings = (data: UserRating[]) => {
  return data.length;
};
