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
  /**
   * What the photo claims to be. The question a report asks is "is this that
   * dish?", which cannot be answered from the picture on its own.
   */
  dish_name?: string | null;
  restaurant_name?: string | null;
  restaurant_slug?: string | null;
  photo?: {
    id?: string | number;
    url_m?: string | null;
    owner?: string | null;
    source?: string | null;
  } | null;
}

/**
 * A decision on one row of a review queue: approve or reject, keep or remove,
 * apply or dismiss. Async, so the row can say it is working and say so if it
 * was not.
 */
export type QueueDecision = (id: string, affirmative: boolean) => Promise<void>;

export interface ClaimListInterface {
  claims: RestaurantClaimType[];
  loading?: boolean;
  onManage?: (claim: RestaurantClaimType) => void;
}

export interface ClaimReviewInterface {
  claims: RestaurantClaimType[];
  loading?: boolean;
  onDecide: QueueDecision;
}

export interface ReportReviewInterface {
  reports: ReportedPhotoType[];
  loading?: boolean;
  onResolve: QueueDecision;
}

export interface QueueRowActionsInterface {
  id: string;
  /** The affirmative half: Approve, Keep, Apply. */
  affirmative: string;
  negative: string;
  busy?: boolean;
  failed?: boolean;
  /**
   * Puts a confirmation between the negative half and the decision. Removing
   * a photo is the only way one disappears, and it is one tap away on a phone.
   */
  destructive?: boolean;
  onDecide: QueueDecision;
}

export interface DishFactsFormInterface {
  dish: MenuItemType;
  saving?: boolean;
  onSave: (changes: Record<string, unknown>) => void;
  onDiscontinue?: (dish: MenuItemType) => void;
}

/**
 * A way of proving a connection to a restaurant, as the server offers it.
 *
 * `collects` drives which fields the wizard shows, so a method enabled later
 * asks for what it needs without a frontend change.
 */
export interface VerificationMethodType {
  key: string;
  label: string;
  blurb: string;
  collects: string[];
}

/** Everything the wizard gathers, in one submission. */
export interface ClaimSubmission {
  slug: string;
  role: string;
  verificationMethod: string;
  claimantName?: string;
  businessEmail?: string;
  businessPhone?: string;
  explanation?: string;
}

export interface ClaimWizardInterface {
  slug: string;
  restaurantName?: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export interface VerifiedBadgeInterface {
  verified?: boolean;
  className?: string;
}
