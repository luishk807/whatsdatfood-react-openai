import { DEFAULT_CURRENCY } from "@/customConstants";
import { UserRating } from "@/interfaces/users";

export const convertCurrency = (amount: number, currency?: any) => {
  const defaultCurrency = currency ? currency : DEFAULT_CURRENCY;
  const { code, name } = defaultCurrency;
  return new Intl.NumberFormat(code, {
    style: "currency",
    currency: name,
  }).format(amount);
};

export const getAverageStarsTotal = (data: UserRating[]) => {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + item.rating, 0);
  const average = total / data.length;
  return Math.round(average * 2) / 2;
};

export const getTotalRatings = (data: UserRating[]) => {
  return getAverageStarsTotal(data);
};
