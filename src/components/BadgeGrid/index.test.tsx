import { render, screen } from "@testing-library/react";
import BadgeGrid from "@/components/BadgeGrid";
import { BADGE_LABELS } from "@/customConstants/reputation";
import { BadgeType } from "@/interfaces/reputation";

const badge = (overrides: Partial<BadgeType> = {}): BadgeType => ({
  id: "dish_scout",
  name: "Dish Scout",
  description: "Upload photos of 10 different dishes.",
  icon: "dish_scout",
  earnedAt: null,
  progress: 7,
  target: 10,
  ...overrides,
});

describe("BadgeGrid", () => {
  it("shows unearned badges with how far along they are", () => {
    // The whole reason unearned badges are rendered at all: a badge you cannot
    // see yourself approaching is a surprise, not an incentive.
    render(<BadgeGrid badges={[badge()]} />);

    expect(screen.getByText("Dish Scout")).toBeInTheDocument();
    expect(screen.getByText(BADGE_LABELS.progress(7, 10))).toBeInTheDocument();
  });

  it("drops the progress line once a badge is earned", () => {
    render(
      <BadgeGrid
        badges={[badge({ earnedAt: "2026-08-01T00:00:00Z", progress: 10 })]}
      />,
    );

    expect(screen.getByText("Dish Scout")).toBeInTheDocument();
    expect(screen.queryByText(BADGE_LABELS.progress(10, 10))).toBeNull();
  });

  it("hides progress on somebody else's profile", () => {
    // How close a stranger is to something is their business.
    render(<BadgeGrid badges={[badge()]} showProgress={false} />);

    expect(screen.queryByText(BADGE_LABELS.progress(7, 10))).toBeNull();
  });

  it("carries the description as the instruction", () => {
    render(<BadgeGrid badges={[badge()]} />);

    expect(screen.getByTitle("Upload photos of 10 different dishes.")).toBeInTheDocument();
  });

  it("renders nothing when there are no badges", () => {
    const { container } = render(<BadgeGrid badges={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("draws a mark for every badge, earned or not", () => {
    // Placeholder art today; the component takes an icon key so the real
    // graphics drop in without touching this.
    const { container } = render(
      <BadgeGrid
        badges={[badge(), badge({ id: "first_bite", earnedAt: "2026-01-01" })]}
      />,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("never calls a badge money", () => {
    const { container } = render(<BadgeGrid badges={[badge()]} />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/[$€£]/);
    expect(text).not.toMatch(/points|redeem|wallet/i);
  });
});
