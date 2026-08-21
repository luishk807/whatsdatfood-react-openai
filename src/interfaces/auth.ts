import { type ReactNode } from "react";

/** The shared field on the two auth pages. */
export interface AuthFieldInterface {
  /** Doubles as the input's `id`, so the label points at something real. */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  name?: string;
  autoComplete?: string;
  placeholder?: string;
  /**
   * Said before the field is touched rather than after it is submitted — "At
   * least 8 characters" under an empty password box is a rule; the same
   * sentence in red after a failed submit is a telling-off.
   */
  hint?: string;
  required?: boolean;
  /** Set once the form has been submitted and this field is why it failed. */
  error?: string;
  /** Offers Show/Hide. Only meaningful on a password field. */
  revealable?: boolean;
}

/**
 * A third-party sign-in button, when there is a provider to point it at.
 *
 * There is none today — see `AUTH_PROVIDERS`.
 */
export interface AuthProviderInterface {
  id: string;
  label: string;
  onSelect: () => void;
}

/**
 * The shared frame the auth pages are built from.
 *
 * Sign in, create account and sign out were three screens with three ideas
 * about width, borders and button shape — the logout page had a 500px `div`
 * in a stylesheet of its own. These are what stop them drifting apart again.
 */
export interface AuthCardInterface {
  children: ReactNode;
  /**
   * Centre the card in the space the header and footer leave.
   *
   * For a page whose only content is the card — signing out. The two-column
   * auth pages let their column do the centring.
   */
  standalone?: boolean;
  className?: string;
}

export interface AuthButtonInterface {
  children: ReactNode;
  /**
   * Show a loader inside the button and disable it, so a second press cannot
   * submit the same request twice. A page-level spinner for a button-level
   * request throws away the form somebody is looking at.
   */
  busy?: boolean;
  /** What it says while working — "Signing in…". */
  busyLabel?: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export interface AuthLinkInterface {
  to: string;
  children: ReactNode;
}
