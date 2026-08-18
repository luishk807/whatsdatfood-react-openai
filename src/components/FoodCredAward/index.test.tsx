import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FoodCredAward from "@/components/FoodCredAward";
import { AWARD_VISIBLE_MS } from "@/customConstants/reputation";

const discovery = {
  earned: 30,
  events: [
    { type: "PHOTO_APPROVED", points: 10, label: "Photo" },
    { type: "FIRST_DISH_PHOTO", points: 20, label: "First photo of this dish" },
  ],
};

describe("FoodCredAward", () => {
  it("shows the total and breaks it down", () => {
    // "+30" alone invites the question. The breakdown answers it and teaches
    // the rules without a help page.
    render(<FoodCredAward award={discovery} onDismiss={jest.fn()} />);

    expect(screen.getByText("+30")).toBeInTheDocument();
    expect(screen.getByText("First dish discovery!")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("First photo of this dish")).toBeInTheDocument();
  });

  it("does not itemise a single award", () => {
    render(
      <FoodCredAward
        award={{
          earned: 10,
          events: [{ type: "PHOTO_APPROVED", points: 10, label: "Photo" }],
        }}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText("Photo approved")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("renders nothing when nothing was earned", () => {
    // A duplicate upload succeeds and earns nothing. Announcing "+0" would
    // claim it was a contribution.
    const { container } = render(
      <FoodCredAward award={{ earned: 0, events: [] }} onDismiss={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("announces itself politely rather than stealing focus", () => {
    render(<FoodCredAward award={discovery} onDismiss={jest.fn()} />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("can be dismissed", async () => {
    const onDismiss = jest.fn();
    render(<FoodCredAward award={discovery} onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismiss).toHaveBeenCalled();
  });

  it("gets out of the way on its own", () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    try {
      render(<FoodCredAward award={discovery} onDismiss={onDismiss} />);
      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(AWARD_VISIBLE_MS);
      });

      expect(onDismiss).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
