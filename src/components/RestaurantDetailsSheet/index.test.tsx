import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RestaurantDetailsSheet from "@/components/RestaurantDetailsSheet";
import { VENUE_LABELS } from "@/customConstants/labels";
import { RestaurantType } from "@/interfaces/restaurants";

const venue = (over: Partial<RestaurantType> = {}): RestaurantType =>
  ({ name: "Peter Luger", businessHours: [], ...over }) as RestaurantType;

const show = (over: Partial<RestaurantType> = {}, open = true) =>
  render(
    <RestaurantDetailsSheet
      restaurant={venue(over)}
      open={open}
      onClose={jest.fn()}
    />,
  );

describe("RestaurantDetailsSheet", () => {
  it("stays shut until asked", () => {
    show({ phone: "718-555-0000" }, false);

    expect(screen.queryByText("718-555-0000")).not.toBeInTheDocument();
  });

  it("renders nothing at all without a restaurant", () => {
    const { container } = render(
      <RestaurantDetailsSheet restaurant={null} open onClose={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the address assembled from its parts", () => {
    show({ address: "178 Broadway", city: "Brooklyn", state: "NY" });

    expect(screen.getByText(/178 Broadway, Brooklyn, NY/)).toBeInTheDocument();
  });

  it("makes the phone number dialable", () => {
    show({ phone: "718-555-0000" });

    // A phone number on a phone should dial; this is the one screen where
    // somebody actually wants it.
    expect(screen.getByText("718-555-0000")).toHaveAttribute(
      "href",
      "tel:718-555-0000",
    );
  });

  it("opens the website safely in a new tab", () => {
    show({ website: "https://example.test" });

    const link = screen.getByText("https://example.test");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("draws Michelin stars from the score", () => {
    show({ michelin_score: 3 });

    expect(screen.getByText("★★★")).toBeInTheDocument();
  });

  it("omits a row it has no value for", () => {
    show({ phone: "718-555-0000" });

    expect(screen.queryByText(VENUE_LABELS.payment)).not.toBeInTheDocument();
    expect(screen.queryByText(VENUE_LABELS.website)).not.toBeInTheDocument();
  });

  it("says so when the record is empty rather than showing a blank panel", () => {
    show();

    expect(screen.getByText(VENUE_LABELS.noDetails)).toBeInTheDocument();
  });

  it("closes when asked", async () => {
    const onClose = jest.fn();
    render(
      <RestaurantDetailsSheet
        restaurant={venue({ phone: "718-555-0000" })}
        open
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByLabelText("Close"));

    expect(onClose).toHaveBeenCalled();
  });
});
