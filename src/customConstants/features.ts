/**
 * Feature keys, matching `app/services/features.py`.
 *
 * The server decides; this is only the spelling. A component asks
 * `useFeature(FEATURES.pro)` and never reads an environment variable — the
 * frontend is a static bundle, so a flag baked into it at build time could
 * only be changed by a deployment, which is exactly what launching Pro must
 * not require.
 */
export const FEATURES = {
  pro: "pro",
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

/** The three states, for the admin console. Mirrors the server's strings. */
export const FEATURE_STATUS = {
  hidden: "hidden",
  internalTesting: "internal_testing",
  live: "live",
} as const;
