export interface BookmarkButtonInterface {
  slug: string;
  /** Known already by a caller that has the list; saves a round trip. */
  defaultValue?: boolean;
}
