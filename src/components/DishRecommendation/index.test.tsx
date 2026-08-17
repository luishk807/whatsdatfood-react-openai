import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DishRecommendation from "@/components/DishRecommendation";
import { RECOMMEND_LABELS, DISH_LABELS } from "@/customConstants/labels";
import { RANKING, VOTE } from "@/customConstants/ranking";
import { MenuItemType } from "@/interfaces/restaurants";

const dish = (ratings: number[]): MenuItemType =>
  ({
    id: 1,
    name: "Plain Pie",
    ratings: ratings.map((rating, index) => ({
      id: `${index}`,
      rating,
      user_id: index + 1,
    })),
  }) as unknown as MenuItemType;

const enough = RANKING.MIN_VOTES_TO_RANK;

describe("DishRecommendation", () => {
  it("leads with the share who would order it again", () => {
    render(<DishRecommendation item={dish([5, 5, 5, 5, 1])} />);

    expect(screen.getByText(RECOMMEND_LABELS.share(80))).toBeInTheDocument();
    expect(screen.getByText(RECOMMEND_LABELS.votes(5))).toBeInTheDocument();
  });

  it("shows the count instead when too few have voted", () => {
    // "100% recommend" from one person is a lie with a number attached.
    render(<DishRecommendation item={dish([5])} />);

    expect(screen.getByText(RECOMMEND_LABELS.tooFew(1))).toBeInTheDocument();
    expect(screen.queryByText(/recommend this/)).not.toBeInTheDocument();
  });

  it("says so when nobody has voted", () => {
    render(<DishRecommendation item={dish([])} />);

    expect(screen.getByText(RECOMMEND_LABELS.tooFew(0))).toBeInTheDocument();
  });

  it("offers both directions here, unlike the card", () => {
    render(<DishRecommendation item={dish([])} canVote />);

    // The card carries one control; the sheet is where someone has stopped
    // to consider a single dish.
    expect(screen.getByLabelText(DISH_LABELS.voteUp)).toBeInTheDocument();
    expect(screen.getByLabelText(DISH_LABELS.voteDown)).toBeInTheDocument();
  });

  it("reports the vote", async () => {
    const onVote = jest.fn();
    render(<DishRecommendation item={dish([])} canVote onVote={onVote} />);

    await userEvent.click(screen.getByLabelText(DISH_LABELS.voteUp));

    expect(onVote).toHaveBeenCalledWith(VOTE.up);
  });

  it("asks people to sign in rather than failing silently", () => {
    render(<DishRecommendation item={dish([])} />);

    expect(screen.getByText(DISH_LABELS.signInToVote)).toBeInTheDocument();
    expect(screen.getByLabelText(DISH_LABELS.voteUp)).toBeDisabled();
  });

  it("shows the viewer's existing vote", () => {
    render(
      <DishRecommendation item={dish([])} canVote vote={VOTE.up} />,
    );

    expect(screen.getByLabelText(DISH_LABELS.voteUp)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows a full recommendation without rounding oddly", () => {
    render(<DishRecommendation item={dish(Array(enough).fill(5))} />);

    expect(screen.getByText(RECOMMEND_LABELS.share(100))).toBeInTheDocument();
  });
});
