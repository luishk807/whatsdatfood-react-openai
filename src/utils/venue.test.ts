import {
  displayRating,
  fullAddress,
  hasDetails,
  michelinStars,
  priceRange,
} from "./venue";
import { RestaurantType } from "@/interfaces/restaurants";

const venue = (over: Partial<RestaurantType> = {}): RestaurantType =>
  ({ name: "Somewhere", businessHours: [], ...over }) as RestaurantType;

describe("displayRating", () => {
  it("formats to one decimal", () => {
    expect(displayRating(venue({ rating: 4.25 }))).toBe("4.3");
  });

  it("returns null when nobody has rated, rather than 0.0", () => {
    expect(displayRating(venue({ rating: 0 }))).toBeNull();
    expect(displayRating(venue())).toBeNull();
    expect(displayRating(null)).toBeNull();
  });

  it("treats a junk rating as no rating", () => {
    expect(displayRating(venue({ rating: NaN }))).toBeNull();
    expect(
      displayRating(venue({ rating: "not a number" as unknown as number })),
    ).toBeNull();
  });
});

describe("priceRange", () => {
  it("passes a range through", () => {
    expect(priceRange(venue({ price_range: "$$$$" }))).toBe("$$$$");
  });

  it("treats blank as absent, so the meta line does not show an empty gap", () => {
    expect(priceRange(venue({ price_range: "   " }))).toBeNull();
    expect(priceRange(venue())).toBeNull();
  });
});

describe("michelinStars", () => {
  it("counts whole stars", () => {
    expect(michelinStars(venue({ michelin_score: 3 }))).toBe(3);
    expect(michelinStars(venue({ michelin_score: 2.7 }))).toBe(2);
  });

  it("is zero rather than NaN for anything unusable", () => {
    expect(michelinStars(venue())).toBe(0);
    expect(michelinStars(venue({ michelin_score: -1 }))).toBe(0);
    expect(
      michelinStars(venue({ michelin_score: "two" as unknown as number })),
    ).toBe(0);
  });
});

describe("fullAddress", () => {
  it("joins the parts that exist", () => {
    expect(
      fullAddress(
        venue({
          address: "178 Broadway",
          city: "Brooklyn",
          state: "NY",
          postal_code: "11211",
          country: "USA",
        }),
      ),
    ).toBe("178 Broadway, Brooklyn, NY, 11211, USA");
  });

  it("skips missing parts without leaving stray commas", () => {
    expect(fullAddress(venue({ city: "Brooklyn", state: "NY" }))).toBe(
      "Brooklyn, NY",
    );
  });

  it("is null when there is no address at all", () => {
    expect(fullAddress(venue())).toBeNull();
    expect(fullAddress(venue({ address: "  ", city: "" }))).toBeNull();
  });
});

describe("hasDetails", () => {
  // A Details button that opens an empty panel is worse than no button, and
  // a generated record often carries a name and nothing else.
  it("is false for a record with only a name", () => {
    expect(hasDetails(venue())).toBe(false);
    expect(hasDetails(null)).toBe(false);
  });

  it.each([
    ["an address", { city: "Brooklyn" }],
    ["a phone number", { phone: "718-555-0000" }],
    ["a website", { website: "https://example.test" }],
    ["a price range", { price_range: "$$" }],
    ["a Michelin score", { michelin_score: 1 }],
    ["a payment method", { payment_method: "cash" }],
    ["a description", { description: "An old steakhouse." }],
    ["a reservation requirement", { reservation_required: true }],
    ["a tasting menu", { tasting_menu_only: true }],
  ])("is true given %s", (_label, fields) => {
    expect(hasDetails(venue(fields as Partial<RestaurantType>))).toBe(true);
  });

  it("is true when only opening hours are known", () => {
    expect(
      hasDetails(
        venue({
          businessHours: [
            { day_of_week: "Monday", open_time: "17:00", close_time: "22:00" },
          ] as RestaurantType["businessHours"],
        }),
      ),
    ).toBe(true);
  });

  it("ignores whitespace-only fields", () => {
    expect(hasDetails(venue({ phone: "   ", description: "  " }))).toBe(false);
  });
});
