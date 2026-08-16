import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VoteButton from "@/components/VoteButton";
import { VOTE } from "@/customConstants/ranking";
import { DISH_LABELS } from "@/customConstants/labels";

describe("VoteButton", () => {
  it("reports the current vote through aria-pressed", () => {
    render(<VoteButton value={VOTE.up} />);

    expect(screen.getByLabelText(DISH_LABELS.voteUp)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText(DISH_LABELS.voteDown)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("sends the up value on a single tap", async () => {
    const onVote = jest.fn();
    render(<VoteButton onVote={onVote} />);

    await userEvent.click(screen.getByLabelText(DISH_LABELS.voteUp));

    expect(onVote).toHaveBeenCalledWith(VOTE.up);
    expect(onVote).toHaveBeenCalledTimes(1);
  });

  it("sends the down value on the other button", async () => {
    const onVote = jest.fn();
    render(<VoteButton onVote={onVote} />);

    await userEvent.click(screen.getByLabelText(DISH_LABELS.voteDown));

    expect(onVote).toHaveBeenCalledWith(VOTE.down);
  });

  it("cannot be voted with while signed out", async () => {
    const onVote = jest.fn();
    render(<VoteButton disabled onVote={onVote} />);

    const up = screen.getByLabelText(DISH_LABELS.voteUp);
    expect(up).toBeDisabled();
    expect(up).toHaveAttribute("title", DISH_LABELS.signInToVote);

    await userEvent.click(up);
    expect(onVote).not.toHaveBeenCalled();
  });

  it("shows an up count only when there is one", () => {
    const { rerender } = render(<VoteButton upCount={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();

    rerender(<VoteButton upCount={12} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
