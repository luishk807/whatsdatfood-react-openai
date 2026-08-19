import { UserType } from "@/interfaces/users";

/**
 * What somebody has paid for.
 *
 * One function, so a gate is never written as `user.membership_tier === "x"`
 * scattered through components — that is how a tier rename becomes a
 * fortnight of grep.
 *
 * The server decides. `membership_tier` is read-only on the GraphQL type,
 * there is no mutation that sets it, and an expired membership is already
 * reported as absent — so this never has to know about dates.
 */
export const membershipOf = (
  user: Pick<UserType, "membership_tier"> | null | undefined,
): string | null => user?.membership_tier?.trim() || null;

export const isMember = (
  user: Pick<UserType, "membership_tier"> | null | undefined,
): boolean => membershipOf(user) !== null;
