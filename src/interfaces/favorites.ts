export interface BookmarkButtonInterface {
  /**
   * Called after a toggle settles, with whether it is now saved.
   *
   * Only the saved-restaurants list needs it: unsaving something there
   * should take the card away, and the alternative was a second toggle
   * implementation on that page.
   */
  onChange?: (saved: boolean) => void;
  slug: string;
  /** Known already by a caller that has the list; saves a round trip. */
  defaultValue?: boolean;
}
