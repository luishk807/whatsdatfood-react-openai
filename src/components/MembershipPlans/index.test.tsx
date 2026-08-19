import { render, screen } from "@testing-library/react";
import MembershipPlans from "@/components/MembershipPlans";
import { MEMBERSHIP_ENABLED, MEMBERSHIP_PLANS } from "@/customConstants/membership";
import { MEMBERSHIP_LABELS } from "@/customConstants/labels";
import { MembershipPlanType } from "@/interfaces/membership";

const plan = (over: Partial<MembershipPlanType> = {}): MembershipPlanType => ({
  id: "supporter",
  name: "Supporter",
  price: "$4/month",
  benefits: ["Keeps the lights on"],
  href: "https://pay.test/supporter",
  ...over,
});

describe("MembershipPlans", () => {
  describe("as shipped", () => {
    it("renders nothing, because nothing can be bought yet", () => {
      // A plan card with a price and no working button makes a claim about a
      // commercial relationship that does not exist.
      expect(MEMBERSHIP_PLANS).toHaveLength(0);
      expect(MEMBERSHIP_ENABLED).toBe(false);

      const { container } = render(<MembershipPlans />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("once a plan is configured", () => {
    it("shows it", () => {
      render(<MembershipPlans plans={[plan()]} />);

      expect(screen.getByText("Supporter")).toBeInTheDocument();
      expect(screen.getByText("$4/month")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: MEMBERSHIP_LABELS.choose("Supporter") }),
      ).toHaveAttribute("href", "https://pay.test/supporter");
    });

    it("gives a plan with no checkout no button at all", () => {
      // Half-configured must not ship a control that goes nowhere.
      render(<MembershipPlans plans={[plan({ href: undefined })]} />);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText(MEMBERSHIP_LABELS.notYet)).toBeInTheDocument();
    });

    it("says on the page what a membership does not buy", () => {
      // The two things it must never include, stated where somebody looking
      // at a price will read it — not only in a comment.
      render(<MembershipPlans plans={[plan()]} />);

      const disclosure = screen.getByText(MEMBERSHIP_LABELS.notForSale);

      expect(disclosure).toBeInTheDocument();
      expect(disclosure.textContent).toMatch(/earned, never bought/i);
      expect(disclosure.textContent).toMatch(/no moderation/i);
    });

    it("promises nothing about reputation in any plan", () => {
      // Belt and braces against the benefit list being written later by
      // somebody who has not read the rule.
      const forbidden = /food cred|badge|leaderboard|rank|moderat/i;

      MEMBERSHIP_PLANS.forEach((configured) =>
        configured.benefits.forEach((benefit) =>
          expect(benefit).not.toMatch(forbidden),
        ),
      );
    });
  });
});
