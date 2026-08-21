import { render, screen } from "@testing-library/react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { MEMBERSHIP_LABELS, VERIFIED_LABELS } from "@/customConstants/labels";

/**
 * The verified-business mark.
 *
 * It says who manages the page, not how good the food is - and it cannot be
 * bought. Both of those are load-bearing: this product has exactly one
 * ranking claim, the community vote, and a mark that read as a quality rating
 * or that somebody could pay for would sit right beside it undermining it.
 */
describe("when a restaurant is managed", () => {
  it("says so", () => {
    render(<VerifiedBadge verified />);

    expect(screen.getByText(VERIFIED_LABELS.badge)).toBeInTheDocument();
  });

  it("explains itself rather than leaving a tick to interpret", () => {
    render(<VerifiedBadge verified />);

    expect(screen.getByTitle(VERIFIED_LABELS.explain)).toBeInTheDocument();
  });
});

describe("when it is not", () => {
  it("renders nothing at all", () => {
    // Absent, never greyed. Most restaurants have no owner and never will, so
    // a dimmed "not verified" mark would be a complaint about the catalogue
    // printed on every restaurant in it.
    const { container } = render(<VerifiedBadge verified={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the server said nothing", () => {
    const { container } = render(<VerifiedBadge />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("what it must never claim", () => {
  it("says nothing about the food", () => {
    // "Verified" beside a restaurant's name reads as a quality rating if the
    // wording lets it. The one ranking claim this product makes is the vote.
    const copy = Object.values(VERIFIED_LABELS).join(" ").toLowerCase();

    for (const word of ["best", "top", "quality", "recommended", "approved"]) {
      expect(copy).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });

  it("is not something a membership sells", () => {
    // Belt and braces beside the server-side test: a plan that could grant
    // this would be selling the thing the mark certifies.
    const plans = JSON.stringify(MEMBERSHIP_LABELS).toLowerCase();

    expect(plans).not.toContain("verified business");
  });
});
