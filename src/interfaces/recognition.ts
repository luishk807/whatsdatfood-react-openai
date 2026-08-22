import {
  RecognitionAwardType,
  RecognitionKindType,
} from "@/customConstants/recognition";

/**
 * A reason a restaurant is worth attention, and who says so.
 *
 * Mirrors the row: the server sends the award and the provenance, never the
 * words. `kind` is what keeps somebody else's judgement and our own from
 * being drawn as the same thing.
 */
export interface RecognitionType {
  kind: RecognitionKindType;
  award: RecognitionAwardType | string;
  /** "michelin", "whatsdatfood". Named so a second guide needs no new field. */
  source: string;
  /** The edition. Absent for our own signals, which describe now. */
  year?: number | null;
  /** Where a reader could check it — required by some guides' terms. */
  reference_url?: string | null;
}

export interface RecognitionBadgesInterface {
  recognitions?: RecognitionType[] | null;
  /**
   * How many to draw. Cards get two; a restaurant's own page shows the lot.
   */
  limit?: number;
  /** Cards sit tighter than a detail page. */
  compact?: boolean;
}

/** The admin view of a row: everything, including what is not public. */
export interface AdminRecognitionType extends RecognitionType {
  id: string;
  level?: number | null;
  status: string;
  verified_at?: string | null;
  review_due_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  internal_notes?: string | null;
}

export interface NewRecognitionType {
  award: string;
  source: string;
  referenceUrl: string;
  year?: number | null;
  internalNotes?: string | null;
}

export interface RecognitionQueueInterface {
  recognitions: AdminRecognitionType[];
  loading?: boolean;
  /** Which row is mid-decision, so its buttons can be disabled. */
  busyId?: string | null;
  /** A server refusal, shown verbatim — each one explains a rule. */
  error?: string | null;
  onAdd: (fields: NewRecognitionType) => Promise<void>;
  /**
   * Amend one. The same fields as adding, because they are the same facts —
   * a second form would be a second place for the rules to drift.
   */
  onEdit: (id: string, fields: NewRecognitionType) => Promise<void>;
  onVerify: (id: string) => Promise<void>;
  onUnpublish: (id: string) => Promise<void>;
  onExpire: (id: string) => Promise<void>;
}
