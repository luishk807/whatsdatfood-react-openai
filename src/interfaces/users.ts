import { SxProps, Theme, AlertColor } from "@mui/material";
import { MenuItemType, RestaurantType } from "@/interfaces/restaurants";
import { StatusType } from "@/interfaces";
import { ModalType } from "@/types";

export interface RatingCustomInterface {
  defaultValue: number;
  label?: string;
  sx?: SxProps<Theme>;
  oneStarMode?: boolean;
  onClick?: (value: number) => void;
  isDisplay?: boolean;
}

export interface RatingPayloadType {
  id?: number | null;
  rating: number | null;
  title: string | null;
  comment: string | null;
  restaurant_menu_item_id: number;
}

export interface userRatingPayload {
  id?: number;
  rating: number;
  user_id: number;
  restaurant_menu_item_id: number;
}

export interface UserRating {
  id?: number;
  restaurant_menu_item_id: bigint;
  user_id: bigint;
  rating: number;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
  comment?: string;
  restaurantItem?: MenuItemType;
  user: UserType;
  status: StatusType;
}

export interface UserRoleType {
  id: number;
  name: string;
}

export interface CreateUserInputType {
  dob: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UserSearchesType {
  id: number;
  user_id: number;
  restaurant_id: number;
  restaurant: RestaurantType;
  user: UserType;
}

export interface UserType {
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
}

export interface UserRatingListResp {
  data: UserRating[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

export interface UserRatingItemInt {
  data: UserRating;
}

export interface RatingModalCreateInterface {
  data: MenuItemType;
  label?: string;
  type?: ModalType;
}

export interface RatingFormCreateInterface {
  data: MenuItemType;
  label?: string;
  type?: ModalType;
  onPrevious?: () => void;
  onSubmit?: (message: string, severity: AlertColor) => void;
}

export interface RatingListComponentInterface {
  data: MenuItemType;
  onOpenCreate?: () => void;
}
