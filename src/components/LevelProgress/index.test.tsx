import { render, screen } from "@testing-library/react";
import LevelProgress from "@/components/LevelProgress";
import { ContributorLevelType } from "@/interfaces/reputation";

const hunter: ContributorLevelType = {
  key: "hunter",
  name: "Dish Hunter",
  floor: 300,
  next_name: "Local Foodie",
  next_at: 750,
  cred_to_next: 130,
  progress: (620 - 300) / (750 - 300),
};

const legend: ContributorLevelType = {
  key: "legend",
  name: "Food Legend",
  floor: 3000,
  next_name: null,
  next_at: null,
  cred_to_next: 0,
  progress: 1,
};

describe("LevelProgress", () => {
  it("shows the level, the total against the next threshold, and the gap", () => {
    render(<LevelProgress level={hunter} foodCred={620} />);

    expect(screen.getByText("Dish Hunter")).toBeInTheDocument();
    expect(screen.getByText("620 / 750")).toBeInTheDocument();
    expect(
      screen.getByText("130 Food Cred until Local Foodie"),
    ).toBeInTheDocument();
  });

  it("fills the bar across the current band, not from zero", () => {
    // 620 is 71% of the way from 300 to 750. Measured from zero it would read
    // 83% and every level would look nearly finished.
    render(<LevelProgress level={hunter} foodCred={620} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "71",
    );
  });

  it("promises nothing after the top level", () => {
    render(<LevelProgress level={legend} foodCred={4200} />);

    expect(screen.getByText("Top level reached")).toBeInTheDocument();
    expect(screen.queryByText(/until/)).not.toBeInTheDocument();
    // No "x / y" caption either: there is no y.
    expect(screen.queryByText(/\//)).not.toBeInTheDocument();
  });

  it("drops the caption when compact, keeping it on the bar's label", () => {
    render(<LevelProgress level={hunter} foodCred={620} compact />);

    expect(screen.queryByText("130 Food Cred until Local Foodie")).toBeNull();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "130 Food Cred until Local Foodie",
    );
  });
});
