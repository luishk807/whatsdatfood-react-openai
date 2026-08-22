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
