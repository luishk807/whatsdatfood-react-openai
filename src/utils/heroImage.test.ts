import {
  daySeed,
  heroNeedsCredit,
  isCommunityHero,
  pickHeroImage,
} from "@/utils/heroImage";
import { HERO_SOURCE } from "@/customConstants/images";
import { CuisineTileType } from "@/interfaces/generic";
import { HeroCommunityPhotoType } from "@/interfaces/imagery";

const photo = (
  over: Partial<HeroCommunityPhotoType> = {},
): HeroCommunityPhotoType => ({
  id: "1",
  url_m: "https://example.test/community.jpg",
  dish_name: "Spicy Miso Ramen",
  owner: "luis",
  ...over,
});

const tile = (over: Partial<CuisineTileType> = {}): CuisineTileType => ({
  category: "japanese",
  label: "Japanese",
  url: "https://example.test/unsplash.jpg",
  thumb_url: null,
  alt: null,
  photographer: "A Photographer",
  photographer_url: "https://unsplash.test/@a",
  provider_url: "https://unsplash.test",
  provider: "unsplash",
  ...over,
});

describe("what fills a decorative panel", () => {
  it("prefers a diner's photograph", () => {
    // The long-term direction: as uploads arrive the fallback stops being
    // reached, with nothing to switch off.
    const found = pickHeroImage({ community: [photo()], curated: [tile()] });

    expect(found?.source).toBe(HERO_SOURCE.community);
    expect(found?.url).toBe("https://example.test/community.jpg");
  });

  it("falls back to curated imagery when nobody has uploaded", () => {
    const found = pickHeroImage({ community: [], curated: [tile()] });

    expect(found?.source).toBe(HERO_SOURCE.curated);
  });

  it("returns nothing when there is neither", () => {
    // The caller then draws its own gradient, which is a designed state and
    // not a failure — a new deployment has no photographs at all.
    expect(pickHeroImage({ community: [], curated: [] })).toBeNull();
  });

  it("ignores a row with no usable url", () => {
    const found = pickHeroImage({
      community: [photo({ url_m: "   ", url_s: null })],
      curated: [tile()],
    });

    expect(found?.source).toBe(HERO_SOURCE.curated);
  });

  it("takes the thumbnail only when there is no larger rendition", () => {
    const found = pickHeroImage({
      community: [photo({ url_m: null, url_s: "https://example.test/s.jpg" })],
    });

    expect(found?.url).toBe("https://example.test/s.jpg");
  });
});

describe("telling the two apart", () => {
  it("captions a community photo with its dish and photographer", () => {
    // "Spicy Miso Ramen · @luis" — a real dish somebody really ate.
    const found = pickHeroImage({ community: [photo()] });

    expect(found?.caption).toBe("Spicy Miso Ramen");
    expect(found?.credit?.text).toBe("luis");
    expect(isCommunityHero(found)).toBe(true);
  });

  it("never captions a curated image with a dish", () => {
    // The rule the whole product's credibility rests on: a stock photograph
    // must never read as a photograph of a particular kitchen's food.
    const found = pickHeroImage({ community: [], curated: [tile()] });

    expect(found?.caption).toBeNull();
    expect(isCommunityHero(found)).toBe(false);
  });

  it("credits the photographer on a curated image", () => {
    // Required by Unsplash's terms wherever the photo appears, and stored
    // rather than looked up so it cannot vanish when a request fails.
    const found = pickHeroImage({ community: [], curated: [tile()] });

    expect(found?.credit?.text).toBe("A Photographer");
    expect(heroNeedsCredit(found)).toBe(true);
  });

  it("exposes no more about a contributor than the wall already does", () => {
    // `owner` is the public display name shown under every homepage tile.
    // Nothing else about the person reaches this object.
    const found = pickHeroImage({
      community: [photo({ owner: "luis" })],
    });

    expect(Object.keys(found ?? {}).sort()).toEqual([
      "alt",
      "caption",
      "credit",
      "source",
      "url",
    ]);
  });

  it("asks for no credit when a photo carries no name", () => {
    const found = pickHeroImage({ community: [photo({ owner: null })] });

    expect(heroNeedsCredit(found)).toBe(false);
  });
});

describe("rotation", () => {
  it("does not change between renders on the same day", () => {
    // A different photograph every time somebody blinks makes a page feel
    // unstable — the same rule the hot pick follows.
    const pool = [photo({ id: "1" }), photo({ id: "2" }), photo({ id: "3" })];
    const seed = daySeed(Date.parse("2026-08-21T09:00:00Z"));

    expect(pickHeroImage({ community: pool }, seed)).toEqual(
      pickHeroImage({ community: pool }, seed),
    );
  });

  it("turns over with the day", () => {
    const pool = [
      photo({ id: "1", url_m: "https://example.test/a.jpg" }),
      photo({ id: "2", url_m: "https://example.test/b.jpg" }),
    ];

    const today = pickHeroImage(
      { community: pool },
      daySeed(Date.parse("2026-08-21T09:00:00Z")),
    );
    const tomorrow = pickHeroImage(
      { community: pool },
      daySeed(Date.parse("2026-08-22T09:00:00Z")),
    );

    expect(today?.url).not.toBe(tomorrow?.url);
  });

  it("survives a pool of one", () => {
    expect(pickHeroImage({ community: [photo()] }, 7)).not.toBeNull();
  });
});
