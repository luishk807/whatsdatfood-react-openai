export const DISH_LABELS = {
  noPhoto: "No photo yet",
  addPhoto: "Add the first photo",
  photoFailed: "Photo unavailable",
  stockPhoto: "Stock photo",
  communityPhoto: "Community photo",
  popularUnverified: "Popular",
  voteUp: "Would order again",
  voteDown: "Would not order again",
  signInToVote: "Sign in to vote",
  signInToReview: "Sign in to read and write reviews for this dish.",
  signInToUpload: "Sign in to add a photo",
  uploadFailed: "That photo could not be uploaded",
  uploading: "Uploading…",
  photoBy: (username: string) => `Photo by @${username}`,
  helpful: "Helpful",
  reportPhoto: "Report this photo",
  photosTitle: "Photos of this dish",
  noPhotosYet: "No photos yet. Be the first.",
  markHelpful: "Mark this photo helpful",
  markedHelpful: "You found this helpful",
  helpfulCount: (count: number) =>
    count === 1 ? "1 person found this helpful" : `${count} found this helpful`,
  heroPhoto: "Shown on the menu",
  reportSubmitted: "Thanks — someone will take a look",
  reportPrompt: "What is wrong with this photo?",
  cancel: "Cancel",
  signInToHelp: "Sign in to vote or report",
  orderedThis: "I ordered this",
  youOrderedThis: "You ordered this",
  signInToRecordOrder: "Sign in to record what you ordered",
} as const;

export const ORDER_LABELS = {
  /** The line no venue-level competitor can produce. */
  share: (percent: number) => `${percent}% of people here order this`,
  count: (count: number) =>
    count === 1 ? "1 person ordered this" : `${count} people ordered this`,
  mostOrdered: "Most ordered here",
} as const;

export const RANKING_LABELS = {
  topStripTitle: "Most loved here",
  /** Used while the strip is AI suggestions rather than real votes. */
  suggestedTitle: "Popular picks · not yet voted on",
  notEnoughVotes: "Not enough votes yet",
  /** Vote counts read honestly rather than as a rank while data is thin. */
  voteCount: (count: number) =>
    count === 1 ? "1 person would order again" : `${count} would order again`,
} as const;

export const MENU_LABELS = {
  tastingMenuTitle: "Tasting Menu (Per Person)",
  drinkPairingPrice: "Drinking Pairing Price",
  tastingMenuPrice: "Tasting Menu Price",
} as const;

export const DIETARY_LABELS = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glutenFree: "Gluten free",
  containsNuts: "Contains nuts",
  containsShellfish: "Contains shellfish",
  containsDairy: "Contains dairy",
  spice: ["", "Mild", "Medium", "Hot"],
  confirmedByRestaurant: "Confirmed by the restaurant",
  /**
   * Shown wherever dietary information appears. Absence of a warning is not a
   * guarantee, and someone with an allergy needs to be told that plainly.
   */
  disclaimer: "Always check with the restaurant if you have an allergy.",
} as const;
