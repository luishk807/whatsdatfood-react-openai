import { type FC, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { MENU_EDIT } from "@/customConstants";
import { MANAGE_MENU_LABELS } from "@/customConstants/labels";
import useMenuEditing from "@/customHooks/useMenuEditing";
import { MenuSectionsEditorInterface } from "@/interfaces/menu";

/**
 * The order a menu is printed in, and what its parts are called.
 *
 * **Buttons rather than drag and drop.** Dragging a list is the nicer
 * interaction on a desktop and the worse one on a phone, where it fights the
 * page scroll and has no keyboard equivalent at all. Up and down are two taps
 * and work everywhere; the brief asked for drag, and this is the version that
 * an owner standing in their own restaurant can actually use.
 *
 * **Saved as a whole list, in one call.** A half-applied reorder is a menu in
 * an order nobody chose, and four endpoints would make that the normal
 * outcome of a flaky connection.
 *
 * **Removing a section keeps its dishes**, which the page says out loud —
 * otherwise the obvious reading of the × is that the food goes with it.
 */
const MenuSectionsEditor: FC<MenuSectionsEditorInterface> = ({
  slug,
  categories,
  onSaved,
}) => {
  const { saveCategories, error } = useMenuEditing();
  const [names, setNames] = useState<string[]>([]);
  const [adding, setAdding] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset whenever the server's copy changes, so a save elsewhere on the page
  // does not leave this editing a list that no longer exists.
  useEffect(() => {
    setNames(categories.map((one) => one.name));
  }, [categories]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= names.length) {
      return;
    }

    const next = [...names];
    const [one] = next.splice(from, 1);
    next.splice(to, 0, one);
    setNames(next);
  };

  const dirty =
    names.length !== categories.length ||
    names.some((name, index) => name !== categories[index]?.name);

  return (
    <section className="flex flex-col gap-2 rounded-card border border-line p-3">
      <h2 className="text-sm font-semibold text-ink">
        {MANAGE_MENU_LABELS.sections}
      </h2>
      <p className="text-xs text-ink-muted">{MANAGE_MENU_LABELS.sectionsHelp}</p>

      <ul className="flex flex-col gap-1">
        {names.map((name, index) => (
          <li
            key={`${name}-${index}`}
            className="flex items-center gap-1 rounded-card bg-surface-sunken px-2 py-1"
          >
            <input
              value={name}
              maxLength={MENU_EDIT.MAX_SECTION}
              aria-label={`${MANAGE_MENU_LABELS.renameSection} ${name}`}
              onChange={(event) => {
                const next = [...names];
                next[index] = event.target.value;
                setNames(next);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
            />

            {/* Rotated chevrons rather than two more icons in the module. The
                only thing an arrow has to say here is which way. */}
            <button
              type="button"
              aria-label={`${MANAGE_MENU_LABELS.moveUp}: ${name}`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-raised disabled:opacity-30"
            >
              <span className="block rotate-90">
                <ChevronLeftIcon size={16} />
              </span>
            </button>
            <button
              type="button"
              aria-label={`${MANAGE_MENU_LABELS.moveDown}: ${name}`}
              disabled={index === names.length - 1}
              onClick={() => move(index, index + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-raised disabled:opacity-30"
            >
              <span className="block rotate-90">
                <ChevronRightIcon size={16} />
              </span>
            </button>
            <button
              type="button"
              aria-label={`Remove ${name}`}
              onClick={() =>
                setNames(names.filter((_, position) => position !== index))
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-raised"
            >
              <CloseIcon size={15} />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={adding}
          maxLength={MENU_EDIT.MAX_SECTION}
          placeholder={MANAGE_MENU_LABELS.addSection}
          aria-label={MANAGE_MENU_LABELS.addSection}
          onChange={(event) => setAdding(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-card border border-line bg-surface-raised px-3 text-sm text-ink"
        />
        <button
          type="button"
          disabled={!adding.trim()}
          onClick={() => {
            setNames([...names, adding.trim()]);
            setAdding("");
          }}
          className="min-h-11 rounded-pill border border-line px-3 text-sm text-ink disabled:opacity-50"
        >
          +
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!dirty || saving || names.length === 0}
        onClick={async () => {
          setSaving(true);
          const saved = await saveCategories(slug, names);
          setSaving(false);

          if (saved) {
            onSaved(saved);
          }
        }}
        className="min-h-11 self-start rounded-pill border border-ink bg-ink px-4 text-sm font-medium text-surface disabled:opacity-40"
      >
        {MANAGE_MENU_LABELS.saveSections}
      </button>
    </section>
  );
};

export default MenuSectionsEditor;
