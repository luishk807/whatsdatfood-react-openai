import { CoverSource } from "@/customConstants/images";

/**
 * Everywhere a restaurant card could find a picture.
 *
 * Structural on purpose: `NearbyPlaceType`, a trending row and a full
 * restaurant all satisfy it without inheriting from each other, so one
 * fallback rule serves every surface that draws a card.
 *
 * Every field past the first is optional because the server fills them in as
 * they come to exist. A deployment where nothing but community photographs is
 * available behaves correctly today and gains the rest without a change here.
 */
export interface RestaurantImagerySource {
  /** A diner's photograph of something served here. Outranks everything. */
  top_dish_photo_url?: string | null;
  /** The restaurant's own cover, uploaded by a verified owner. */
  owner_photo_url?: string | null;
  /**
   * A Google Places photo, resolved through the supported API flow.
   *
   * Never copied into our own storage: Google's terms allow caching the place
   * identifier, not the photograph, so what we persist is the reference and
   * the picture is fetched fresh.
   */
  google_photo_url?: string | null;
  google_photo_attribution?: string | null;
  google_photo_attribution_url?: string | null;
  /** Only if we already hold one legitimately. Never bought for this. */
  logo_url?: string | null;
  /** What to draw when there is no photograph at all. */
  cuisine?: string | null;
}

export interface RestaurantCoverAttribution {
  text: string;
  url?: string | null;
}

export interface RestaurantCoverCandidate {
  url: string;
  source: CoverSource;
  attribution?: RestaurantCoverAttribution | null;
}

export interface RestaurantCoverInterface {
  restaurant: RestaurantImagerySource;
  className?: string;
  /**
   * Reserved before anything loads, so a late photograph shifts nothing.
   * Pass nothing where `className` already fixes a height — that reserves the
   * box too, and two rules for one box is one of them being ignored.
   */
  ratio?: string;
  /** Above the fold only. Lazy-loading a visible card delays the one thing
   * the page is for; eager-loading a card six rows down wastes a request. */
  eager?: boolean;
  rounded?: string;
}

import { HeroSource } from "@/customConstants/images";
import { CuisineTileType } from "@/interfaces/generic";

/**
 * A community photograph, as the showcase query returns it.
 *
 * Structural and forgiving, so `ShowcasePhoto` satisfies it without either
 * type having to know about the other — the same reason
 * `RestaurantImagerySource` is shaped this way.
 */
export interface HeroCommunityPhotoType {
  id?: string | number | null;
  url_s?: string | null;
  url_m?: string | null;
  dish_name?: string | null;
  /** The public display name already shown on the homepage wall. */
  owner?: string | null;
}

export interface HeroSourcesType {
  community?: HeroCommunityPhotoType[];
  curated?: CuisineTileType[];
}

export interface HeroImageType {
  url: string;
  source: HeroSource;
  /** Decorative: the panel is aria-hidden and the page heading sits over it. */
  alt: string;
  /** The dish, for community work only. Never set for a decorative image. */
  caption: string | null;
  credit: { text: string; url?: string | null } | null;
}

export interface HeroImageInterface {
  image: HeroImageType | null;
  /** Rendered over the image, above the scrim. */
  children?: React.ReactNode;
  className?: string;
  /** Above the fold on the page somebody landed on. */
  eager?: boolean;
}
