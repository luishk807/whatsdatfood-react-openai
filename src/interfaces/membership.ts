export interface MembershipPlanType {
  /** Matches `membership_tier` on the user row. */
  id: string;
  name: string;
  /** What somebody gets. Plain sentences, not feature-matrix ticks. */
  benefits: readonly string[];
  /**
   * Already formatted — "$4/month". A number plus a currency code invites
   * every call site to format it differently, and a price shown two ways in
   * one product is a support ticket.
   */
  price: string;
  /** Where the checkout lives. Absent means the plan cannot be bought yet. */
  href?: string;
  /** The one to draw attention to, if any. */
  highlighted?: boolean;
}

export interface MembershipPlansInterface {
  /** Defaults to the configured plans; injectable so the page is testable. */
  plans?: readonly MembershipPlanType[];
}
