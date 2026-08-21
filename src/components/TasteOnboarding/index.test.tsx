import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TasteOnboarding from "@/components/TasteOnboarding";
import { TASTE_LABELS } from "@/customConstants/labels";
import { TASTE_PROMPT_STORAGE_KEY } from "@/customConstants/tastes";

/**
 * Asking once, on the front door.
 *
 * Every assertion here is about restraint. The card appears when it can be
 * useful, disappears the moment it is answered, and after a skip becomes one
 * line that does not ask again. A preference prompt that reappears on every
 * visit is how an optional feature makes an application feel like a form.
 */
const tastes = {
  categories: [
    { slug: "coffee", name: "Coffee", kind: "food", display_order: 10 },
    { slug: "sushi", name: "Sushi", kind: "food", display_order: 20 },
  ],
  preferences: [] as unknown[],
  selected: [] as string[],
  save: jest.fn(async () => true),
  saving: false,
  saved: false,
  error: null as string | null,
  loading: false,
};

jest.mock("@/customHooks/useTastePreferences", () => ({
  __esModule: true,
  default: () => tastes,
}));

const show = (hasLocation: boolean) =>
  render(
    <MemoryRouter>
      <TasteOnboarding hasLocation={hasLocation} />
    </MemoryRouter>,
  );

beforeEach(() => {
  window.localStorage.clear();
  tastes.selected = [];
  tastes.save.mockClear();
});

describe("when to ask", () => {
  it("does not ask before there is a location", () => {
    // "Coffee near you" is a promise the page cannot keep without somewhere
    // to look, and asking first is asking before the reader has seen what the
    // answer buys them.
    const { container } = show(false);

    expect(container).toBeEmptyDOMElement();
  });

  it("asks once there is one", () => {
    show(true);

    expect(screen.getByText(TASTE_LABELS.title)).toBeInTheDocument();
  });

  it("says nothing to somebody who has already chosen", () => {
    tastes.selected = ["coffee"];

    const { container } = show(true);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("skipping", () => {
  it("does not block anything", async () => {
    show(true);

    await userEvent.click(
      screen.getByRole("button", { name: TASTE_LABELS.skip }),
    );

    expect(screen.queryByText(TASTE_LABELS.title)).not.toBeInTheDocument();
  });

  it("leaves one quiet line rather than nothing", async () => {
    // Somebody who skipped may change their mind, and a feature with no way
    // back is a feature they cannot reach.
    show(true);

    await userEvent.click(
      screen.getByRole("button", { name: TASTE_LABELS.skip }),
    );

    expect(
      screen.getByRole("link", { name: new RegExp(TASTE_LABELS.reminder) }),
    ).toBeInTheDocument();
  });

  it("remembers the skip, so the card does not return next visit", async () => {
    show(true);

    await userEvent.click(
      screen.getByRole("button", { name: TASTE_LABELS.skip }),
    );

    expect(
      window.localStorage.getItem(TASTE_PROMPT_STORAGE_KEY),
    ).toContain("dismissed");
  });
});

describe("saving", () => {
  it("records what was chosen", async () => {
    show(true);

    await userEvent.click(screen.getByRole("button", { name: "Coffee" }));
    await userEvent.click(
      screen.getByRole("button", { name: TASTE_LABELS.save }),
    );

    expect(tastes.save).toHaveBeenCalledWith(["coffee"]);
  });

  it("writes nothing until Save is pressed", async () => {
    // A half-made choice is a draft. Tapping a chip must not commit anything.
    show(true);

    await userEvent.click(screen.getByRole("button", { name: "Coffee" }));

    expect(tastes.save).not.toHaveBeenCalled();
  });
});
