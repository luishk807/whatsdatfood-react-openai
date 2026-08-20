/**
 * Changing a menu, from the browser's side.
 *
 * Every one of these mirrors a server type rather than deriving anything. The
 * server owns whether a dish is verified, who added it and what order the
 * sections are in; a second opinion held here is a second source of truth.
 */

export interface ManagedDishType {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  category?: string | null;
  /** `ai_extracted`, `community`, `restaurant_owner`, `admin`. */
  source?: string | null;
  /** `unverified`, `pending`, `approved`, `rejected`, `owner_verified`. */
  verification_status?: string | null;
  is_available?: boolean;
  sort_order?: number;
  /** The diner who added it. Null for the extracted majority. */
  added_by?: string | null;
  restaurant?: { slug?: string | null; name?: string | null } | null;
}

export interface MenuCategoryType {
  id: string;
  name: string;
  position: number;
  dish_count: number;
}

export interface OwnerMenuType {
  slug: string;
  name: string;
  menu_verified_at?: string | null;
  menu_updated_at?: string | null;
  pending_count: number;
  dishes: ManagedDishType[];
  categories: MenuCategoryType[];
}

export interface MenuRevisionType {
  id: string;
  action: string;
  field?: string | null;
  previous_value?: string | null;
  new_value?: string | null;
  note?: string | null;
  by?: string | null;
  created_at?: string | null;
}

export interface SubmitDishInput {
  slug: string;
  name: string;
  category: string;
  price?: number | null;
  description?: string | null;
}

export interface AddDishFormInterface {
  slug: string;
  /** Offered as suggestions, so a contributor files under a section that
   * already exists rather than inventing "Starters" beside "Small plates". */
  sections: string[];
  onClose: () => void;
  onAdded?: (dish: ManagedDishType) => void;
}

export interface AddDishActionInterface {
  slug: string;
  sections: string[];
  /** Somebody signed out is shown the ask and sent to sign in, never a form
   * that fails on submit. */
  canContribute: boolean;
  onAdded?: (dish: ManagedDishType) => void;
}

export interface DishProvenanceInterface {
  source?: string | null;
  verification_status?: string | null;
  is_available?: boolean;
  added_by?: string | null;
  /** Cards have no room for a sentence; the sheet does. */
  compact?: boolean;
}

export interface MenuTrustInterface {
  verifiedAt?: string | null;
  updatedAt?: string | null;
}

export interface ManageMenuInterface {
  slug: string;
}

export interface ManageDishRowInterface {
  dish: ManagedDishType;
  busy?: boolean;
  onAvailability: (dish: ManagedDishType, available: boolean) => void;
  onArchive: (dish: ManagedDishType) => void;
  onApprove?: (dish: ManagedDishType, approve: boolean) => void;
}

export interface MenuSectionsEditorInterface {
  slug: string;
  categories: MenuCategoryType[];
  onSaved: (categories: MenuCategoryType[]) => void;
}

export interface DishSubmissionQueueInterface {
  submissions: ManagedDishType[];
  loading?: boolean;
  /** `(id, approve)`, the same shape every other queue here uses. */
  onDecide: (dishId: string, approve: boolean) => Promise<void>;
}
