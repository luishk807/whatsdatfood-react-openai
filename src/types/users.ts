export type userRatingPayload = {
  id?: number;
  rating: number;
  user_id: number;
  restaurant_menu_item_id: number;
};

export type CreateUserInputType = {
  dob: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
};
