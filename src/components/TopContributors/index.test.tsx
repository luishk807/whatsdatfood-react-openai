import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TopContributors from "@/components/TopContributors";
import { LEADERBOARD_LABELS } from "@/customConstants/reputation";
import { StandingType } from "@/interfaces/reputation";

const standings: StandingType[] = [
  { username: "luis", display_name: "Luis", cred: 420 },
  { username: "sarah", display_name: "Sarah", cred: 315 },
  { username: "mike", display_name: "Mike", cred: 180 },
  { username: "ana", display_name: "Ana", cred: 90 },
];

const show = (props: Partial<React.ComponentProps<typeof TopContributors>> = {}) =>
  render(
    <MemoryRouter>
      <TopContributors standings={standings} {...props} />
    </MemoryRouter>,
  );

describe("TopContributors", () => {
  it("ranks contributors with the Cred they earned here", () => {
    show();

    expect(screen.getByText("Luis")).toBeInTheDocument();
    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
  });

  it("shows three and offers the rest behind a link", () => {
    // A full ranking above the menu inverts the page: the food is the point
    // and this supports it.
    show();

    expect(screen.queryByText("Ana")).toBeNull();
    expect(
      screen.getByRole("button", { name: LEADERBOARD_LABELS.viewAll }),
    ).toBeInTheDocument();
  });

  it("opens the full list on request", async () => {
    const onViewAll = jest.fn();
    show({ onViewAll });

    await userEvent.click(
      screen.getByRole("button", { name: LEADERBOARD_LABELS.viewAll }),
    );

    expect(onViewAll).toHaveBeenCalled();
  });

  it("links each contributor to their public profile", () => {
    show();

    expect(screen.getByRole("link", { name: "Luis" })).toHaveAttribute(
      "href",
      "/contributor/luis",
    );
  });

  it("marks the champion, and only the champion", () => {
    show({ champion: { username: "luis", display_name: "Luis", cred: 420 } });

    expect(
      screen.getAllByText(LEADERBOARD_LABELS.champion),
    ).toHaveLength(1);
  });

  it("shows no champion badge when nobody holds the title", () => {
    show({ champion: null });

    expect(screen.queryByText(LEADERBOARD_LABELS.champion)).toBeNull();
  });

  it("renders nothing before anybody has contributed here", () => {
    // Same rule as the "most loved" strip: a heading that claims something the
    // data has not earned is worse than no section.
    const { container } = render(
      <MemoryRouter>
        <TopContributors standings={[]} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while loading", () => {
    const { container } = render(
      <MemoryRouter>
        <TopContributors standings={[]} loading />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("never calls the number money", () => {
    const { container } = show();
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/[$€£]/);
    expect(text).not.toMatch(/points|balance|wallet|redeem/i);
  });
});
