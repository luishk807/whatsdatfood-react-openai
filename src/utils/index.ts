import _ from "lodash";
import { DEFAULT_CURRENCY } from "@/customConstants";
import { getTypeFn, getBuiltAddressType } from "@/types";
import { UserRating } from "@/interfaces/users";
import { useLocation } from "react-router-dom";
import { MenuItemType } from "@/interfaces/restaurants";
export const _get: getTypeFn = <T>(
  obj: any,
  flag: string,
  defaultvalue?: T,
) => {
  return _.get(obj, flag, defaultvalue);
};

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
