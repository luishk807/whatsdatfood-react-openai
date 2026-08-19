export const DISH_LABELS = {
  noPhoto: "No photos yet",
  /**
   * The ask, in full. Dish photography is uploads only now, so an empty tile
   * is not a gap in the page - it is the page, on most dishes, until somebody
   * fills it. It says what to do rather than what is absent.
   */
  beFirst: "Be the first to add a photo",
  addPhoto: "Add the first photo",
  /** Short form for the card, where the tile is small and quiet. */
  addPhotoShort: "Add a photo",
  photoFailed: "Photo unavailable",
  stockPhoto: "Stock photo",
  communityPhoto: "Community photo",
  /**
   * No price at all rather than a fabricated one. Menus routinely arrive
   * without prices, and formatting a missing number as $0.00 tells the reader
   * the dish is free.
   */
  priceUnavailable: "—",
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
  /**
   * "From diners" rather than "of this dish". The section is a contribution
   * funnel, and naming whose photos these are says what is being asked for.
   */
  photosTitle: "Photos from diners",
  /**
   * The stock-photo disclosure is the best moment to ask for a real one: the
   * reader is looking at a picture that is admittedly not this kitchen's. A
   * generic upload button cannot explain why their photo is worth having.
   */
  stockPrompt: "Have the real dish?",
  addYourPhoto: "Add your photo",
  /** Shown once a dish is in someone's history — they were just at the table. */
  orderedFollowUp: "Added to your history.",
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
  /**
   * The badge on a ranked dish inside the category grid. Short because it sits
   * over a photograph next to the stock-photo disclosure, and the full heading
   * collided with it on a narrow card.
   */
  topBadge: "Most loved",
  /** Says whose opinion this is, so the heading is not just a superlative. */
  topStripSubtitle: "What diners recommend most",
  /** The chip that jumps back up to the strip. */
  topStripNav: "Most loved",
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

export const SHOWCASE_LABELS = {
  /** Not "recent photos": the point is that a tap leads to that menu. */
  heading: "Lately on the menu",
  /** A tile is a link, so it says where it goes rather than what it depicts. */
  tileLabel: (dish: string, restaurant: string) => `${dish} at ${restaurant}`,
  // Silence is the right failure here. The wall is an invitation, not the
  // product, and an error where the food should be tells a visitor the site
  // is broken when search works perfectly well.
  empty: "",
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

export const SETTINGS_LABELS = {
  deleteTitle: "Delete your account",
  deleteBlurb:
    "This removes your account and everything we hold about you. It cannot " +
    "be undone.",
  deleteCta: "Delete my account",
  deleteConfirm: "Deleting your account will permanently remove:",
  /** Named, not summarised. "Are you sure?" tells a reader nothing. */
  deleteConsequences: [
    "Your sign-in details, email address and profile.",
    "Every review, vote and dish you marked as ordered.",
    "Your favourites, saved friends and search history.",
    "Every photo you uploaded, including the files themselves.",
  ],
  deleteConfirmCta: "Yes, delete everything",
  deleteCancel: "Keep my account",
  deleting: "Deleting…",
  deleteFailed: "That did not work. Nothing has been deleted — try again.",

  profileTitle: "Profile",
  profileBlurb: "How you appear on the photos and reviews you contribute.",
  accountTitle: "Account",
  accountBlurb: "Private to you. Nobody else sees these.",
  passwordTitle: "Password",
  changePassword: "Change password",
  newPassword: "New password",
  confirmPassword: "Confirm new password",
  updatePassword: "Update password",
  passwordUpdated: "Password updated.",
  passwordMismatch: "Those two passwords do not match.",
  passwordTooShort: "Use at least 8 characters.",
  cancel: "Cancel",
  save: "Save changes",
  saving: "Saving…",
  saved: "Saved.",
  saveFailed: "That did not save. Nothing has been changed.",
  firstName: "First name",
  lastName: "Last name",
  username: "Username",
  email: "Email",
  phone: "Phone",
  dangerTitle: "Danger zone",
} as const;

export const AUTH_LABELS = {
  /** "Welcome back", not "Sign In". The page is a doorway, not a form. */
  signInTitle: "Welcome back",
  signInSubtitle: "Sign in to keep track of what is worth ordering.",
  identifier: "Email or username",
  password: "Password",
  show: "Show",
  hide: "Hide",
  submit: "Sign in",
  submitting: "Signing in…",
  noAccount: "Don't have an account?",
  createAccount: "Create account",
  failed: "That username and password did not match.",
  /** The panel beside the form: what the product is, told with food. */
  pitchTitle: "Know what to order.",
  pitchBody: "See the dishes people actually recommend.",
} as const;

export const LEGAL_LABELS = {
  privacy: "Privacy",
  terms: "Terms",
  effective: (date: string) => `Last updated ${date}`,
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

export const CHUNK_LABELS = {
  title: "This page is out of date",
  body:
    "The app was updated while this tab was open, so part of it could not " +
    "load. Reloading picks up the new version.",
  reload: "Reload",
} as const;

export const RECOMMEND_LABELS = {
  share: (percent: number) => `${percent}% recommend this`,
  votes: (count: number) =>
    count === 1 ? "1 vote" : `${count} votes`,
  // Below the threshold there is no percentage - one vote is not a
  // proportion, and "100% recommend" from one person is a lie with a
  // number attached.
  tooFew: (count: number) =>
    count === 0
      ? "No votes yet"
      : count === 1
        ? "1 vote so far"
        : `${count} votes so far`,
  ask: "Would you order this again?",
} as const;

export const REVIEW_LABELS = {
  heading: "Reviews",
  count: (n: number) => (n === 1 ? "1 review" : `${n} reviews`),
  none: "No reviews yet.",
  write: "Write a review",
  // Stars live here and nowhere else: inside a written review, where someone
  // has already stopped to put their opinion into words.
  starsHint: "Stars apply to this review only.",
} as const;

/**
 * The generic-imagery strip on the front door.
 *
 * `disclosure` is not decoration. Every other photograph in this product is
 * evidence that somebody was at a table; these are stock. A reader must never
 * have to work out which kind they are looking at, and the per-photo credit
 * alone is too quiet to carry that on its own.
 */
export const CUISINE_LABELS = {
  title: "Food inspiration",
  disclosure: "Stock photos, not from these restaurants",
  photoBy: "Photo by",
  on: "on",
} as const;

/**
 * Menu corrections. The menus are extracted by a language model, so they are
 * wrong in ordinary ways — and the person who can see that is sitting in front
 * of the dish.
 */
export const CORRECTION_LABELS = {
  open: "Something wrong here?",
  title: "Suggest a correction",
  /** Says plainly that nothing changes on the strength of one suggestion. */
  blurb: "A correction is reviewed before anything changes.",
  field: "What is wrong",
  value: "What it should say",
  submit: "Send suggestion",
  sending: "Sending…",
  sent: "Thanks — someone will take a look.",
  signIn: "Sign in to suggest a correction",
  /**
   * Shown under the field picker. Allergens are absent from the list on
   * purpose and a reader deserves to know that is deliberate rather than an
   * oversight.
   */
  dietaryNote:
    "Allergen and dietary details are set by the restaurant, not by suggestions.",
  queueTitle: "Suggested corrections",
  queueEmpty: "Nothing waiting.",
  approve: "Apply",
  reject: "Dismiss",
  wasEmpty: "was empty",
} as const;
