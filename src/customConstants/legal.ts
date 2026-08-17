/**
 * Privacy policy and terms.
 *
 * Written against what the database actually holds and what the code actually
 * calls, not from a template: every item below was checked against a column or a
 * request. A policy that describes a different product is worse than none,
 * because it is a published statement that happens to be false.
 *
 * These are drafts. They have not been reviewed by a lawyer.
 */

export const LEGAL_EFFECTIVE = "17 August 2026";
export const LEGAL_CONTACT = "info@whatsdatfood.com";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const PRIVACY_TITLE = "Privacy";
export const TERMS_TITLE = "Terms of use";

export const PRIVACY_INTRO =
  "What's dat food answers two questions: what a dish looks like, and what to order. This describes everything we store about you to do that, and what we do not.";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "What you give us when you sign up",
    bullets: [
      "Your name and username.",
      "Your email address, which is how we reach you and how you recover your account.",
      "Your phone number, if you choose to add one. It is optional.",
      "Your date of birth.",
      "Your password, stored only as a bcrypt hash. Nobody at What's dat food can read it, and it is never returned by our API.",
    ],
  },
  {
    heading: "What we record as you use the site",
    paragraphs: [
      "You do not need an account to browse. These are recorded only while you are signed in.",
    ],
    bullets: [
      "Restaurants you search for, and restaurants you open.",
      "Dishes you vote on, and any written review you leave.",
      "Dishes you mark as having ordered.",
      "Restaurants you favourite.",
      "Photos you upload, and any photo you mark helpful or report.",
    ],
  },
  {
    heading: "Photos you upload",
    paragraphs: [
      "A photo is resized and cropped in your browser before it is sent, so the original file never leaves your device at full size. We strip embedded metadata — including any GPS coordinates your camera recorded — before storing it. What we keep is the image, its dimensions and size, and which account uploaded it.",
      "Uploaded photos are public. They appear on the dish, on the restaurant's menu and may appear on the home page, credited to your username. Do not upload a photo you would not want shown publicly with your name on it.",
    ],
  },
  {
    heading: "Details of other people",
    paragraphs: [
      "If you add a friend, we store the name, email address and phone number you enter for them. That person has not agreed to this and may not know about it. Only add details you have their permission to share, and tell us if someone asks to be removed — we will delete their record.",
    ],
  },
  {
    heading: "Who else sees your data",
    paragraphs: [
      "We do not sell your data and we do not run advertising. We use these services to run the product, and each sees only what it needs:",
    ],
    bullets: [
      "Railway — hosts the application and the database, so it holds everything described here.",
      "Cloudflare — serves the site and stores uploaded photos.",
      "OpenAI — receives a restaurant's name and location to generate its menu. Your account details are never sent.",
      "Google Programmable Search — receives a dish name and restaurant name to find a photo when a dish has none. Your account details are never sent.",
      "Amazon Web Services (Rekognition) — receives an uploaded photo to screen it for unsafe content before it is published.",
      "SendGrid — sends account email.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "One cookie, set when you sign in, which keeps you signed in. It is not used for tracking or advertising, and there are no third-party cookies. Signing out clears it.",
    ],
  },
  {
    heading: "Deleting things",
    paragraphs: [
      "You can delete your own reviews, favourites, saved friends and order records from your account pages at any time.",
      "There is not yet a button to delete your whole account. Until there is, email us and we will delete your account and everything listed here. Photos you have uploaded will also be removed unless we are required to keep a copy while a report about them is being reviewed.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "This site is not intended for children. If you believe a child has created an account, email us and we will remove it.",
    ],
  },
  {
    heading: "Changes and contact",
    paragraphs: [
      `If this policy changes in a way that affects you, we will say so on this page and update the date above. For anything else — a correction, a deletion, or a question about what we hold — email ${LEGAL_CONTACT}.`,
    ],
  },
];

export const TERMS_INTRO =
  "Plain terms for using What's dat food. Using the site means you accept them.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Your account",
    paragraphs: [
      "You need an account to vote, review or upload. Keep your password to yourself; anything done through your account is treated as done by you. Tell us if you think someone else is using it.",
      "We may suspend an account that is used to harass people, to upload content that breaks these terms, or to manipulate rankings.",
    ],
  },
  {
    heading: "Photos you upload",
    paragraphs: [
      "You keep ownership of every photo you upload. It stays yours.",
      "By uploading, you give What's dat food a non-exclusive, worldwide, royalty-free licence to store, resize, and display that photo in the product and to credit it to your username. That licence exists so we can show the photo where it is useful — on the dish, on the restaurant's menu, and on the home page. It ends when the photo is deleted, except for copies already cached or held for a moderation review.",
      "You confirm that you took the photo, or that you have the right to give us this licence. Do not upload a photo you found somewhere else.",
      "Do not upload photos of people who have not agreed to appear, anything unsafe or unlawful, or anything that is not the dish.",
    ],
  },
  {
    heading: "Votes and reviews",
    paragraphs: [
      "Vote and review honestly, from your own experience. Do not vote for a dish you have not eaten, and do not use more than one account to move a ranking.",
      "Reviews are public and credited to your username. We may remove a review that is abusive or is not about the dish.",
    ],
  },
  {
    heading: "Reporting a photo",
    paragraphs: [
      "Any signed-in person can report a photo. A report flags it for review; it does not hide the photo by itself, because a report button that deletes on contact is a delete button anyone can press. We review reports and remove what breaks these terms.",
    ],
  },
  {
    heading: "Menus and prices",
    paragraphs: [
      "Menus are assembled automatically and can be wrong, out of date, or incomplete. Prices in particular are frequently missing or stale. Nothing here is an offer, and none of it comes from the restaurant unless the restaurant has claimed its page.",
      "Check with the restaurant before you rely on anything — especially allergens. Dietary tags are a best guess from the menu text and are not a safety guarantee.",
    ],
  },
  {
    heading: "Restaurants",
    paragraphs: [
      "A restaurant can claim its page to correct its own information. Claiming does not let an owner delete unflattering photos or reviews; moderation stays with us, because an owner who could remove criticism would.",
      "If you are a restaurant and want something removed, email us.",
    ],
  },
  {
    heading: "What we do not promise",
    paragraphs: [
      "The site is provided as it is. We do not guarantee it will be available, accurate, or free of mistakes, and we are not liable for a meal you did not enjoy. Nothing here limits rights you have under the law where you live.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      `Questions, corrections and removal requests: ${LEGAL_CONTACT}.`,
    ],
  },
];
