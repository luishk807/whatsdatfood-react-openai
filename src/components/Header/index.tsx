import { Link } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import AccountButton from "@/components/AccountButton";
import { ROUTES } from "@/customConstants/routes";
import { SITE_LABELS } from "@/customConstants/labels";

/**
 * Brand on the left, account on the right, and nothing else.
 *
 * There is no hamburger. Signed in it produced a sheet containing the account
 * button, which opened a second sheet - and everything it held is either
 * user navigation, which belongs in the account menu, or About and Contact,
 * which belong in the footer.
 *
 * The theme control stays here rather than moving into Settings: a signed-out
 * visitor has no account menu, and the theme would become unreachable for the
 * people most likely to be looking at a bright screen in a dark restaurant.
 */
const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          to={ROUTES.home}
          className="truncate text-base font-semibold tracking-tight text-ink"
        >
          {SITE_LABELS.brand}
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

          {user ? (
            <AccountButton />
          ) : (
            <Link
              to={ROUTES.signIn}
              className="rounded-full px-3 py-2 text-sm text-ink-muted hover:text-ink"
            >
              {SITE_LABELS.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
