/**
 * What an admin can conclude about a flagged pair.
 *
 * **None of these merge or delete anything.** `confirmed` records that
 * somebody decided two rows are one restaurant; moving photographs, votes and
 * menu items between them safely is its own piece of work, and doing it badly
 * loses contributions permanently. The pair stays on record, marked, until
 * that tooling exists.
 */
export const DUPLICATE_STATUS = {
  pending: "pending",
  confirmed: "duplicate",
  rejected: "not_duplicate",
  dismissed: "dismissed",
} as const;

export type DuplicateStatusType =
  (typeof DUPLICATE_STATUS)[keyof typeof DUPLICATE_STATUS];
