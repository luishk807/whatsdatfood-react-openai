import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DishCard from "@/components/DishCard";
import { MenuItemType, MenuItemPhoto } from "@/interfaces/restaurants";
import { DishScore } from "@/interfaces/ranking";
import { VOTE, RANKING } from "@/customConstants/ranking";
import { DISH_LABELS, RANKING_LABELS } from "@/customConstants/labels";

const photo = (url: string): MenuItemPhoto => ({ url_m: url }) as MenuItemPhoto;

const dish = (extra: Partial<MenuItemType> = {}): MenuItemType => ({
  id: 42,
  name: "Single Steak",
  description: "A steak, singular",
  category: "Mains",
  top_choice: false,
  price: 24.5,
  ...extra,
});

const score = (extra: Partial<DishScore> = {}): DishScore => ({
  id: 42,
  score: 3.2,
  average: 3.3,
  voteCount: 2,
  isRanked: false,
  ...extra,
});

describe("DishCard", () => {
  it("shows the dish name and a formatted price", () => {
    render(<DishCard item={dish()} />);

    expect(screen.getByText("Single Steak")).toBeInTheDocument();
    expect(screen.getByText("$24.50")).toBeInTheDocument();
  });

  it("omits the price rather than printing $0.00 when there is none", () => {
    render(<DishCard item={dish({ price: undefined })} />);

    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
  });

  it("shows a vote count instead of a rank while votes are thin", () => {
    render(<DishCard item={dish()} score={score({ voteCount: 3 })} />);

    expect(
      screen.getByText(RANKING_LABELS.voteCount(3)),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(RANKING_LABELS.topStripTitle),
    ).not.toBeInTheDocument();
  });

  it("badges the dish only once it is genuinely ranked", () => {
    render(
      <DishCard
        item={dish()}
        score={score({ voteCount: RANKING.MIN_VOTES_TO_RANK, isRanked: true })}
      />,
    );

    expect(screen.getByText(RANKING_LABELS.topStripTitle)).toBeInTheDocument();
  });

  it("marks an AI suggestion as unverified rather than ranked", () => {
    render(<DishCard item={dish({ top_choice: true })} />);

    expect(
      screen.getByText(DISH_LABELS.popularUnverified),
    ).toBeInTheDocument();
  });

  it("renders the photo when the menu carried one", () => {
    render(
      <DishCard
        item={dish({ images: [photo("https://example.test/steak.jpg")] })}
      />,
    );

    expect(screen.getByAltText("Single Steak")).toHaveAttribute(
      "src",
      "https://example.test/steak.jpg",
    );
  });

  it("offers an upload when there is no photo yet", async () => {
    const onAddPhoto = jest.fn();
    render(<DishCard item={dish()} onAddPhoto={onAddPhoto} />);

    expect(screen.getByText(DISH_LABELS.noPhoto)).toBeInTheDocument();

    await userEvent.click(screen.getByText(DISH_LABELS.addPhoto));
    expect(onAddPhoto).toHaveBeenCalledWith(dish());
  });

  it("passes the dish back with the vote", async () => {
    const onVote = jest.fn();
    render(<DishCard item={dish()} canVote onVote={onVote} />);

    await userEvent.click(screen.getByLabelText(DISH_LABELS.voteUp));

    expect(onVote).toHaveBeenCalledWith(dish(), VOTE.up);
  });

  it("opens the detail view when the photo is tapped", async () => {
    const onOpen = jest.fn();
    render(<DishCard item={dish()} onOpen={onOpen} />);

    await userEvent.click(screen.getByRole("button", { name: "Single Steak" }));

    expect(onOpen).toHaveBeenCalledWith(dish());
  });
});
