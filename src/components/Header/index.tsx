import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import AccountButton from "@/components/AccountButton";
import { ROUTES } from "@/customConstants/routes";
import { SITE_LABELS } from "@/customConstants/labels";

/**
 * Mobile first: a wordmark and one 44px target. Everything else lives in the
 * sheet behind it, because five links across a phone is five links nobody can
 * hit. Desktop gets the same links laid out flat.
 *
 * The old header carried About and Contact, neither of which went anywhere,
 * and an unlabelled person icon that meant "sign in" only if you already knew.
 */
const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // A menu that survives navigation is a menu covering the page you asked for.
  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : previous;
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const signedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          to={ROUTES.home}
          className="text-base font-semibold tracking-tight text-ink"
        >
          {SITE_LABELS.brand}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {signedIn ? (
            <AccountButton />
          ) : (
            <Link
              to={ROUTES.signIn}
              className="rounded-full px-3 py-2 text-sm text-ink-muted hover:text-ink"
            >
              {SITE_LABELS.signIn}
            </Link>
          )}
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={SITE_LABELS.menu}
          aria-expanded={open}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <nav className="absolute inset-x-0 top-0 flex flex-col gap-1 bg-surface p-4 shadow-sheet">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-base font-semibold text-ink">
                {SITE_LABELS.brand}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={SITE_LABELS.closeMenu}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {signedIn ? (
              <AccountButton />
            ) : (
              <>
                <Link
                  to={ROUTES.signIn}
                  className="rounded-lg px-2 py-3 text-base text-ink hover:bg-surface-sunken"
                >
                  {SITE_LABELS.signIn}
                </Link>
                <Link
                  to={ROUTES.createAccount}
                  className="rounded-lg px-2 py-3 text-base text-ink hover:bg-surface-sunken"
                >
                  {SITE_LABELS.createAccount}
                </Link>
              </>
            )}

            <div className="mt-2 border-t border-line pt-3">
              <ThemeToggle expanded />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
