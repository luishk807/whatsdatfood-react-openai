import {
  getRestaurantCoverCandidates,
  getRestaurantCoverImage,
  isCommunityCover,
  needsAttribution,
} from "@/utils/restaurantImage";
import { COVER_SOURCE } from "@/customConstants/images";
import { RestaurantImagerySource } from "@/interfaces/imagery";

const restaurant = (
  over: Partial<RestaurantImagerySource> = {},
): RestaurantImagerySource => ({ ...over });

describe("what goes on a restaurant card", () => {
  it("prefers a diner's photograph over everything else", () => {
    // The whole point. Google is a cold-start measure; the moment somebody
    // was at this table with a camera, their work is the card.
    const found = getRestaurantCoverImage(
      restaurant({
        top_dish_photo_url: "https://example.test/community.jpg",
        owner_photo_url: "https://example.test/owner.jpg",
        google_photo_url: "https://example.test/google.jpg",
        logo_url: "https://example.test/logo.png",
      }),
    );

    expect(found?.source).toBe(COVER_SOURCE.community);
    expect(found?.url).toBe("https://example.test/community.jpg");
  });

  it("prefers an owner's cover over a borrowed photograph", () => {
    const found = getRestaurantCoverImage(
      restaurant({
        owner_photo_url: "https://example.test/owner.jpg",
        google_photo_url: "https://example.test/google.jpg",
      }),
    );

    expect(found?.source).toBe(COVER_SOURCE.owner);
  });

  it("falls back to Google when we hold nothing of our own", () => {
    const found = getRestaurantCoverImage(
      restaurant({ google_photo_url: "https://example.test/google.jpg" }),
    );

    expect(found?.source).toBe(COVER_SOURCE.google);
  });

  it("uses a logo only after every photograph has been exhausted", () => {
    // A photograph of the food beats a mark of the brand on a discovery card,
    // which is a claim about what you would eat rather than who made it.
    const found = getRestaurantCoverImage(
      restaurant({
        logo_url: "https://example.test/logo.png",
        google_photo_url: "https://example.test/google.jpg",
      }),
    );

    expect(found?.source).toBe(COVER_SOURCE.google);
  });

  it("returns nothing at all when there is no picture anywhere", () => {
    // Which is the signal to draw the cuisine. Never an empty rectangle.
    expect(getRestaurantCoverImage(restaurant({ cuisine: "chinese" }))).toBeNull();
  });

  it("ignores a blank url rather than rendering a broken image", () => {
    // A column that is present but empty is the common case on imported rows, and
    // an `<img src="">` is the broken-image glyph — the worst thing a card
    // can show.
    const found = getRestaurantCoverImage(
      restaurant({
        top_dish_photo_url: "   ",
        google_photo_url: "https://example.test/google.jpg",
      }),
    );

    expect(found?.source).toBe(COVER_SOURCE.google);
  });
});

describe("failing over rather than giving up", () => {
  it("keeps every source in order so a card can retry", () => {
    // A 403 from a third-party host is routine, not exceptional. The card
    // walks this list; it does not re-ask for a decision.
    const found = getRestaurantCoverCandidates(
      restaurant({
        top_dish_photo_url: "https://example.test/community.jpg",
        google_photo_url: "https://example.test/google.jpg",
        logo_url: "https://example.test/logo.png",
      }),
    );

    expect(found.map((one) => one.source)).toEqual([
      COVER_SOURCE.community,
      COVER_SOURCE.google,
      COVER_SOURCE.logo,
    ]);
  });
});

describe("attribution", () => {
  it("carries the credit with the Google photo itself", () => {
    // Beside it, never looked up separately: a card cannot end up rendering
    // the picture while missing the credit it is obliged to show.
    const found = getRestaurantCoverImage(
      restaurant({
        google_photo_url: "https://example.test/google.jpg",
        google_photo_attribution: "A Photographer",
        google_photo_attribution_url: "https://maps.example.test/contrib",
      }),
    );

    expect(found?.attribution?.text).toBe("A Photographer");
    expect(needsAttribution(found)).toBe(true);
  });

  it("asks for no credit on a diner's own photograph", () => {
    const found = getRestaurantCoverImage(
      restaurant({ top_dish_photo_url: "https://example.test/community.jpg" }),
    );

    expect(needsAttribution(found)).toBe(false);
    expect(isCommunityCover(found)).toBe(true);
  });

  it("does not claim a credit it was never given", () => {
    // A Google photo that arrived without an attribution string cannot be
    // labelled with an empty one.
    const found = getRestaurantCoverImage(
      restaurant({ google_photo_url: "https://example.test/google.jpg" }),
    );

    expect(needsAttribution(found)).toBe(false);
  });
});
