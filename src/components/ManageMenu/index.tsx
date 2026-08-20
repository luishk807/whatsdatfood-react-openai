import { type FC, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import AddDishAction from "@/components/AddDishAction";
import MenuSectionsEditor from "@/components/ManageMenu/MenuSectionsEditor";
import ManageDishRow from "@/components/ManageMenu/ManageDishRow";
import { DISH_VERIFICATION } from "@/customConstants";
import { MANAGE_MENU_LABELS, MENU_EDIT_LABELS } from "@/customConstants/labels";
import { buildMenuResultsPath } from "@/customConstants/routes";
import useMenuEditing from "@/customHooks/useMenuEditing";
import { ManagedDishType, OwnerMenuType } from "@/interfaces/menu";
import { relativeDay } from "@/utils/time";

/**
 * The owner's view of their own menu.
 *
 * **A mode, not controls sprinkled through the customer view.** A diner
 * deciding what to order should never see a delete button, and an owner
 * fixing a price should not have to hunt for one between the photographs.
 * That is also why this is a route rather than an editing toggle on the menu
 * page: the two audiences want different layouts, not the same layout with
 * extra buttons.
 *
 * **Changes are live immediately, and it says so.** Making a restaurant wait
 * for a moderator to approve its own corrected price would make the feature
 * useless and nobody would use it twice. The safety is the recorded history
 * and the fact that nothing is destroyed — both stated on the page rather
 * than only in the schema.
 *
 * **The server decides who gets in.** `ownerMenu` refuses anybody without an
 * approved claim on this restaurant, so typing another restaurant's slug into
 * the URL returns an error rather than its menu. This page hiding a button is
 * not what protects anything.
 */
const ManageMenu: FC = () => {
  const { slug = "" } = useParams();
  const {
    loadOwnerMenu,
    setAvailability,
    archiveDish,
    restoreDish,
    decideDish,
    markVerified,
    menuLoading,
    error,
  } = useMenuEditing();

  const [menu, setMenu] = useState<OwnerMenuType | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [denied, setDenied] = useState(false);

  const refresh = useCallback(async () => {
    const next = await loadOwnerMenu(slug);

    if (next) {
      setMenu(next);
    } else {
      // Refused, or gone. Either way there is nothing to manage, and a blank
      // page under a heading reading "Manage menu" looks like a page that
      // failed to load rather than one you may not open.
      setDenied(true);
    }
  }, [loadOwnerMenu, slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Every row action reloads, because one change moves several rows: an
   *  approval empties the pending count, an archive removes a section's last
   *  dish. Reconciling that by hand is how two truths appear on one page. */
  const act = async (id: string, work: () => Promise<unknown>) => {
    setBusyId(id);
    await work();
    await refresh();
    setBusyId(null);
  };

  if (denied) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-muted">
          {error || "You do not manage this restaurant."}
        </p>
      </section>
    );
  }

  if (!menu) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded-pill bg-surface-sunken motion-reduce:animate-none" />
      </section>
    );
  }

  const sections = menu.categories.length
    ? menu.categories.map((one) => one.name)
    : Array.from(
        new Set(menu.dishes.map((one) => one.category).filter(Boolean)),
      ).map(String);

  const pending = menu.dishes.filter(
    (one) => one.verification_status === DISH_VERIFICATION.pending,
  );
  const verifiedWhen = relativeDay(menu.menu_verified_at);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-20 pt-4">
      <header className="flex flex-col gap-2">
        <Link
          to={buildMenuResultsPath(menu.slug)}
          className="self-start text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          {MANAGE_MENU_LABELS.back}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          {MANAGE_MENU_LABELS.title}
        </h1>
        <p className="text-sm text-ink-muted">{menu.name}</p>
        <p className="max-w-prose text-xs leading-relaxed text-ink-muted">
          {MANAGE_MENU_LABELS.intro}
        </p>
      </header>

      {/* Waiting first, because it is the only part of this page that is a
          queue — everything else can be done whenever. */}
      {pending.length > 0 && (
        <section className="flex flex-col gap-2 rounded-card border border-line bg-surface-sunken p-3">
          <h2 className="text-sm font-semibold text-ink">
            {MANAGE_MENU_LABELS.pending(pending.length)}
          </h2>
          <ul className="flex flex-col gap-2">
            {pending.map((dish) => (
              <li key={dish.id}>
                <ManageDishRow
                  dish={dish}
                  busy={busyId === dish.id}
                  onAvailability={(one, available) =>
                    act(one.id, () => setAvailability(one.id, available))
                  }
                  onArchive={(one) => act(one.id, () => archiveDish(one.id))}
                  onApprove={(one, approve) =>
                    act(one.id, () => decideDish(one.id, approve))
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">
            {MENU_EDIT_LABELS.menuVerified.replace("Menu c", "C")}
          </h2>
          {verifiedWhen && (
            <span className="text-xs text-ink-muted">
              {MANAGE_MENU_LABELS.verified(verifiedWhen)}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          {MANAGE_MENU_LABELS.verifyHelp}
        </p>
        <button
          type="button"
          disabled={verifying}
          onClick={async () => {
            setVerifying(true);
            await markVerified(menu.slug);
            await refresh();
            setVerifying(false);
          }}
          className="min-h-11 self-start rounded-pill border border-line px-4 text-sm font-medium text-ink hover:bg-surface-sunken disabled:opacity-60"
        >
          {verifying
            ? MANAGE_MENU_LABELS.verifying
            : MANAGE_MENU_LABELS.verifyMenu}
        </button>
      </section>

      <MenuSectionsEditor
        slug={menu.slug}
        categories={menu.categories}
        onSaved={() => refresh()}
      />

      <section className="flex flex-col gap-3">
        {sections.length === 0 && (
          <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-ink-muted">
            {MANAGE_MENU_LABELS.empty}
          </p>
        )}

        {sections.map((section) => {
          const dishes = menu.dishes.filter(
            (one) =>
              one.category === section &&
              one.verification_status !== DISH_VERIFICATION.pending,
          );

          return (
            <div key={section} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-ink">{section}</h3>

              {dishes.length === 0 ? (
                <p className="text-xs text-ink-muted">
                  {MANAGE_MENU_LABELS.empty}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {dishes.map((dish) => (
                    <li key={dish.id}>
                      <ManageDishRow
                        dish={dish}
                        busy={busyId === dish.id}
                        onAvailability={(one, available) =>
                          act(one.id, () => setAvailability(one.id, available))
                        }
                        onArchive={(one) =>
                          act(one.id, () => archiveDish(one.id))
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      <AddDishAction
        slug={menu.slug}
        sections={sections}
        canContribute
        onAdded={() => refresh()}
      />

      {error && !denied && (
        <p role="alert" className={clsx("text-sm text-danger")}>
          {error}
        </p>
      )}

      {menuLoading && (
        <p className="text-center text-xs text-ink-muted" role="status">
          …
        </p>
      )}
    </section>
  );
};

export default ManageMenu;
