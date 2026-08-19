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
