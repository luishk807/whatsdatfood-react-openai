import { ReactNode } from "react";
import { RestaurantType } from "@/interfaces/restaurants";

export interface RestaurantHeaderInterface {
  restaurant?: RestaurantType | null;
  /** Rendered inline in the bar - the bookmark, and nothing that competes. */
  action?: ReactNode;
  onOpenDetails: () => void;
}

export interface RestaurantDetailsSheetInterface {
  restaurant?: RestaurantType | null;
  open: boolean;
  onClose: () => void;
}

export interface DetailRow {
  label: string;
  value: ReactNode;
}
