import _ from "lodash";
import { getTypeFn, getBuiltAddressType } from "@/types";
import { useLocation } from "react-router-dom";
import { RestaurantType } from "@/interfaces/restaurants";

export const _get: getTypeFn = <T>(
  obj: any,
  flag: string,
  defaultvalue?: T,
) => {
  return _.get(obj, flag, defaultvalue);
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
