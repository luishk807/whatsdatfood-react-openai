import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RestaurantHeader from "@/components/RestaurantHeader";
import { VENUE_LABELS } from "@/customConstants/labels";
import { RestaurantType } from "@/interfaces/restaurants";

const navigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigate,
}));

const restaurant = (over: Partial<RestaurantType> = {}): RestaurantType =>
  ({
    name: "Peter Luger Steak House",
    city: "Brooklyn",
    rating: 4.2,
    price_range: "$$$$",
    businessHours: [],
    ...over,
  }) as RestaurantType;

const show = (props: Partial<Parameters<typeof RestaurantHeader>[0]> = {}) =>
  render(
    <MemoryRouter>
      <RestaurantHeader
        restaurant={restaurant()}
        onOpenDetails={jest.fn()}
        {...props}
      />
    </MemoryRouter>,
  );

describe("RestaurantHeader", () => {
  beforeEach(() => {
    navigate.mockClear();
    window.history.replaceState({ idx: 0 }, "");
  });

  it("names the restaurant as the page heading", () => {
    show();

    // It went missing once: compressed into a flex column narrow enough to
    // wrap one word per line, smaller than the dish names below it.
    expect(
      screen.getByRole("heading", { name: "Peter Luger Steak House" }),
    ).toBeInTheDocument();
  });

  it("shows rating, price and area on one line", () => {
    show();

    expect(screen.getByText(/★ 4.2/)).toBeInTheDocument();
    expect(screen.getByText(/\$\$\$\$/)).toBeInTheDocument();
    expect(screen.getByText(/Brooklyn/)).toBeInTheDocument();
  });

  it("opens the details sheet rather than showing the metadata inline", async () => {
    const onOpenDetails = jest.fn();
    show({ onOpenDetails });

    await userEvent.click(screen.getByText(VENUE_LABELS.details));

    expect(onOpenDetails).toHaveBeenCalled();
  });

  it("offers no details button for a restaurant with nothing on file", () => {
    show({ restaurant: { name: "Bare", businessHours: [] } as RestaurantType });

    // A button opening an empty panel is worse than no button, and plenty of
    // generated records carry a name and nothing else.
    expect(screen.queryByText(VENUE_LABELS.details)).not.toBeInTheDocument();
  });

  it("goes home rather than out of the app when there is no history", async () => {
    // Most arrivals are a shared link opened directly; history(-1) there
    // leaves for whatever was in the tab before, which is usually nothing.
    show();

    await userEvent.click(screen.getByLabelText(VENUE_LABELS.back));

    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("goes back when there is somewhere to go back to", async () => {
    window.history.replaceState({ idx: 3 }, "");
    show();

    await userEvent.click(screen.getByLabelText(VENUE_LABELS.back));

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it("renders the action it is given", () => {
    show({ action: <button type="button">Favorite</button> });

    expect(screen.getByRole("button", { name: "Favorite" })).toBeInTheDocument();
  });
});
