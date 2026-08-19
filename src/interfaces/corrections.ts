import { QueueDecision } from "@/interfaces/ownership";

export interface MenuCorrectionType {
  id: string;
  dish_id: string;
  dish_name: string | null;
  restaurant_name: string | null;
  restaurant_slug: string | null;
  field: string;
  value: string;
  /** Null means the field was empty — an identification, not a correction. */
  previous_value: string | null;
  status: string;
  suggested_by: string | null;
  createdAt: string | null;
}

export interface SuggestCorrectionInterface {
  dishId: number;
  /** Absent when nobody is signed in; the control says so rather than failing. */
  canSuggest?: boolean;
  onSubmitted?: () => void;
}

export interface CorrectionQueueInterface {
  corrections: MenuCorrectionType[];
  loading?: boolean;
  onResolve: QueueDecision;
}
