import { SxProps, Theme, AlertColor } from "@mui/material";
import { MenuItemType, RestaurantType } from "@/interfaces/restaurants";
import { StatusType } from "@/interfaces";
import {
  ModalType,
  RatingToogleType,
  UserFriendSectionWindowTypes,
} from "@/types";

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

export interface UserFriend {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: UserType;
}

export interface UserSearch {
  id: number;
  name: string;
  user_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  user: UserType;
}

export interface UserView {
  id: number;
  restaurant_id: number;
  user_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  user: UserType;
  restaurant: RestaurantType;
}

export interface UserFavorites {
  id: number;
  restaurant_id: number;
  user_id: number;
  createdAt?: Date;
  updatedAt?: Date;
  restaurant: RestaurantType;
  user: UserType;
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
  searches?: [UserSearch];
  views?: [UserView];
  friends?: [UserFriend];
}

export interface UserRatingListResp {
  data: UserRating[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

export interface RatingItemInt {
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

export interface RatingModalListComponentInt {
  data: MenuItemType;
  defaultType?: RatingToogleType;
  onClose?: () => void;
}

export interface UserAccountLayoutInterface {
  children?: React.ReactNode;
  sectionTitle?: string;
}

export interface UserFriendCreateInt {
  type: UserFriendSectionWindowTypes;
  onPrevious?: () => void;
  onSubmit: (
    data: CreateUserFriend,
    type: UserFriendSectionWindowTypes,
  ) => void;
}

export interface CreateUserFriend
  extends Partial<
    Omit<UserFriend, "id" | "user_id" | "createdAt" | "updatedAt">
  > {}
