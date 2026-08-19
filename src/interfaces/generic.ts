/**
 * Generic imagery — illustrations of a cuisine, never a photograph of a dish.
 *
 * A separate interface from anything in `restaurants.ts` on purpose: the two
 * cannot be confused if they cannot be passed to the same component.
 */
export interface CuisineTileType {
  category: string;
  label: string;
  url: string;
  thumb_url: string | null;
  alt: string | null;
  photographer: string | null;
  /** Already carries the utm parameters Unsplash's terms require. */
  photographer_url: string | null;
  provider_url: string | null;
  provider: string | null;
}

export interface CuisineStripInterface {
  tiles: CuisineTileType[];
  loading?: boolean;
}
