import { RestaurantType, MenuItemType } from "@/interfaces/restaurants";

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface RestaurantClaimType {
  id: string;
  status: ClaimStatus;
  note?: string | null;
  verification_method?: string | null;
  createdAt?: string | null;
  decidedAt?: string | null;
  restaurant?: Pick<
    RestaurantType,
    "slug" | "name" | "address" | "city"
  > | null;
}

export interface ReportedPhotoType {
  id: string;
  reason?: string | null;
  note?: string | null;
  createdAt?: string | null;
  photo?: {
    id?: string | number;
    url_m?: string | null;
    owner?: string | null;
    source?: string | null;
  } | null;
}

export interface ClaimListInterface {
  claims: RestaurantClaimType[];
  loading?: boolean;
  onManage?: (claim: RestaurantClaimType) => void;
}

export interface ClaimReviewInterface {
  claims: RestaurantClaimType[];
  loading?: boolean;
  onDecide: (claimId: string, approve: boolean) => void;
}

export interface ReportReviewInterface {
  reports: ReportedPhotoType[];
  loading?: boolean;
  onResolve: (reportId: string, removePhoto: boolean) => void;
}

export interface DishFactsFormInterface {
  dish: MenuItemType;
  saving?: boolean;
  onSave: (changes: Record<string, unknown>) => void;
  onDiscontinue?: (dish: MenuItemType) => void;
}
