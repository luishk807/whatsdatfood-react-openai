import { StatusType } from "@/types";
import { MenuItemType, RestaurantType } from "@/types/restaurants";

export type userRatingPayload = {
  id?: number;
  rating: number;
  user_id: number;
  restaurant_menu_item_id: number;
};

export type UserRating = {
  id?: number;
  restaurant_menu_item_id: bigint;
  user_id: bigint;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
  comment?: string;
  restaurantItem?: MenuItemType;
};

export type UserRoleType = {
  id: number;
  name: string;
};

export type CreateUserInputType = {
  dob: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
};

export type UserSearchesType = {
  id: number;
  user_id: number;
  restaurant_id: number;
  restaurant: RestaurantType;
  user: UserType;
};

export type UserType = {
  id: number;
  first_name: string;
  last_name: string;
  password: string;
  username: string;
  phone: string;
  email: string;
  role_id: bigint;
  verification: string;
  dob?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  status_id?: number;
  ratings?: [UserRating];
  status?: StatusType;
  role?: UserRoleType;
  searches?: [UserSearchesType];
};
