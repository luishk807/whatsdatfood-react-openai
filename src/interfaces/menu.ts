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
  /**
   * True when extraction produced nothing at all, so the control asks for the
   * menu rather than for a correction to one.
   */
  empty?: boolean;
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

/**
 * Where a restaurant's menu has got to.
 *
 * `ready` - there are dishes. `pending` - being worked out now. `unavailable`
 * - we tried and could not read one, or are not going to. The third is not an
 * error: most restaurants in the world have no menu online, and the page is
 * still worth reading without one.
 */
export interface MenuStatusType {
  state: "ready" | "pending" | "unavailable";
  dish_count: number;
  working: boolean;
  /**
   * Whether asking again could produce a different answer.
   *
   * Owned by the server, like the trending threshold: "has this restaurant
   * used up its attempts" is a rule about our data, and a copy of it in the
   * browser is a second source of truth and the one that goes stale.
   */
  retryable: boolean;
  /** `official` | `community` | `partial` | `unavailable`. */
  availability: string;
}

export interface MenuStatusPanelInterface {
  state?: MenuStatusType["state"];
  /** Past the point where "a few seconds" is an honest thing to say. */
  slow?: boolean;
  /** False once the restaurant has no attempts left, so no button is drawn. */
  retryable?: boolean;
  onRetry?: () => void;
}

export interface MenuMissingInterface {
  /**
   * Opens the camera for a photograph of the menu itself.
   *
   * Optional, and absent renders no button: a control that opens a camera and
   * then has nowhere to send the photograph is worse than one that is not
   * there, because it spends somebody's goodwill on a dead end. The
   * restaurant-level menu photo needs a store and a moderation path of its
   * own, and until those exist the dish contribution below is the working
   * way in.
   */
  /**
   * Receives the chosen file. The control itself is `PhotoUploadAction`,
   * which owns the hidden input, `capture` and the reset that lets the same
   * file be chosen twice — four copies of that is how one entry point quietly
   * stops opening the camera.
   */
  onSelectPhoto?: (file: File) => void;
  uploading?: boolean;
  /** The photograph is with us and waiting to be checked. Said as queued,
   *  never as published. */
  queued?: boolean;
  /** The server's own words about a refusal — each explains what to do
   *  differently, and a generic failure explains none of them. */
  error?: string | null;
}

export interface MenuProvenanceInterface {
  /** `official` | `community` | `partial` | `unavailable`. */
  availability: string;
}
