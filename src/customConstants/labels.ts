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
  /** Says what the page is for, to somebody who opens it once a week. */
  blurb:
    "Decisions only an admin makes. Nothing here changes until you decide it.",
  /** The whole page in one line, so an empty queue costs one glance. */
  allClear: "Nothing is waiting.",
  waiting: (count: number) =>
    count === 1 ? "1 thing waiting" : `${count} things waiting`,
  claims: "Ownership claims",
  reports: "Reported photos",
  noClaims: "No claims waiting.",
  noReports: "Nothing reported.",
  approve: "Approve",
  reject: "Reject",
  keepPhoto: "Keep",
  removePhoto: "Remove",
  confirmRemove: "Remove for good",
  cancel: "Cancel",
  working: "Working…",
  /**
   * On the row, not at the top of the page: with three queues open, "that did
   * not work" says nothing about which decision is still waiting.
   */
  decisionFailed: "That did not stick. Try again.",
  removeWarning: "Removing a photo is the only way one disappears.",
  verification: "Proof",
  noVerification: "None offered",
  note: "Note",
  reason: "Reported as",
  uploadedBy: "Uploaded by",
  unattributed: "Unattributed",
  unknownDish: "Dish unknown",
  /**
   * Shown to a signed-in reader who is not an admin. It used to render
   * nothing at all under a heading reading "Review", which looks like the
   * page failed to load rather than like a page that was never theirs.
   */
  notForYou: "This page is for admins.",
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
  /**
   * Both questions, in one box. The restaurant-name path is unchanged — it is
   * what the autocomplete and `resolvePlace` do — and this stops the field
   * claiming that a name is the only thing it accepts, which was the reason a
   * reader who wanted coffee had nowhere to start.
   */
  placeholder: "Search restaurants or food",
  submit: "Search",
  searching: "Looking…",
  /**
   * Shown in the suggestion list while somebody is still typing, which is the
   * only place it appears — and it must not read as a verdict.
   *
   * It used to say "Nothing found for that name. Try the full name, or add a
   * city." to a reader who had typed the full name: the suggestions only ever
   * search restaurants already in this database, and pressing Search is what
   * looks a new one up. So the sentence was telling somebody their correct
   * query was wrong, and telling them so before the thing that could answer
   * it had been asked.
   */
  nothingFound: "No match yet — press Search to look this one up.",
  hint: "Press enter to look it up",
  /** Marks a row we already hold a menu for — the better answer, and the free
   * one. */
  hasMenu: "Menu",
  /** While a chosen suggestion is being imported. */
  opening: "Opening…",
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

  /**
   * The Settings sections, in their own words.
   *
   * `profileBlurb` used to say "How you appear on the photos and reviews you
   * contribute" on a card sharing a page with an email field, a phone field
   * and a delete button - which made the sentence true of the card and false
   * of the page it was on.
   */
  hubTitle: "Settings",
  profileHeading: "Profile",
  accountHeading: "Account & security",
  locationHeading: "Location & discovery",
  privacyHeading: "Contributions & privacy",
  preferencesHeading: "Food preferences",
  /** Nothing is behind this yet, and the page says so rather than pretending. */
  notificationsHeading: "Notifications",
  notificationsBlurb:
    "There is nothing to turn on yet. When we start sending anything, this " +
    "is where you will choose what.",
  /** Said once, at the top of the account section rather than on a card. */
  accountPrivate: "Only you can see these.",
  locationBlurb:
    "Where we look when you ask what is nearby. Rounded to about a hundred " +
    "metres, so it can centre a search and cannot name a building.",
  locationNone: "No saved area.",
  locationForget: "Forget this area",
  privacyPublic: "Your public profile",
  privacyPublicBlurb:
    "Your display name, your photos and the Food Cred you have earned are " +
    "visible to anyone. Your email, phone and saved area are not.",
  photoTitle: "Photo",
  photoAdd: "Add a photo",
  photoChange: "Change photo",
  photoUploading: "Uploading…",
  photoHint: "Shown beside your reviews and on the leaderboard.",
  photoFailed: "That photo did not upload. Try again.",
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
  displayName: "Display name",
  displayNameHint: "Shown on your photos, reviews and leaderboard places.",
  username: "Username",
  /**
   * Signup derives a handle so nobody has to invent one at the door. This is
   * where it can be changed, and the sentence says what changing it costs.
   */
  usernameHint:
    "Your profile address. Changing it breaks links to your old one.",
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
  /**
   * Signing out, which is a farewell rather than a receipt.
   *
   * "You are successfully logged out! Thank you!" reads like a printer. This
   * is the one page somebody sees on their way out, so it says the thing that
   * might bring them back.
   */
  signedOutTitle: "You’re signed out",
  signedOutBody: "See you next time. Ready to discover something good?",
  backHome: "Back to homepage",
  signInAgain: "Sign in again",
  signingOut: "Signing you out…",
  /**
   * Signing up. Three fields: a display name, an email and a password.
   *
   * It used to ask for a first name, a last name, a phone number, a username
   * and the password twice, on a page that looked like a database form —
   * seven boxes before anybody had seen a single dish. Everything that is not
   * needed to create an account is asked for later, if at all.
   */
  registerTitle: "Create your account",
  registerSubtitle:
    "Discover dishes, share photos, and earn your spot on the leaderboard.",
  displayName: "Display name",
  displayNamePlaceholder: "Luis",
  email: "Email",
  emailPlaceholder: "you@example.com",
  /**
   * Under the field, not inside it. A placeholder saying the same thing
   * disappears at the first keystroke — which is the moment somebody starts
   * counting characters.
   */
  passwordHint: (minimum: number) => `At least ${minimum} characters`,
  /** "Register" is what a database form says. */
  register: "Create account",
  registering: "Creating your account…",
  haveAccount: "Already have an account?",
  signInLink: "Sign in",
  /** Above the email form when there is a provider to point at. */
  continueWith: (provider: string) => `Continue with ${provider}`,
  orWithEmail: "or continue with email",
  /**
   * Small, under the button, and not a checkbox. Somebody who has read neither
   * document is not made to have read them by being asked to tick a box; the
   * link is what matters.
   */
  legalPrefix: "By creating an account, you agree to the",
  legalTerms: "Terms",
  /** Spelled out. "Privacy" alone names a topic rather than a document. */
  legalPrivacy: "Privacy Policy",
  legalAnd: "and",
  legalSuffix: ".",
  registerFailed: "Could not create that account. Try again.",
  /** The panel beside the form: what the product is, told with food. */
  pitchTitle: "Know what to order.",
  pitchBody: "See the dishes people actually recommend.",
} as const;

/**
 * Finding food near you.
 *
 * Every string that names a place names an *area* — "near Flushing", never an
 * address and never coordinates. The reader's position is used to ask a
 * question and is never printed back at them.
 */
export const LOCATION_LABELS = {
  useMyLocation: "Use my current location",
  locating: "Finding you…",
  /** Shown once, after a refusal. Never a second prompt. */
  denied: "Location is off for this site.",
  deniedHelp: "Enter a neighborhood, city or ZIP instead.",
  unavailable: "Your device could not give a location.",
  timedOut: "That took too long. Try again, or enter a location.",
  unsupported: "This browser cannot share a location.",
  enterLocation: "Enter a location",
  placeholder: "Neighborhood, city or ZIP",
  find: "Find",
  finding: "Finding…",
  notFound: "We could not find that place. Try a neighborhood or a ZIP.",
  change: "Change",
  /**
   * Which kind of location this is, because the two are kept differently and
   * somebody deciding whether to forget one should know which they have.
   */
  fromDevice: "From your device. Never stored — we ask again each time.",
  fromChoice: "A place you chose. Saved so we can keep using it.",
  changeLocation: "Change location",
  near: (place: string) => `near ${place}`,
  nearYou: "near you",
  useLocationAgain: "Use my current location",
  /**
   * The first-time state, which is a pitch rather than a form.
   *
   * A brand-new visitor is never prompted by the browser on load — that is
   * the intrusion that gets a permission blocked at the browser level — so
   * this has to earn the tap. It says what they get, not what we want.
   */
  discoverTitle: "Discover food near you",
  discoverBlurb: "Choose your location to see nearby restaurants and dishes.",
  /** The sheet heading, once somebody is changing an answer they gave. */
  chooseTitle: "Where should we look?",
  /** Says plainly what a location is for, and what it is not for. */
  privacyNote:
    "We use this to find restaurants near you. It is never shown on your profile.",
  /**
   * The compact indicator that replaces the pitch once we know.
   *
   * A device fix arrives before the server has named the area, so the label
   * can be empty for a moment; "Near you" is vague and true, which is the
   * right pair of properties for a heading about somebody position.
   */
  unnamedArea: "Near you",
  /** Distances are shown in miles: this is New York. */
  miles: (value: number) =>
    value < 0.1 ? "Just here" : `${value.toFixed(1)} mi`,
} as const;

/**
 * Trending, and the honest version of it when there is nothing to show.
 *
 * The empty state is not an apology — it names a real dish at a real
 * restaurant nearby and asks for a photograph, which is the thing this product
 * cannot buy.
 */
export const TRENDING_LABELS = {
  title: "Trending near you",
  titleNear: (place: string) => `Trending near ${place}`,
  subtitle: (place: string) =>
    `Popular dishes people are discovering around ${place}`,
  subtitleGeneric: "Popular dishes people are discovering nearby",
  contributeTitle: (place: string) => `Help put ${place} on the food map`,
  contributeTitleGeneric: "Help people see what is good nearby",
  contributeBlurb: "Add a photo of something you ordered.",
  noPhotos: "No dish photos yet",
  addFirst: "Add the first photo",
  seeDishes: "See dishes",
  photoBy: (who: string) => `Photo by @${who}`,
  /** The counts under a card. Real numbers or nothing — never a rounded-up
   * claim about how popular something is. */
  activity: (photos: number, votes: number) =>
    [
      photos === 1 ? "1 photo" : photos > 1 ? `${photos} photos` : "",
      votes === 1 ? "1 vote" : votes > 1 ? `${votes} votes` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  empty: "Nothing nearby yet.",
} as const;

/**
 * The contributor system, introduced in a few seconds rather than explained.
 *
 * The rules, the thresholds and the leaderboards live on `/rankings`. This is
 * the trailer.
 */
export const CONTRIBUTE_LABELS = {
  title: "Earn your place on the food map",
  blurb: "Share what you eat. Help everyone know what to order.",
  steps: [
    {
      id: "photos",
      title: "Add photos",
      body: "Upload photos of dishes you have actually ordered.",
    },
    {
      id: "help",
      title: "Help the community",
      body: "Useful photos, dish information and votes earn credit.",
    },
    {
      id: "medals",
      title: "Earn badges and climb",
      body: "Build a reputation, earn badges, and move up the leaderboard.",
    },
  ],
  cta: "See how rankings work",
  yourProgress: "Your progress",
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

  /**
   * The saved list.
   *
   * It was three columns - a name, a date and the word "delete" - which said
   * nothing about the food and made a saved restaurant look like a row in an
   * admin table. The date in particular answered a question nobody asks:
   * somebody opening this is deciding where to eat, not auditing when they
   * pressed a heart.
   */
  pageTitle: "Saved",
  pageBlurb: "Restaurants you saved to come back to.",
  emptyTitle: "Nothing saved yet.",
  emptyBody:
    "Tap the heart on a restaurant to keep it here for when you are deciding " +
    "where to eat.",
  emptyCta: "Find places nearby",
  /** Said on the card itself, because the heart is the only control on it. */
  removeFrom: (name: string) => `Remove ${name} from saved`,
} as const;

/**
 * Recently viewed, and what was typed to get there.
 *
 * The page was a name and a formatted timestamp per row, which is precise and
 * unreadable - nobody wants to know they opened a restaurant at 14:32 on a
 * Tuesday, they want to know whether it was today.
 */
export const HISTORY_LABELS = {
  viewedTitle: "Recently viewed",
  searchesTitle: "Recent searches",
  emptyTitle: "Nothing here yet.",
  emptyBody:
    "Restaurants you open show up here, so you can find your way back to " +
    "one you liked the look of.",
  emptyCta: "Find places nearby",
} as const;

/**
 * Said to a screen reader while a page is on its way.
 *
 * The route loader was a spinning ring and nothing else, so somebody on a
 * slow connection using a screen reader was told nothing at all while the
 * page was blank.
 */
export const LOADING_LABELS = {
  page: "Loading",
} as const;

/**
 * The claim wizard.
 *
 * **It says what happens next, at every step.** Claiming is the one flow here
 * where somebody hands over their name and a business email and then waits
 * for a stranger to decide - so a form that just closes is a form that looks
 * like it did nothing.
 *
 * Nothing promises a timescale we cannot keep, and nothing says "verified"
 * before a person has agreed.
 */
export const CLAIM_LABELS = {
  title: "Claim this restaurant",
  intro:
    "Claiming lets you correct the menu and details. A person reviews every " +
    "claim before anything changes.",
  roleStep: "Which are you?",
  detailsStep: "How can we check?",
  reviewStep: "Ready to send",
  nameLabel: "Your full name",
  nameHint: "As it would appear on business paperwork.",
  emailLabel: "Business email",
  emailHint:
    "An address at the restaurant's own domain helps most. A personal " +
    "address is fine if that is what you use.",
  phoneLabel: "Business phone",
  explanationLabel: "Anything else that helps",
  explanationHint:
    "How you are connected to the restaurant, or where we can see it.",
  back: "Back",
  next: "Next",
  submit: "Send claim",
  submitting: "Sending…",
  /** Said after, because a form that closes silently looks like it failed. */
  sentTitle: "Claim sent",
  sentBody:
    "A person will look at this. You will keep your access to the rest of " +
    "the app in the meantime.",
  close: "Close",
  failed: "That did not send. Nothing has been submitted — try again.",
  requiredName: "Add the name a reviewer would recognise.",
  requiredContact: "Add a business email or a phone number.",
  /** Shown when the server offers no enabled method at all. */
  noMethods: "Claiming is not available for this restaurant right now.",
} as const;

/**
 * The verified-business mark.
 *
 * **It certifies a role, never a purchase.** `MEMBERSHIP_LABELS.notForSale`
 * already says memberships buy nothing a role decides, and this is the
 * clearest case: a badge somebody could pay for is not a badge.
 *
 * The wording is about who manages the page, not about the food. "Verified"
 * next to a restaurant's name could easily be read as a quality rating, and
 * this product's one ranking claim is the community vote.
 */
export const VERIFIED_LABELS = {
  badge: "Verified business",
  explain: "Someone from this restaurant manages this page.",
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
  /**
   * The tile's accessible name. "Chinese" alone tells a screen reader the
   * word and not what tapping it does, and the image is decorative — the
   * cuisine is the content, the photograph illustrates it.
   */
  findNearby: (cuisine: string) => `Find ${cuisine} food near you`,
} as const;

/**
 * Menu corrections. The menus are extracted by a language model, so they are
 * wrong in ordinary ways — and the person who can see that is sitting in front
 * of the dish.
 */
export const CORRECTION_LABELS = {
  /** The second half of the reason list: not a field, but the dish itself. */
  aboutTheDish: "About the dish",
  note: "Anything to add",
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

/**
 * The map. Every string here has a list equivalent beside it — a map is
 * unusable with a keyboard and a screen reader, so it is the decorative half
 * of nearby discovery and never the only way to read the answer.
 */
/**
 * Adding a dish, and what the menu says about where each one came from.
 *
 * The tone is the whole design here. Most menus are mostly wrong or mostly
 * missing, so contributing has to read as normal rather than as reporting a
 * fault — "Add a dish we missed" admits the gap is ours, which it is.
 */
export const MENU_EDIT_LABELS = {
  addDish: "Add a dish we missed",
  /**
   * When there is no menu at all.
   *
   * "Add a dish we missed" claims we read this menu and overlooked one dish.
   * On a restaurant where extraction found nothing, that is false twice over:
   * we have no menu, and what is being asked for is not a correction but the
   * first entry. It also understates the ask — somebody who thinks they are
   * patching a gap adds one dish, where the honest framing invites the menu.
   */
  startMenu: "Help add this menu",
  /** In the review queue, where the reviewer is not the contributor. */
  queueTitle: "Dishes diners added",
  queueEmpty: "No dishes waiting.",
  accept: "Add to menu",
  reject: "Not on this menu",
  addTitle: "Add a dish",
  addIntro:
    "Menus here are read automatically, so they miss things. If you can see a dish that is not listed, add it.",
  signInFirst: "Sign in to add a dish",
  name: "Dish name",
  namePlaceholder: "Soup dumplings",
  section: "Part of the menu",
  sectionPlaceholder: "Small plates",
  price: "Price",
  priceHint: "Optional",
  description: "Description",
  descriptionHint: "Optional",
  submit: "Add dish",
  submitting: "Adding…",
  cancel: "Cancel",
  /** Said plainly, because the alternative is somebody adding it twice. */
  queued: "Added. It will show on the menu while somebody checks it.",
  published: "Added to the menu.",

  // --- what a dish says about itself ---------------------------------------
  //
  // Only ever shown when it changes what a reader should believe. An
  // extracted dish carries no badge at all: that is almost every dish, and a
  // label on all of them is a label on none of them.
  community: "Added by a diner",
  communityBy: (who: string) => `Added by ${who}`,
  pending: "Waiting to be checked",
  ownerVerified: "Confirmed by the restaurant",
  unavailable: "Not available right now",

  // --- and what the menu as a whole says -----------------------------------
  menuVerified: "Menu confirmed by the restaurant",
  menuUpdated: (when: string) => `Menu updated ${when}`,
} as const;

/**
 * Managing a menu, for somebody who runs the restaurant.
 *
 * A separate mode rather than edit controls sprinkled through the customer
 * view. A diner deciding what to order should never see a delete button, and
 * an owner fixing a price should not have to hunt for one between the
 * photographs.
 */
export const MANAGE_MENU_LABELS = {
  open: "Manage menu",
  title: "Manage menu",
  back: "Back to the menu",
  intro:
    "Changes here are live straight away. Everything is recorded and can be undone.",
  pending: (count: number) =>
    count === 1 ? "1 dish waiting to be checked" : `${count} dishes waiting to be checked`,
  verifyMenu: "Confirm this menu is right",
  verifying: "Confirming…",
  verified: (when: string) => `Confirmed ${when}`,
  verifyHelp:
    "Tells diners the restaurant stands behind this menu. Dishes still waiting to be checked are not included.",

  addDish: "Add a dish",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  markUnavailable: "Mark unavailable",
  markAvailable: "Back on the menu",
  archive: "Remove from menu",
  archiveConfirm: "Remove this dish?",
  archiveHelp: "Its photos and votes are kept, and you can put it back.",
  restore: "Put back",
  approve: "Accept",
  reject: "Reject",
  history: "History",

  sections: "Sections",
  sectionsHelp: "Drag to reorder. Removing a section keeps its dishes.",
  addSection: "Add a section",
  renameSection: "Rename",
  saveSections: "Save sections",
  moveUp: "Move up",
  moveDown: "Move down",
  empty: "No dishes yet.",
  emptyHelp: "Add the first one, or wait for the menu to be read automatically.",
} as const;

/**
 * The discovery section on the front door.
 *
 * Named apart from `TRENDING_LABELS`, which belongs to the dish strip. Two
 * sections, two vocabularies, and confusing them is how a heading ends up
 * claiming something the data behind it does not support.
 *
 * Two vocabularies for two modes, and the server picks. "Trending" and "hot"
 * are claims about what other people have been doing and need the activity to
 * back them; "popular" and "worth a look" claim only that we know the place.
 * Using the first set over three page views is the one thing this section
 * must never do.
 */
export const DISCOVERY_LABELS = {
  trendingNear: (area: string) => `Trending near ${area}`,
  trendingNearYou: "Trending near you",
  thisMonth: "Where people have been looking this month",

  popularNear: (area: string) => `Discover near ${area}`,
  popularNearYou: "Discover near you",
  discoverBlurb: "Places nearby worth knowing about",

  hotPick: "Hot near you",
  worthALook: "Worth a look",
  /**
   * Says why, and stays true when the number is small. "Popular with diners
   * this month" over two people would be the same fabrication in a sentence.
   */
  whyHot: (contributors: number) =>
    contributors > 2
      ? "People have been photographing and voting on this one"
      : "Getting attention this month",
  whyLook: "Near you, and we have a menu for it",
  noPhotoYet: "No photos of this one yet",

  seeAllNearby: "See all nearby",
} as const;

export const CONTACT_LABELS = {
  title: "Get in touch",
  blurb:
    "A menu we have wrong, a restaurant we are missing, or anything else. No account needed.",
  name: "Your name",
  email: "Your email",
  subject: "Subject",
  message: "Message",
  submit: "Send message",
  sending: "Sending…",
  sent: "Message sent.",
  /** Names the receipt, because that is the part somebody can check. */
  sentHelp: "We have emailed you a copy, and we will come back to you.",
  failed: "That message could not be sent.",
  unavailable: "The form is not working right now. Please email us at",
} as const;

/**
 * Pictures on a restaurant card, and saying where they came from.
 *
 * Attribution is a rule rather than a nicety: Google's terms require the
 * credit that arrived with a photo to be displayed with it, and the product's
 * own credibility rests on a reader always being able to tell a diner's
 * photograph from a borrowed one.
 */
export const IMAGERY_LABELS = {
  viaGoogle: (who: string) => `${who} · Google`,
  /** Said on a card that borrowed its picture, where there is room. */
  borrowed: "Photo via Google",
  /** The invitation the fallback drawing carries on a menu. */
  noPhotoYet: "No photos yet",
  /** A curated photograph credits its photographer and names no dish. */
  photoBy: (who: string) => `Photo by ${who}`,
} as const;

/**
 * Taste preferences.
 *
 * The tone is the feature: this is an offer, not a form. "Pick a few" rather
 * than "select your preferences", "Skip for now" rather than "Cancel", and a
 * line saying plainly what the answer is used for.
 *
 * **No ranking superlatives here.** "Best coffee in NYC" is a claim the data
 * cannot support on a catalogue where 6,783 of 6,786 restaurants have no menu,
 * and a product that overclaims once is not believed the next time. What these
 * sections say is what is true: worth trying, popular near you, people are
 * photographing this. Stronger words are earned later, by votes and photographs
 * that exist.
 */
export const TASTE_LABELS = {
  /**
   * The rest of somebody's saved tastes, on request.
   *
   * A hard cap silently discards preferences they deliberately chose; this
   * admits there are more and costs one tap. Counted, so the tap is a known
   * quantity rather than an open door.
   */
  showMore: (count: number) =>
    count === 1 ? "Show 1 more taste" : `Show ${count} more tastes`,
  title: "What are you into?",
  blurb: "Pick a few so we can show you better food near you.",
  save: "Save my tastes",
  saving: "Saving…",
  saved: "Saved. Your feed will use these.",
  skip: "Skip for now",
  suggestion: (count: number) =>
    `Pick at least ${count} for better recommendations.`,
  why: "We use your tastes to personalize nearby recommendations. You can change them anytime.",
  /** The quiet return, for somebody who skipped. One line, never the card. */
  reminder: "Personalize your food feed",
  manageTitle: "Taste preferences",
  manageBlurb: "What you are into, and what your feed uses.",
  /**
   * Where to go once it is saved.
   *
   * On its own page this was a dead end: the tastes saved, a line said so,
   * and there was nothing to press and nowhere to go - so the only way on was
   * the browser's back button. The whole point of saving these is the feed
   * that uses them, so that is what it offers.
   */
  seeFeed: "See what is near you",
  backToSettings: "Back to settings",
  /**
   * Group headings. An unrecognised kind is title-cased rather than dropped —
   * the server may invent one, and a category that silently fails to render
   * is worse than an unstyled heading.
   */
  group: (kind: string) =>
    kind === "cuisine"
      ? "Cuisines"
      : kind === "food"
        ? "Food and drink"
        : kind.charAt(0).toUpperCase() + kind.slice(1),
  /**
   * Section headings on a personalised homepage.
   *
   * Deliberately modest. "Worth trying" and "near you" are things we can
   * support from what we hold; "#1 sushi in Flushing" is not, and would be a
   * ranking claim on a catalogue that has barely been voted on.
   */
  forYou: (place: string) => `For you near ${place}`,
  forYouGeneric: "For you",
  /**
   * Just the category. "Coffee", "Sushi", "Ramen".
   *
   * These read "Coffee near Flushing", "Sushi near Flushing", "Ramen near
   * Flushing" - the same three words repeated down the page, in the same
   * weight as the word that actually distinguishes one section from the next.
   * Somebody scrolling had to read each heading carefully to find the one
   * they wanted, which is the opposite of what a heading is for.
   *
   * The place is established once, above, by `forYou` - so repeating it per
   * section is noise the eye has to skip over four times.
   */
  sectionTitle: (taste: string) => taste,
  seeAll: "See all",
} as const;

/**
 * The shortcut row under the search box.
 *
 * The words stay plain because the row is a set of destinations, not a
 * feature: "More" and "Map" say exactly what they do, and the caption exists
 * only so a reader can tell why these four are the four.
 */
export const QUICK_LABELS = {
  label: "Browse food nearby",
  more: "More",
  moreTitle: "Browse by category",
  map: "Map",
  /** Said quietly, because personalisation nobody can see is just the
   * product deciding for them. */
  personalised: "Based on your tastes",
} as const;

export const MAP_LABELS = {
  label: "Map of nearby restaurants",
  searchThisArea: "Search this area",
  recentre: "Back to my location",
  list: "List",
  map: "Map",
  closePreview: "Close",
  /** The dish somebody photographed, which is what we know and Google does
   * not. Never a star rating. */
  topDish: (dish: string) => `Try the ${dish}`,
} as const;

/**
 * Nearby results.
 *
 * A restaurant with no community photograph is listed rather than hidden: it
 * is a real place a short walk away, and the empty tile is the ask.
 */
/**
 * The menu, while it is still being worked out.
 *
 * **Nothing here names a mechanism.** No model, no extraction, no jobs, no
 * catalogue. Somebody sitting at a table wants to know whether food is about
 * to appear on their phone; how it gets there is our problem, and a sentence
 * that mentions ours is a sentence that reads as an excuse.
 *
 * Two stages, because the honest thing to say changes. The first few seconds
 * are a normal wait. Past that it is worth saying the page is usable without
 * it, so nobody sits watching a panel that may not resolve.
 */
export const MENU_STATUS_LABELS = {
  /**
   * **It says what is happening to this restaurant, not what the page is
   * doing.** "Getting the menu ready" beside a two-pixel dot, in the middle
   * of an otherwise empty panel, read as a page that had failed to load
   * something — which on a catalogue where most restaurants have no menu is
   * exactly the wrong impression to give.
   */
  pendingTitle: "Preparing this restaurant's menu",
  pendingBody: "Finding dishes and organising the menu…",
  /**
   * The important sentence, and the reason the wait is bearable. The work is
   * on a background thread and survives the tab being closed, so nobody
   * needs to sit here guarding it.
   */
  keepBrowsing:
    "You can keep browsing — we'll carry on preparing it in the background.",
  slowTitle: "This is taking longer than usual",
  slowBody:
    "We're still preparing this menu. You can keep browsing and come back " +
    "later.",
  /**
   * Not an apology and not a dead end. Most restaurants in the world have no
   * menu online, so this is a normal outcome rather than a fault - and the
   * page underneath it is still worth reading.
   */
  failedTitle: "We couldn't prepare this menu right now",
  failedBody: "Something interrupted the menu preparation.",
  /**
   * Said only where it is true. A restaurant that has used up its attempts
   * gets the sentence and no button — offering one that spends money to fail
   * a fourth time is worse than offering none.
   */
  exhaustedBody:
    "We couldn't read a menu for this place. You can still add a dish " +
    "yourself.",
  retry: "Try again",
  /** The bar's accessible name. It has no percentage, because we have none. */
  progressLabel: "Preparing the menu",
} as const;

export const NEARBY_LABELS = {
  title: "Near you",
  titleNear: (place: string) => `Near ${place}`,
  cuisineNear: (cuisine: string, place: string) => `${cuisine} near ${place}`,
  cuisineNearYou: (cuisine: string) => `${cuisine} near you`,
  empty: "No restaurants around here yet.",
  emptyHelp: "Try a wider area, or search for a restaurant by name.",
  /**
   * The same page with a filter on it is a different answer, and blaming the
   * neighbourhood for it sends the reader to the wrong fix.
   *
   * "No restaurants around here yet" was shown for "Coffee near you" while
   * five coffee shops stood within four hundred metres — the filter was the
   * problem and the sentence pointed at the area. Naming the category, and
   * offering the one tap that removes it, is the difference between a dead
   * end and a choice.
   */
  emptyFiltered: (category: string) => `No ${category.toLowerCase()} around here yet.`,
  emptyFilteredHelp: "It may be a little further out, or not on our map yet.",
  showEverything: "Show everything nearby",
  /**
   * Shown while we are looking somewhere we have never looked before.
   *
   * Says what is happening to the reader and nothing about how. "Overpass",
   * "import" and "catalogue" are our problems - somebody standing on a corner
   * wanting lunch has no use for any of them, and the sentence has to be true
   * whether we find thirty more places or none.
   */
  findingMore: "Finding more places nearby…",
  unavailable: "Nearby search is not available right now.",
  /** On the row, beside the name. Says what it does, not what it is. */
  showOnMap: (name: string) => `Show ${name} on the map`,
  seeDishes: "See dishes",
  noPhotos: "No dish photos yet",
  addFirst: "Add the first photo",
  needLocation: "Choose where to look",
  /** Under a cuisine heading, which on its own reads like a promise of
   *  results that are about to appear. */
  needLocationHelp: "Tell us where to look and we will show you what is nearby.",
  results: (count: number) =>
    count === 1 ? "1 restaurant" : `${count} restaurants`,
  /**
   * Every further batch is asked for, never fetched because a page opened.
   *
   * Named rather than an infinite scroll: a reader deciding where to eat in
   * under a minute is served better by a list that ends than by one that
   * grows under their thumb, and every batch is a query somebody chose to
   * spend.
   */
  showMore: "Show more restaurants",
  /** The same, for results the reader asked for by moving the map. */
  showMoreArea: "Show more in this area",
  loadingMore: "Loading…",
  /** Said above results measured from somewhere the reader panned to. */
  /**
   * Real counts or nothing. Never a rounded-up claim about how popular
   * somewhere is — the numbers are small and saying so honestly is what makes
   * them worth believing when they grow.
   */
  community: (photos: number, contributors: number) =>
    contributors > 1
      ? `${photos} photo${photos === 1 ? "" : "s"} from ${contributors} diners`
      : `${photos} photo${photos === 1 ? "" : "s"}`,
  inThisArea: "In this area",
  backToNearby: "Back to nearby",
  /** The active filter, and the way out of it. Shown as a chip because that
   * is what it is — a thing that is on and can be turned off. */
  clearFilter: (cuisine: string) => `${cuisine} · clear`,
  clearFilterLabel: (cuisine: string) => `Clear the ${cuisine} filter`,
  allFood: "All food nearby",
} as const;

/**
 * How Food Cred works, said in words rather than numbers.
 *
 * **No point values here, on purpose.** `customConstants/reputation.ts` holds
 * none either: a copy of the server's figures in the browser is a second
 * source of truth and invites a page to state a rule the server never agreed
 * to. What this page describes is the shape — which contributions are worth
 * more and why — which is what a contributor needs and what does not drift.
 */
export const RANKINGS_LABELS = {
  title: "How rankings work",
  blurb:
    "Food Cred is what this community owes you for helping other diners " +
    "decide what to order.",
  earningTitle: "What earns the most",
  earningBlurb:
    "Quality over quantity, deliberately. Nobody reaches the top of a " +
    "leaderboard by uploading five hundred mediocre photos.",
  earning: [
    {
      title: "The first photo of a dish",
      body:
        "Worth more than any later one. An unphotographed dish is the gap " +
        "this product exists to close, and only one person can close it.",
    },
    {
      title: "The first photo at a restaurant",
      body: "Worth more again — it puts a whole menu on the map.",
    },
    {
      title: "A photo other diners find helpful",
      body:
        "Counted once per person, so a photo cannot be voted up repeatedly " +
        "by the same account.",
    },
    {
      title: "Your photo becoming the main one",
      body:
        "Earned once per photo, even if it wins the slot back later — " +
        "otherwise a photo flapping in and out would pay every time.",
    },
    {
      title: "A menu correction that is accepted",
      body: "Someone has to agree with it first. Suggesting is not earning.",
    },
  ],
  notEarningTitle: "What earns nothing",
  notEarning: [
    "A photo that moderation rejects. Nothing is written at all.",
    "A duplicate of a photo already on that dish.",
    "A contribution that is later removed — the credit is reversed with it.",
    "Voting on your own photograph.",
  ],
  levelsTitle: "Levels",
  levelsBlurb:
    "Levels are bands of lifetime Food Cred and are worked out by the " +
    "server, never by this page — so what you see is what you have, and the " +
    "bands can change without anybody's level being wrong for a while.",
  badgesTitle: "Your badges",
  boardsTitle: "Leaderboards",
  boardsBlurb:
    "Every restaurant has one, and they are counted per place rather than " +
    "globally: the person who has done most for one restaurant is a more " +
    "useful thing to know than who has done most overall. Neighbourhood and " +
    "city boards read the same numbers.",
  join: "Create an account",
} as const;

/**
 * The cost page.
 *
 * The hit rate is the headline rather than the spend: the bill is a symptom,
 * and the proportion of searches answered from our own rows is what decides
 * it. It should climb on its own as the catalogue fills.
 */
export const USAGE_LABELS = {
  title: "API usage and cost",
  hitRate: "Local search hit rate",
  hitRateBlurb: (local: number, total: number) =>
    total
      ? `${local.toLocaleString()} of ${total.toLocaleString()} searches this month were answered without calling anybody.`
      : "No searches yet this month.",
  noSearchesYet: "—",
  today: "Today",
  thisMonth: "This month",
  nothingYet: "Nothing yet.",
  unavailable: "Usage reporting is not available right now.",
  heaviest: "Heaviest callers, last 24 hours",
  heaviestNote: "Hashed handles, not addresses.",
  signedInCaller: (id: string) => `User ${id}`,
  unknownCaller: "Unknown",
  /** "google · autocomplete" reads as machinery; these read as spending. */
  operation: (provider: string, operation: string) => {
    const names: Record<string, string> = {
      autocomplete: "Google autocomplete",
      place_details: "Google place details",
      text_search: "Google text search",
      chat: "OpenAI requests",
      restaurant_search: "Restaurant searches",
    };

    const name = names[operation] ?? `${provider} ${operation}`;

    return operation === "restaurant_search"
      ? `${name} (${provider === "local" ? "served locally" : "needed Google"})`
      : name;
  },
} as const;

/**
 * Membership.
 *
 * `notForSale` is the important one and is on the page rather than only in a
 * comment: reputation and moderation are the two things a membership must
 * never include, and somebody looking at a price deserves to know what they
 * are not buying.
 */
export const MEMBERSHIP_LABELS = {
  title: "Support What's dat food",
  blurb:
    "The photographs, the rankings and the menus stay free for everyone. " +
    "This is for people who want to help keep them coming.",
  choose: (plan: string) => `Choose ${plan}`,
  /** A plan with no checkout behind it yet. */
  notYet: "Not available yet.",
  /** The Pro page with no plans configured. Said plainly, not as a teaser. */
  nothingYet: "There is nothing to sign up for yet.",
  notForSale:
    "Food Cred, badges and leaderboard places are earned, never bought — " +
    "and membership grants no moderation or editing rights over anybody " +
    "else's contributions.",
  /** The account row and the footer link, when there are plans. */
  link: "Membership",
  memberSince: (tier: string) => `You are a ${tier} member. Thank you.`,
} as const;

/**
 * Feature states, for the admin console.
 *
 * Read-only on purpose: changing one is an environment variable and a
 * restart. A switch that flips a product live from a web page is one
 * mis-click away from launching it, and the deploy history is the audit trail.
 */
export const FEATURE_LABELS = {
  title: "Feature flags",
  name: (key: string) =>
    ({ pro: "WhatsDatFood Pro" })[key] ?? key,
  status: (state: string) =>
    ({
      hidden: "Hidden",
      internal_testing: "Internal testing",
      live: "Live",
    })[state] ?? state,
  explain: (state: string) =>
    ({
      hidden: "Nobody can see it, including you.",
      internal_testing: "Admins only. Everybody else sees no trace of it.",
      live: "Publicly available.",
    })[state] ?? "",
} as const;
