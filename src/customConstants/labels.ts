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
