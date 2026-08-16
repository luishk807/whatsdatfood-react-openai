import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestionsComponent from "@/components/Suggestions";
import { SEARCH_LABELS } from "@/customConstants/labels";
import { RestaurantType } from "@/interfaces/restaurants";

const restaurant = (over: Partial<RestaurantType> = {}): RestaurantType =>
  ({
    name: "Lucali",
    slug: "lucali-575-henry-st-brooklyn",
    city: "Brooklyn",
    businessHours: [],
    ...over,
  }) as RestaurantType;

const defaults = {
  query: "luc",
  show: true,
  searching: false,
  searched: true,
  onSelect: jest.fn(),
  onClose: jest.fn(),
};

describe("Suggestions", () => {
  it("shows nothing when closed", () => {
    render(
      <SuggestionsComponent
        {...defaults}
        show={false}
        suggestions={[restaurant()]}
      />,
    );

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("selects on a single click, with no second button to press", async () => {
    const onSelect = jest.fn();
    const target = restaurant();
    render(
      <SuggestionsComponent
        {...defaults}
        onSelect={onSelect}
        suggestions={[target]}
      />,
    );

    await userEvent.click(screen.getByRole("option"));

    expect(onSelect).toHaveBeenCalledWith(target);
  });

  it("says it is looking rather than showing an empty box", () => {
    render(
      <SuggestionsComponent {...defaults} searching suggestions={[]} />,
    );

    expect(screen.getByText(SEARCH_LABELS.searching)).toBeInTheDocument();
  });

  it("distinguishes 'nothing found' from 'not looked yet'", () => {
    const { rerender } = render(
      <SuggestionsComponent {...defaults} searched={false} suggestions={[]} />,
    );
    expect(
      screen.queryByText(SEARCH_LABELS.nothingFound),
    ).not.toBeInTheDocument();

    rerender(
      <SuggestionsComponent {...defaults} searched suggestions={[]} />,
    );
    expect(screen.getByText(SEARCH_LABELS.nothingFound)).toBeInTheDocument();
  });

  it("renders a name containing markup as text", () => {
    // The previous version passed a built HTML string to
    // dangerouslySetInnerHTML, and these names come from a language model.
    const nasty = "<img src=x onerror=alert(1)>Pizza";
    const { container } = render(
      <SuggestionsComponent
        {...defaults}
        query="pizza"
        suggestions={[restaurant({ name: nasty, slug: "nasty" })]}
      />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("option")).toHaveTextContent(nasty);
  });

  it("does not crash when the query is regex punctuation", () => {
    expect(() =>
      render(
        <SuggestionsComponent
          {...defaults}
          query="("
          suggestions={[restaurant({ name: "Joe's (Pizza)", slug: "joes" })]}
        />,
      ),
    ).not.toThrow();
  });
});
