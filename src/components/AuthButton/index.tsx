import { type FC } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { AuthButtonInterface, AuthLinkInterface } from "@/interfaces/auth";

/**
 * The green button on every auth page, and the quiet link under it.
 *
 * The sign-in page had this as a class string written inline; the logout page
 * used the generic outlined `Button`, which is why "BACK TO HOMEPAGE" came out
 * as a bordered, uppercase, full-width control that looked nothing like the
 * button somebody had pressed two screens earlier.
 *
 * One definition of the primary action: 48px tall, pill, brand green, white
 * type. That height is the same one `AuthField` uses, so a form reads as a
 * single stack rather than as boxes of different sizes.
 *
 * **It carries its own busy state.** A page-level spinner for a button-level
 * request throws away the form somebody is looking at; the loader belongs
 * inside the control that started the work, and the control disables itself so
 * a second press cannot submit twice.
 */
const AuthButton: FC<AuthButtonInterface> = ({
  children,
  busy = false,
  busyLabel,
  type = "button",
  onClick,
  className,
  disabled,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || busy}
    // Announced, so somebody not watching the button still learns it is
    // working. The spinner itself is decorative and stays out of the tree.
    aria-busy={busy || undefined}
    className={clsx(
      "inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand px-4 text-base font-medium text-white transition-colors hover:bg-brand-strong disabled:opacity-60 motion-reduce:transition-none",
      className,
    )}
  >
    {busy && (
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
      />
    )}
    {busy && busyLabel ? busyLabel : children}
  </button>
);

/**
 * The secondary way out of an auth page. A link, not a second button: two
 * buttons of equal weight is two primary actions, and there is only ever one.
 */
export const AuthLink: FC<AuthLinkInterface> = ({ to, children }) => (
  <Link
    to={to}
    className="mx-auto min-h-11 text-center text-sm text-ink-muted underline underline-offset-2 hover:text-ink"
  >
    {children}
  </Link>
);

export default AuthButton;
