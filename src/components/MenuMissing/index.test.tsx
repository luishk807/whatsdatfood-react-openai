import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuMissing from "@/components/MenuMissing";
import { MENU_MISSING_LABELS } from "@/customConstants/labels";

/**
 * The page for a restaurant with no menu.
 *
 * Most restaurants in the world do not publish one, so on this catalogue this
 * is the ordinary outcome rather than a failure — and a page that reads as
 * broken is a page nobody contributes to.
 */
describe("what it says", () => {
  it("names the absence plainly", () => {
    render(<MenuMissing />);

    expect(screen.getByText(MENU_MISSING_LABELS.title)).toBeInTheDocument();
    expect(screen.getByText(MENU_MISSING_LABELS.body)).toBeInTheDocument();
  });

  it("invites the reader to help", () => {
    render(<MenuMissing />);

    expect(screen.getByText(MENU_MISSING_LABELS.invite)).toBeInTheDocument();
  });

  it("never mentions the extractor", () => {
    // `zero_valid_dishes` is our vocabulary, not the reader's. Somebody at a
    // table wants to know whether food is listed, not how our pipeline works.
    render(<MenuMissing />);

    const copy = (document.body.textContent ?? "").toLowerCase();

    for (const word of ["extract", "ai", "openai", "zero", "error", "failed"]) {
      expect(copy).not.toContain(word);
    }
  });

  it("never reads as an error", () => {
    render(<MenuMissing />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("the camera path", () => {
  it("offers a photo control when there is somewhere to send it", async () => {
    const onAddPhoto = jest.fn();

    render(<MenuMissing onAddPhoto={onAddPhoto} />);

    await userEvent.click(
      screen.getByRole("button", { name: MENU_MISSING_LABELS.photo }),
    );

    expect(onAddPhoto).toHaveBeenCalled();
  });

  it("offers none when there is not", () => {
    // A button that opens a camera and then has nowhere to send the
    // photograph spends somebody's goodwill on a dead end.
    render(<MenuMissing />);

    expect(
      screen.queryByRole("button", { name: MENU_MISSING_LABELS.photo }),
    ).not.toBeInTheDocument();
  });

  it("does not duplicate the dish control", () => {
    // `AddDishAction` sits directly below with its own control and sheet,
    // already worded for a restaurant with no menu. Two buttons doing one
    // thing is two things to keep in step.
    render(<MenuMissing onAddPhoto={jest.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
