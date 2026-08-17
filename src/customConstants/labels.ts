export const DISH_LABELS = {
  noPhoto: "No photo yet",
  addPhoto: "Add the first photo",
  photoFailed: "Photo unavailable",
  stockPhoto: "Stock photo",
  communityPhoto: "Community photo",
  popularUnverified: "Popular",
  recommend: "Recommend",
  recommended: "Recommended",
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

export const OWNER_LABELS = {
  consoleTitle: "Restaurants you manage",
  claimTitle: "Own this restaurant?",
  claimBlurb:
    "Claim this page to keep the menu and details right. Claims are " +
    "reviewed before anything can be changed.",
  claimCta: "Claim this restaurant",
  claimPending: "Waiting for review",
  claimApproved: "You manage this",
  claimRejected: "Not approved",
  claimSent: "Sent — someone will review it",
  noClaims: "You have not claimed a restaurant yet.",
  /** Said plainly, because it is the reason anyone should trust the numbers. */
  boundary:
    "You can correct facts about your restaurant — prices, descriptions, " +
    "what is on the menu. You cannot change reviews, photos or ratings, and " +
    "nobody at this company can do that on your behalf either.",
  editFacts: "Correct the details",
  saved: "Saved",
  discontinue: "No longer on the menu",
  discontinued: "Taken off the menu",
  confirmDiscontinue: "Take this off the menu? Its reviews and photos stay.",
} as const;

export const ADMIN_LABELS = {
  title: "Review queue",
  claims: "Ownership claims",
  reports: "Reported photos",
  noClaims: "No claims waiting.",
  noReports: "Nothing reported.",
  approve: "Approve",
  reject: "Reject",
  keepPhoto: "Keep",
  removePhoto: "Remove",
  removeWarning: "Removing a photo is the only way one disappears.",
} as const;
/**
 * The restaurant screen.
 *
 * Everything that is not food lives behind one button. A person holding a
 * phone at the table has already chosen the restaurant - they are sitting in
 * it - so the address, the hours and the payment methods are answers to
 * questions nobody at that table is asking.
 */
export const VENUE_LABELS = {
  details: "Details",
  detailsSheetTitle: "Restaurant details",
  back: "Back",
  address: "Address",
  phone: "Phone",
  hours: "Opening hours",
  priceRange: "Price range",
  payment: "Payment",
  website: "Website",
  reservationRequired: "Reservation required",
  michelin: "Michelin",
  tastingMenu: "Tasting menu only",
  noDetails: "Nothing on file for this restaurant yet.",
} as const;

export const SEARCH_LABELS = {
  title: "See it before you order it",
  subtitle: "Photos and rankings from the people who ate there.",
  placeholder: "Search a restaurant",
  submit: "Search",
  searching: "Looking…",
  // Not "no results": the app can generate a menu for a restaurant it has
  // never seen, so an empty list means the lookup itself came back empty.
  nothingFound: "Nothing found for that name. Try the full name, or add a city.",
  hint: "Press enter to look it up",
  // A refusal is not an absence. Reporting "nothing found" when the
  // backend said "too many requests" sends someone hunting for a
  // restaurant that is sitting right there in the database.
  failed: "Search is unavailable for a moment. Try again shortly.",
} as const;

export const SITE_LABELS = {
  brand: "What's dat food",
  tagline: "Know what to order.",
  menu: "Menu",
  closeMenu: "Close menu",
  signIn: "Sign in",
  createAccount: "Create account",
  account: "Account",
  contact: "Contact",
  copyright: "© 2026 What's dat food",
} as const;

export const FAVORITE_LABELS = {
  save: "Save this restaurant",
  saved: "Saved",
  remove: "Remove from saved",
  signInToSave: "Sign in to save restaurants",
  savedToast: "Saved",
  failed: "Could not save that. Try again.",
} as const;
