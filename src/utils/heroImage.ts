import { HERO_SOURCE, HeroSource } from "@/customConstants/images";
import { CuisineTileType } from "@/interfaces/generic";
import {
  HeroCommunityPhotoType,
  HeroImageType,
  HeroSourcesType,
} from "@/interfaces/imagery";

/**
 * What fills a large decorative panel, and the only place that decides.
 *
 * The same hierarchy `restaurantImage.ts` uses for a card, at a different
 * scale: **real WhatsDatFood content, then curated fallback, then nothing at
 * all.** Written once and deliberately not tied to the sign-in page — the
 * panel behind the auth pages is the first caller, not the reason it exists.
 *
 *   1. a diner's photograph   somebody was at a table
 *   2. a curated Unsplash image  decoration, credited, and temporary
 *   3. null                   the caller draws its own gradient
 *
 * **The two are never confusable, and that is the whole point.** A community
 * photo is captioned with the dish and the person who took it. A curated one
 * carries a photographer credit and no dish name, because it is not a
 * photograph of anything this product knows about — presenting one as a
 * restaurant's food is the single thing that would make every other
 * photograph here worth less. `DishPhoto` already refuses `IMAGE_SOURCE
 * .generic` for the same reason; this is that rule at panel scale.
 *
 * **Community coverage replaces the fallback on its own.** As uploads arrive
 * the first branch starts winning and the Unsplash images stop being reached,
 * with no change here and nothing to switch off.
 */

/**
 * Rotate on the day, never on the render.
 *
 * A different photograph every time somebody blinks makes a page feel
 * unstable, and re-rendering must not reshuffle it — the same rule the hot
 * pick already follows. The day number is the seed, so it turns over at
 * midnight and nowhere else.
 */
export const daySeed = (now: number = Date.now()): number =>
  Math.floor(now / 86_400_000);

/** Which of `count` to show, from a seed. Stable, and safe at zero. */
const rotate = (count: number, seed: number): number =>
  count > 0 ? ((seed % count) + count) % count : 0;

/**
 * A community photograph carries its dish and its photographer.
 *
 * `owner` is the public display name already shown under every tile on the
 * homepage wall — the same field, no wider. Nothing private is read here and
 * there is nothing to leak: the resolver never sees an email, an id or a
 * handle that is not already public.
 */
const fromCommunity = (
  photos: HeroCommunityPhotoType[],
  seed: number,
): HeroImageType | null => {
  // A row with no usable URL is not a photograph. The server already excludes
  // deleted, reported and hidden images and returns community uploads only,
  // so nothing is re-checked here — and no moderation is re-run.
  const usable = photos.filter((photo) => (photo.url_m || photo.url_s || "").trim());

  if (!usable.length) {
    return null;
  }

  const photo = usable[rotate(usable.length, seed)];

  return {
    // The larger rendition: this fills half a desktop screen, where the
    // thumbnail the cards use would be visibly soft.
    url: (photo.url_m || photo.url_s || "").trim(),
    source: HERO_SOURCE.community,
    // Decorative. The panel is `aria-hidden` and the page's real heading sits
    // over it, so a description here would be read out for no purpose.
    alt: "",
    caption: photo.dish_name || null,
    credit: photo.owner ? { text: photo.owner, url: null } : null,
  };
};

/**
 * The curated fallback: the same Unsplash rows the cuisine strip draws.
 *
 * One collection, refreshed by a scheduled job and never by a page load —
 * `GenericImageService.tiles()` is a single indexed query, and Unsplash is
 * only ever called by `refresh()`. So opening the sign-in page a thousand
 * times costs a thousand database reads and no third-party requests at all.
 */
const fromCurated = (
  tiles: CuisineTileType[],
  seed: number,
): HeroImageType | null => {
  const usable = tiles.filter((tile) => (tile.url || tile.thumb_url || "").trim());

  if (!usable.length) {
    return null;
  }

  const tile = usable[rotate(usable.length, seed)];

  return {
    url: (tile.url || tile.thumb_url || "").trim(),
    source: HERO_SOURCE.curated,
    alt: "",
    // Deliberately no dish name. This is not a photograph of anything we
    // know about, and captioning it as though it were is the confusion the
    // whole product's credibility rests on avoiding.
    caption: null,
    credit: tile.photographer
      ? { text: tile.photographer, url: tile.photographer_url ?? null }
      : null,
  };
};

export const pickHeroImage = (
  sources: HeroSourcesType,
  seed: number = daySeed(),
): HeroImageType | null =>
  fromCommunity(sources.community ?? [], seed) ??
  fromCurated(sources.curated ?? [], seed);

/**
 * Whether a credit has to be printed beside this image.
 *
 * Unsplash's terms require the photographer wherever the photo appears, and a
 * contributor's name is theirs to be shown. Both are stored rather than looked
 * up, so a credit cannot vanish because a request failed.
 */
export const heroNeedsCredit = (image: HeroImageType | null): boolean =>
  Boolean(image?.credit?.text);

/** Community work is labelled as such; a decorative image never is. */
export const isCommunityHero = (image: HeroImageType | null): boolean =>
  image?.source === HERO_SOURCE.community;

export type { HeroSource };
