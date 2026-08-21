import { type FC } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { AccountRowIcon } from "@/components/AccountButton/icons";
import { ChevronRightIcon } from "@/components/icons";
import useAuth from "@/customHooks/useAuth";
import { ACCOUNT_GROUPS, ACCOUNT_LABELS } from "@/customConstants/account";
import { ACCOUNT_TYPE } from "@/customConstants";
import { ROUTES } from "@/customConstants/routes";
import { AccountNavInterface } from "@/interfaces/users";

/**
 * The account menu, in the two shapes it needs to take.
 *
 * `sidebar` is the column beside the content on a wide screen. `list` is the
 * whole page on a phone, where a sidebar squeezed alongside a form is neither
 * a menu nor a page — the account screen becomes a list of destinations and
 * each one opens on its own.
 *
 * Both read from `ACCOUNT_GROUPS`, which already existed for the header
 * dropdown and was never wired in here: the sidebar had its own flat copy of
 * the same routes with worse words on them ("Setting", "Manage").
 *
 * A group marked `adminOnly` is dropped for everybody else. That is a matter
 * of not advertising a page somebody cannot use — the server refuses the
 * queries either way, and the console says so rather than rendering blank.
 */
const AccountNav: FC<AccountNavInterface> = ({ variant }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isList = variant === "list";

  // The role, not a prop: this menu renders from two places and a flag threaded
  // through both is a flag one of them eventually stops passing. The route is
  // guarded on the server regardless — hiding a link is not access control.
  const isAdmin = String(user?.role_id ?? "") === ACCOUNT_TYPE.admin;
  const groups = ACCOUNT_GROUPS.filter(
    (group) => !("adminOnly" in group && group.adminOnly) || isAdmin,
  );

  return (
    <nav aria-label={ACCOUNT_LABELS.open} className="w-full">
      {/* The same entry point the drawer header is, because the account page
          is the other way in and the two must not disagree about where a
          person's own details live. Removing the "Settings" row without this
          would leave the page reachable only by typing its address. */}
      {user && (
        <Link
          to={ROUTES.settings}
          className={clsx(
            "mb-2 flex min-h-14 items-center gap-3 rounded-card px-3 text-sm hover:bg-surface-sunken",
            pathname === ROUTES.settings && "bg-surface-sunken",
          )}
        >
          <span className="text-ink-muted">
            <AccountRowIcon name="gear" />
          </span>
          <span className="min-w-0 flex-1 font-medium text-ink">
            {ACCOUNT_LABELS.viewProfile}
          </span>
          <span aria-hidden="true" className="shrink-0 text-ink-muted">
            <ChevronRightIcon size={16} />
          </span>
        </Link>
      )}

      <ul className={clsx("flex flex-col", isList ? "gap-px" : "gap-1")}>
        {groups.map((group, index) => (
          <li key={group.id}>
            {/* A rule between groups rather than a heading. The groups say what
                belongs together; naming them adds words nobody reads - with
                one exception below, which is a different mode rather than
                more of your own things. */}
            {index > 0 && (
              <div
                className={clsx("border-t border-line", isList ? "my-2" : "my-2")}
              />
            )}

            {"label" in group && group.label && (
              <p className="px-3 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                {group.label}
              </p>
            )}

            <ul className={clsx("flex flex-col", isList ? "gap-px" : "gap-0.5")}>
              {group.items.map((item) => {
                const active = pathname === item.route;

                return (
                  <li key={item.route}>
                    <Link
                      to={item.route}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex items-center gap-3 rounded-card text-ink",
                        isList
                          ? "px-1 py-3.5 text-base"
                          : "px-3 py-2 text-sm hover:bg-surface-sunken",
                        active && !isList && "bg-surface-sunken font-medium",
                        active && isList && "font-medium",
                      )}
                    >
                      <span className="text-ink-muted">
                        <AccountRowIcon name={item.icon} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {isList && (
                        <span aria-hidden="true" className="text-ink-muted">
                          ›
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-2 border-t border-line pt-2">
        <Link
          to={ROUTES.logout}
          className={clsx(
            "flex items-center rounded-card text-ink-muted hover:text-ink",
            isList ? "px-1 py-3.5 text-base" : "px-3 py-2 text-sm",
          )}
        >
          {ACCOUNT_LABELS.logOut}
        </Link>
      </div>
    </nav>
  );
};

export default AccountNav;
