import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import clsx from "clsx";
import useAuth from "@/customHooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import { ROUTES } from "@/customConstants/routes";
import { ACCOUNT_GROUPS, ACCOUNT_LABELS } from "@/customConstants/account";
import { ACCOUNT_TYPE } from "@/customConstants";
import { AccountRowIcon, PersonIcon } from "./icons";

/**
 * The account menu.
 *
 * Was seven items of identical weight in a floating box under a small icon.
 * Now grouped, and a bottom sheet on a phone: seven cramped targets under a
 * 20px icon is not something a thumb can use, and this is a product people
 * hold in one hand in a restaurant.
 *
 * **It opens signed out too.** The theme control used to be a second icon in
 * the header, kept there because a signed-out visitor had no account menu and
 * would otherwise lose it - the people most likely to want a dark screen are
 * the ones sitting in a dark restaurant, and most of them have no account.
 * That was true of a menu only signed-in people could open. This one opens for
 * everybody and holds Sign in and Appearance, so the header is down to one
 * control on the row where space is scarcest.
 */
const AccountButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // The sheet is portalled out of this subtree, so "outside" has to mean
  // outside both - otherwise a tap on a row closes the menu before the
  // link it landed on gets to fire.
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside =
        containerRef.current?.contains(target) ||
        sheetRef.current?.contains(target);

      if (!inside) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const username = (user as { username?: string } | null)?.username;
  const isAdmin = String(user?.role_id ?? "") === ACCOUNT_TYPE.admin;

  const groups = ACCOUNT_GROUPS.filter(
    (group) => !("adminOnly" in group && group.adminOnly) || isAdmin,
  );

  const appearance = (
    <div className="border-t border-line px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {ACCOUNT_LABELS.appearance}
      </p>
      {/* All three flat rather than a control that opens another control:
          this is already a menu, and a popover inside a bottom sheet is a
          trap on a phone. */}
      <ThemeToggle expanded />
    </div>
  );

  const rows = user ? (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-ink-muted">
          <PersonIcon />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink">
            {username}
          </span>
          <span className="block text-xs text-ink-muted">
            {ACCOUNT_LABELS.signedInAs}
          </span>
        </span>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="border-t border-line py-1">
          {group.items.map((item) => (
            <Link
              key={item.route}
              to={item.route}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 px-4 text-sm text-ink hover:bg-surface-sunken"
            >
              <span className="text-ink-muted">
                <AccountRowIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      {appearance}

      <div className="border-t border-line py-1">
        <Link
          to={ROUTES.logout}
          onClick={() => setOpen(false)}
          className="flex min-h-12 items-center px-4 text-sm text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          {ACCOUNT_LABELS.logOut}
        </Link>
      </div>
    </>
  ) : (
    <>
      <div className="py-1">
        <Link
          to={ROUTES.signIn}
          onClick={() => setOpen(false)}
          className="flex min-h-12 items-center px-4 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          {ACCOUNT_LABELS.signIn}
        </Link>
        <Link
          to={ROUTES.createAccount}
          onClick={() => setOpen(false)}
          className="flex min-h-12 items-center px-4 text-sm text-ink hover:bg-surface-sunken"
        >
          {ACCOUNT_LABELS.createAccount}
        </Link>
      </div>

      {appearance}
    </>
  );

  return (
    <div ref={containerRef} className="relative">
      {/* 44px of target around a 26px icon. It was 20px in a bar holding two
          of them, which read as a utility rather than as the way in. */}
      <button
        type="button"
        aria-label={user ? ACCOUNT_LABELS.open : ACCOUNT_LABELS.openSignedOut}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-surface-sunken"
      >
        <PersonIcon size={26} />
      </button>

      {open && (
        <>
          {/* Desktop: anchored under the icon. */}
          <div
            role="menu"
            className="absolute right-0 z-40 mt-1 hidden w-64 overflow-hidden rounded-card border border-line bg-surface-raised shadow-tile sm:block"
          >
            {rows}
          </div>

          {/* Phone: a sheet, with rows a thumb can actually hit.

              Rendered into the body on purpose. The header sets
              backdrop-blur, and a backdrop-filter makes its box the
              containing block for any fixed descendant - so `fixed inset-0`
              meant the header's 56px, not the viewport, and the sheet was
              squashed into the bar with only its last row showing. */}
          {createPortal(
            <div className="fixed inset-0 z-50 sm:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div
                ref={sheetRef}
                role="menu"
                className={clsx(
                  "absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto",
                  "rounded-t-card bg-surface-raised pb-4 shadow-sheet",
                )}
              >
                <div className="flex justify-center py-2">
                  <span className="h-1 w-10 rounded-full bg-line" />
                </div>
                {rows}
              </div>
            </div>,
            document.body,
          )}
        </>
      )}
    </div>
  );
};

export default AccountButton;
