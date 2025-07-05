import _ from "lodash";
import { DEFAULT_CURRENCY } from "@/customConstants";
import { getTypeFn, getBuiltAddressType } from "@/types";

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

export const convertCurrency = (
  amount: number,
  currency: any = DEFAULT_CURRENCY,
) => {
  const { code, name } = currency;
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
