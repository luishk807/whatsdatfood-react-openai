import { type FC } from "react";
import { Link, useLocation } from "react-router-dom";
import AccountNav from "@/components/AccountNav";
import useAuth from "@/customHooks/useAuth";
import { UserAccountLayoutInterface } from "@/interfaces/users";
import { ACCOUNT_LABELS } from "@/customConstants/account";
import { ROUTES } from "@/customConstants/routes";

/**
 * The frame around every account page.
 *
 * The menu is a column beside the content on a wide screen and absent on a
 * phone, where it would be a third of the width squeezed against a form. There
 * the account screen itself is the menu — see the `/account` page — and each
 * destination opens on its own with a way back.
 */
const UserAccountLayout: FC<UserAccountLayoutInterface> = ({
  children,
  sectionTitle,
}) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const onTheMenu = pathname === ROUTES.account;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4">
      {user && (
        <p className="text-sm text-ink-muted">
          {ACCOUNT_LABELS.signedInAs}{" "}
          <span className="font-medium text-ink">
            {[user.first_name, user.last_name].filter(Boolean).join(" ") ||
              user.username}
          </span>
        </p>
      )}

      <div className="mt-4 flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <AccountNav variant="sidebar" />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Only on a phone, and only away from the menu itself: on a wide
              screen the sidebar is the way back, and on the menu it pointed at
              the page it was already on. */}
          {!onTheMenu && (
            <Link
              to={ROUTES.account}
              className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink lg:hidden"
            >
              ‹ {ACCOUNT_LABELS.open}
            </Link>
          )}

          {sectionTitle && (
            <h1 className="mb-4 text-xl font-semibold tracking-tight text-ink">
              {sectionTitle}
            </h1>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default UserAccountLayout;
