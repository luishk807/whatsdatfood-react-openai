import { type FC } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { ChevronLeftIcon } from "@/components/icons";
import useAuth from "@/customHooks/useAuth";
import { ACCOUNT_TYPE } from "@/customConstants";
import {
  SETTINGS_GROUPS,
  SETTINGS_LABELS_HUB,
} from "@/customConstants/settings";
import { ROUTES } from "@/customConstants/routes";
import { SettingsLayoutInterface } from "@/interfaces/settings";

/**
 * The frame around a settings section.
 *
 * **A phone gets one screen at a time**, with "‹ Settings" above the title -
 * the pattern every native settings app uses, and the reason each section is
 * a real route rather than a scroll position. A wide screen gets the list on
 * the left and the section on the right, so the shape of Settings stays
 * visible while you are inside one part of it.
 *
 * Same routes and same components either way. The two-column view is a layout
 * decision, never a second implementation.
 */
const SettingsLayout: FC<SettingsLayoutInterface> = ({ title, children }) => {
  const { pathname } = useLocation();
  const onHub = pathname === ROUTES.settings;
  const { user } = useAuth();
  const isAdmin = String(user?.role_id ?? "") === ACCOUNT_TYPE.admin;
  const groups = SETTINGS_GROUPS.filter(
    (group) => !group.adminOnly || isAdmin,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4">
      {/* Only on a phone, and only inside a section: on a wide screen the
          list beside it is the way back, and on the list itself it would
          point at the page it is already on. */}
      {!onHub && (
        <Link
          to={ROUTES.settings}
          className="mb-3 -ml-1 inline-flex min-h-11 items-center gap-1 text-sm text-ink-muted hover:text-ink lg:hidden"
        >
          <ChevronLeftIcon size={16} />
          {SETTINGS_LABELS_HUB.back}
        </Link>
      )}

      <div className="flex gap-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <h1 className="mb-3 px-3 text-xl font-semibold tracking-tight text-ink">
            {SETTINGS_LABELS_HUB.title}
          </h1>

          <nav className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.id} className="flex flex-col gap-0.5">
                <p className="px-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {group.label}
                </p>

                {group.items.map((section) =>
                  section.available ? (
                    <Link
                      key={section.id}
                      to={section.route}
                      aria-current={
                        pathname === section.route ? "page" : undefined
                      }
                      className={clsx(
                        "rounded-card px-3 py-2 text-sm",
                        pathname === section.route
                          ? "bg-surface-sunken font-medium text-ink"
                          : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {section.label}
                    </Link>
                  ) : (
                    <span
                      key={section.id}
                      aria-disabled="true"
                      className="rounded-card px-3 py-2 text-sm text-ink-muted opacity-60"
                    >
                      {section.label}
                    </span>
                  ),
                )}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <h1
            className={clsx(
              "mb-4 text-xl font-semibold tracking-tight text-ink",
              // On the hub the sidebar already says "Settings"; repeating it
              // beside itself is the kind of duplication a two-column layout
              // invites.
              onHub && "lg:hidden",
            )}
          >
            {title}
          </h1>

          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
