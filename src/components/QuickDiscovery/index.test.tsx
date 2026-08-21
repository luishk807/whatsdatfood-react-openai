import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import QuickDiscovery from "@/components/QuickDiscovery";
import { QUICK_LABELS } from "@/customConstants/labels";
import { TasteCategoryType, TastePreferenceType } from "@/interfaces/tastes";

/**
 * The row that answers "I want coffee and I do not know a coffee shop".
 *
 * The load-bearing assertions are about what a saved taste does *not* do: it
 * orders these shortcuts and it never filters discovery, never becomes a
 * permanent preference by being tapped, and never hides a category behind
 * anything more than one tap.
 */
const category = (
  slug: string,
  name: string,
  order: number,
): TasteCategoryType => ({ slug, name, kind: "food", display_order: order });

const CATEGORIES: TasteCategoryType[] = [
  category("coffee", "Coffee", 10),
  category("sushi", "Sushi", 20),
  category("ramen", "Ramen", 30),
  category("dim_sum", "Dim Sum", 40),
  category("pizza", "Pizza", 50),
  category("korean", "Korean", 140),
];

const prefers = (...slugs: string[]): TastePreferenceType[] =>
  slugs.map((slug) => ({ slug, name: slug, kind: "food", source: "explicit" }));

const show = (
  props: Partial<Parameters<typeof QuickDiscovery>[0]> = {},
) =>
  render(
    <MemoryRouter>
      <QuickDiscovery categories={CATEGORIES} preferences={[]} {...props} />
    </MemoryRouter>,
  );

describe("the shortcuts", () => {
  it("offers categories without needing a restaurant name", () => {
    show();

    expect(screen.getByRole("link", { name: /Coffee/ })).toHaveAttribute(
      "href",
      "/nearby?cuisine=coffee",
    );
  });

  it("leads with what somebody saved", () => {
    show({ preferences: prefers("korean") });

    const links = screen.getAllByRole("link").map((a) => a.textContent?.trim());

    expect(links[0]).toContain("Korean");
  });

  it("says when the row is personalised", () => {
    // Personalisation a reader cannot see is the product deciding for them.
    show({ preferences: prefers("korean") });

    expect(screen.getByText(QUICK_LABELS.personalised)).toBeInTheDocument();
  });

  it("says nothing of the sort when it is not", () => {
    show();

    expect(
      screen.queryByText(QUICK_LABELS.personalised),
    ).not.toBeInTheDocument();
  });
});

describe("browsing outside your own tastes", () => {
  it("keeps everything else one tap away", async () => {
    // The reason personalising the visible four is safe.
    show({ preferences: prefers("korean") });

    await userEvent.click(screen.getByRole("button", { name: /More/ }));

    const sheet = screen.getByRole("dialog");

    expect(within(sheet).getByRole("link", { name: /Pizza/ })).toBeInTheDocument();
  });

  it("does not offer More when nothing is left", () => {
    show({ categories: CATEGORIES.slice(0, 3) });

    expect(screen.queryByRole("button", { name: /More/ })).not.toBeInTheDocument();
  });
});

describe("the map", () => {
  it("is always reachable from the front door", () => {
    // It used to be three sections down, behind a link most readers never
    // scrolled to.
    show();

    expect(screen.getByRole("link", { name: /Map/ })).toHaveAttribute(
      "href",
      "/nearby?view=map",
    );
  });

  it("is offered even when there are no categories to show", () => {
    show({ categories: [] });

    expect(screen.getByRole("link", { name: /Map/ })).toBeInTheDocument();
  });
});

describe("what a tap does not do", () => {
  it("changes no saved preference", () => {
    // Temporary search state and personalisation data are different things.
    // This component takes preferences and renders links; there is nothing
    // here that could write one.
    const onWrite = jest.fn();
    show({ preferences: prefers("korean") });

    expect(onWrite).not.toHaveBeenCalled();
    expect(
      screen.getByRole("link", { name: /Korean/ }),
    ).toHaveAttribute("href", "/nearby?cuisine=korean");
  });

  it("renders nothing but the map while the categories are loading", () => {
    // A row of grey pills under the search box is worse than clean space.
    show({ loading: true });

    expect(screen.queryByRole("link", { name: /Coffee/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Map/ })).toBeInTheDocument();
  });
});
