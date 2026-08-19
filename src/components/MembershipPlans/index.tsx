import { type FC } from "react";
import clsx from "clsx";
import { MEMBERSHIP_PLANS } from "@/customConstants/membership";
import { MEMBERSHIP_LABELS } from "@/customConstants/labels";
import { MembershipPlansInterface } from "@/interfaces/membership";

/**
 * Membership plans, when there are any.
 *
 * **Renders nothing when there are none**, which is today. A plan card with a
 * price on it and no working button would make a claim about a commercial
 * relationship that does not exist — a worse version of the mistake a dead
 * sign-in button makes, because that one only fails to open a door.
 *
 * The whole section is data: add an entry to `MEMBERSHIP_PLANS` and the page,
 * the footer link and the account row appear together. What a membership
 * actually gets is the hard part and is not a technical question, so nothing
 * here decides it.
 *
 * A plan whose `href` is missing renders without a button rather than with a
 * dead one — the same rule one level down, so a half-configured plan cannot
 * quietly ship a control that goes nowhere.
 */
const MembershipPlans: FC<MembershipPlansInterface> = ({
  plans = MEMBERSHIP_PLANS,
}) => {
  if (!plans.length) {
    return null;
  }

  return (
    <section
      className="flex flex-col gap-4"
      aria-labelledby="membership-plans"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="membership-plans"
          className="text-xl font-semibold tracking-tight text-ink"
        >
          {MEMBERSHIP_LABELS.title}
        </h2>
        <p className="text-sm text-ink-muted">{MEMBERSHIP_LABELS.blurb}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className={clsx(
              "flex flex-col gap-3 rounded-card border p-4",
              plan.highlighted
                ? "border-brand bg-brand-soft/30"
                : "border-line bg-surface-raised",
            )}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-ink">
                {plan.name}
              </span>
              <span className="text-sm text-ink-muted">{plan.price}</span>
            </div>

            <ul className="flex flex-1 flex-col gap-1.5 text-sm text-ink">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand">
                    ·
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {plan.href ? (
              <a
                href={plan.href}
                className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand px-4 text-sm font-medium text-white hover:bg-brand-strong"
              >
                {MEMBERSHIP_LABELS.choose(plan.name)}
              </a>
            ) : (
              // Half-configured: a plan with no checkout gets no button
              // rather than a button that does nothing.
              <p className="text-xs text-ink-muted">
                {MEMBERSHIP_LABELS.notYet}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Said on the page rather than only in a comment. Somebody reading
          this needs to know what they are not buying. */}
      <p className="text-xs leading-relaxed text-ink-muted">
        {MEMBERSHIP_LABELS.notForSale}
      </p>
    </section>
  );
};

export default MembershipPlans;
