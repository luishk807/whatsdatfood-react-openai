import { Link } from "react-router-dom";
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
 * One control on the right, not two. The theme used to sit beside the account
 * icon, kept there because a signed-out visitor had no account menu and would
 * lose it. `AccountButton` opens for everybody now and holds Appearance, so
 * the bar is a brand and a way in - which is all a phone header has room to
 * be.
 */
const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          to={ROUTES.home}
          className="truncate text-base font-semibold tracking-tight text-ink"
        >
          {SITE_LABELS.brand}
        </Link>

        <div className="flex shrink-0 items-center">
          <AccountButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
