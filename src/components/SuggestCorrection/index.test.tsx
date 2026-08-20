import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestCorrection from "@/components/SuggestCorrection";
import { CORRECTION_LABELS } from "@/customConstants/labels";

const suggest = jest.fn().mockResolvedValue(true);
const clearError = jest.fn();
let error: string | null = null;

jest.mock("@/customHooks/useMenuCorrections", () => ({
  __esModule: true,
  default: () => ({ suggest, error, clearError }),
}));

const open = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: CORRECTION_LABELS.open }),
  );
};

describe("SuggestCorrection", () => {
  beforeEach(() => {
    suggest.mockClear().mockResolvedValue(true);
    error = null;
  });

  it("stays out of the way until somebody thinks something is wrong", () => {
    // A repair tool, not a call to action. It must not compete with the
    // photograph or the vote, which are what the sheet is for.
    render(<SuggestCorrection dishId={1} canSuggest />);

    expect(
      screen.getByRole("button", { name: CORRECTION_LABELS.open }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(CORRECTION_LABELS.value)).toBeNull();
  });

  it("says nothing changes on the strength of one suggestion", async () => {
    // Otherwise it reads as a broken edit button.
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    expect(screen.getByText(CORRECTION_LABELS.blurb)).toBeInTheDocument();
  });

  it("offers only the reasons the server will accept", async () => {
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    const options = screen
      .getAllByRole("option")
      .map((o) => (o as HTMLOptionElement).value);

    // Four fields that propose a value, then three flags about the dish
    // itself. Pinned as a whole list rather than a contains-check, so adding
    // a reason to the UI that the server would refuse fails here.
    expect(options).toEqual([
      "name",
      "description",
      "price",
      "category",
      "availability",
      "duplicate",
      "other",
    ]);
  });

  it("lets a flag be sent without a note", async () => {
    // "This is gone" is complete on its own, and the reports worth having
    // most are made by somebody standing up to leave. A required text box
    // loses them.
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    await userEvent.selectOptions(screen.getByRole("combobox"), "availability");

    expect(
      screen.getByRole("button", { name: CORRECTION_LABELS.submit }),
    ).toBeEnabled();
  });

  it("still requires one for \"something else\"", async () => {
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    await userEvent.selectOptions(screen.getByRole("combobox"), "other");

    expect(
      screen.getByRole("button", { name: CORRECTION_LABELS.submit }),
    ).toBeDisabled();
  });

  it("drops the allergen note once the reason is not a field", async () => {
    // It explains which *fields* are missing from the list. Beside "listed
    // twice" it is a non-sequitur.
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    expect(screen.getByText(CORRECTION_LABELS.dietaryNote)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox"), "duplicate");

    expect(
      screen.queryByText(CORRECTION_LABELS.dietaryNote),
    ).not.toBeInTheDocument();
  });

  it("never offers an allergen field, and says why", async () => {
    // The single most important refusal in this feature. Allergens are the
    // biggest gap in the data and the one field where being wrong can hurt
    // somebody.
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    const options = screen
      .getAllByRole("option")
      .map((o) => (o as HTMLOptionElement).value);

    for (const banned of [
      "contains_nuts",
      "is_vegetarian",
      "is_vegan",
      "is_gluten_free",
      "contains_shellfish",
      "contains_dairy",
      "spice_level",
    ]) {
      expect(options).not.toContain(banned);
    }

    expect(screen.getByText(CORRECTION_LABELS.dietaryNote)).toBeInTheDocument();
  });

  it("sends what was typed", async () => {
    render(<SuggestCorrection dishId={42} canSuggest />);
    await open();

    await userEvent.type(
      screen.getByLabelText(CORRECTION_LABELS.value),
      "Beef Short Rib",
    );
    await userEvent.click(
      screen.getByRole("button", { name: CORRECTION_LABELS.submit }),
    );

    expect(suggest).toHaveBeenCalledWith(42, "name", "Beef Short Rib");
  });

  it("will not send an empty suggestion", async () => {
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    expect(
      screen.getByRole("button", { name: CORRECTION_LABELS.submit }),
    ).toBeDisabled();
  });

  it("thanks rather than claiming the change was made", async () => {
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();
    await userEvent.type(screen.getByLabelText(CORRECTION_LABELS.value), "x");
    await userEvent.click(
      screen.getByRole("button", { name: CORRECTION_LABELS.submit }),
    );

    expect(await screen.findByText(CORRECTION_LABELS.sent)).toBeInTheDocument();
  });

  it("shows the server's refusal verbatim", async () => {
    // Each one explains a rule — a duplicate already queued, an allergen
    // field, an unparseable price. Rewording them loses that.
    error = "You have already suggested a change to that.";
    render(<SuggestCorrection dishId={1} canSuggest />);
    await open();

    expect(
      screen.getByText("You have already suggested a change to that."),
    ).toBeInTheDocument();
  });

  it("asks a signed-out reader to sign in rather than failing", async () => {
    render(<SuggestCorrection dishId={1} canSuggest={false} />);
    await open();

    expect(screen.getByText(CORRECTION_LABELS.signIn)).toBeInTheDocument();
    expect(suggest).not.toHaveBeenCalled();
  });
});
