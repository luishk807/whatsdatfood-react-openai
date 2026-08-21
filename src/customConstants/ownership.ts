/**
 * Claiming a restaurant: the roles, and the limits the server also enforces.
 *
 * **The role vocabulary is the server's** - `CLAIM_ROLES` in `app/constants.py`
 * - and these three strings are what it accepts. A fourth invented here would
 * be rejected on submit, after somebody had filled in a whole form.
 *
 * **The verification methods are deliberately not here.** They come from
 * `verificationMethods(slug)`, so enabling a code-based method later changes
 * the wizard without a frontend release - the same reason the reputation
 * constants hold no point values. Only `manual` is enabled today.
 */
export const CLAIM_ROLES = [
  {
    value: "owner",
    label: "I own this restaurant",
    blurb: "You are the proprietor or a legal owner.",
  },
  {
    value: "manager",
    label: "I manage it",
    blurb: "You run the day to day and can speak for the business.",
  },
  {
    value: "representative",
    label: "I represent it",
    blurb: "You work with the restaurant - marketing, an agency, a group.",
  },
] as const;

export type ClaimRole = (typeof CLAIM_ROLES)[number]["value"];

export const CLAIM_LIMITS = {
  /**
   * Matches `MAX_CLAIM_EXPLANATION`. The server decides; this only saves
   * somebody writing nine hundred more characters that will be refused.
   */
  MAX_EXPLANATION: 1000,
} as const;
