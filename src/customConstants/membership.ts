import { MembershipPlanType } from "@/interfaces/membership";

/**
 * Membership plans.
 *
 * **Empty, and everything that draws them is built.** Add an entry and the
 * plans page, the footer link and the account row appear; leave it empty and
 * none of them render at all.
 *
 * It is empty because there is no way to pay. No billing integration, no
 * checkout, no provider. A plan card with a price on it and no working button
 * is worse than an absent one in a way the dead Google button was not: that
 * one failed to open a door, this one would make a claim about a commercial
 * relationship that does not exist. Same rule, higher stakes.
 *
 * Turning it on needs, in this order: a payment provider, a webhook that
 * writes `membership_tier` and `membership_expires_at`, and a decision about
 * what a membership actually gets — which is the hard part and is not a
 * technical question.
 *
 * **Two things a plan must never include**, and both are load-bearing:
 *
 * - *Food Cred, badges or leaderboard position.* Reputation is earned by
 *   photographing food and being useful. A leaderboard somebody can pay to
 *   enter is not a leaderboard, and the ranking is the product.
 * - *Anything a role decides.* Moderation, claim decisions, photo removal.
 *   Membership is what somebody paid for; a role is what they are allowed to
 *   do to other people's work. The database keeps them in separate columns
 *   for the same reason.
 */
export const MEMBERSHIP_PLANS: readonly MembershipPlanType[] = [];

/**
 * Whether the section exists at all. One check, so no component has to know
 * that "no plans" and "no membership feature" are the same thing today.
 */
export const MEMBERSHIP_ENABLED = MEMBERSHIP_PLANS.length > 0;
