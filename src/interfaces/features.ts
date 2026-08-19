export interface FeatureStatusType {
  feature: string;
  /** "hidden" | "internal_testing" | "live" — the server's spelling. */
  status: string;
}
