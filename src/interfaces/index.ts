import { RestaurantType } from "types";
export interface RequestAIInterface {
  restaurant: string;
  address?: string;
}

export interface MenuTitleInterface {
  restaurant: RestaurantType | null;
}
