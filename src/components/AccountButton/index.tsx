import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import useAuth from "@/customHooks/useAuth";
import { ROUTES } from "@/customConstants/routes";
import { ACCOUNT_GROUPS, ACCOUNT_LABELS } from "@/customConstants/account";
import { AccountRowIcon, PersonIcon } from "./icons";

/**
 * The account menu.
 *
 * Was seven items of identical weight in a floating box under a small icon.
 * Now grouped, and a bottom sheet on a phone: seven cramped targets under a
 * 20px icon is not something a thumb can use, and this is a product people
 * hold in one hand in a restaurant.
 */
const AccountButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
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

  const rows = (
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

      {ACCOUNT_GROUPS.map((group) => (
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
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ACCOUNT_LABELS.open}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink"
      >
        <PersonIcon />
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

          {/* Phone: a sheet, with rows a thumb can actually hit. */}
          <div className="fixed inset-0 z-50 sm:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
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
          </div>
        </>
      )}
    </div>
  );
};

export default AccountButton;
