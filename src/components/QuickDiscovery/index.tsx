import { type FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import BottomSheet from "@/components/BottomSheet";
import { ChevronRightIcon, MapIcon } from "@/components/icons";
import { foodCategoryIcon } from "@/customConstants/foodIcons";
import { QUICK_LABELS } from "@/customConstants/labels";
import { buildNearbyPath } from "@/customConstants/routes";
import {
  isPersonalised,
  quickCategories,
  remainingCategories,
} from "@/utils/quickDiscovery";
import { QuickDiscoveryInterface } from "@/interfaces/tastes";

/**
 * "I want coffee and I do not know a single coffee shop."
 *
 * The front door answered the other question well — somebody who knows the
 * restaurant types its name — and answered this one not at all. The only way
 * to browse by category was a cuisine tile at the very bottom of the page, and
 * the map was further down still, behind a link most readers never reached.
 *
 * **A shortcut is a link, not a filter this component owns.** Every chip goes
 * to `/nearby?cuisine=…`, which is the state the results page already has: the
 * list, the map, "Search this area" and paging all read it, so tapping Coffee
 * and then Map arrives as coffee on a map rather than everything on a map.
 * Nothing here holds search state, which is what stops this becoming a second
 * discovery system beside the one on `/nearby`.
 *
 * **Saved tastes order the row and never filter it.** They decide which four
 * are offered; "More" holds the rest in the server's own order, so browsing
 * outside your own preferences is always one tap away. A preference that
 * quietly removed a cuisine from discovery would be a bubble the reader could
 * not see the walls of.
 *
 * **Nothing here is a permanent change.** Tapping Coffee does not add coffee
 * to somebody's saved tastes, and clearing the filter does not remove it —
 * temporary search state and personalisation data are different things, and
 * the preferences page is the only place the second one changes.
 */
const QuickDiscovery: FC<QuickDiscoveryInterface> = ({
  categories,
  preferences,
  loading,
}) => {
  const [more, setMore] = useState(false);

  const shown = useMemo(
    () => quickCategories(preferences, categories),
    [preferences, categories],
  );
  const rest = useMemo(
    () => remainingCategories(shown, categories),
    [shown, categories],
  );

  // Nothing to offer is a complete answer: a row of grey pills under the
  // search box is worse than clean space, and the search is what people came
  // for. The Map button still has to be reachable, so it stands alone.
  const empty = loading || !shown.length;

  const chip = (slug: string, label: string) => {
    const Glyph = foodCategoryIcon(slug);

    return (
      <Link
        key={slug}
        to={buildNearbyPath({ cuisine: slug })}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border border-line bg-surface-raised px-3 text-sm text-ink hover:border-ink/40"
      >
        <Glyph size={16} className="text-ink-muted" />
        {label}
      </Link>
    );
  };

  return (
    <section
      aria-label={QUICK_LABELS.label}
      className="flex flex-col items-center gap-1"
    >
      {/* A swipe on a phone, centred once there is room. Four chips plus More
          and Map fit a 390px screen only by scrolling, and a row that wraps
          stops reading as a row. */}
      <div className="no-scrollbar -mx-4 flex w-full snap-x scroll-pl-4 items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:justify-center sm:overflow-visible sm:px-0">
        {!empty && shown.map((one) => chip(one.slug, one.name))}

        {!empty && rest.length > 0 && (
          <button
            type="button"
            onClick={() => setMore(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-pill border border-line px-3 text-sm text-ink-muted hover:text-ink"
          >
            {QUICK_LABELS.more}
            <ChevronRightIcon size={14} />
          </button>
        )}

        {/* Always present, and deliberately beside the categories rather than
            at the bottom of the page. Somebody should not have to scroll past
            three sections to discover that a map exists. */}
        <Link
          to={buildNearbyPath({ view: "map" })}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border border-line px-3 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          <MapIcon size={16} className="text-ink-muted" />
          {QUICK_LABELS.map}
        </Link>
      </div>

      {/* Says why these four and not four others. Personalisation the reader
          cannot see is indistinguishable from the product deciding for them. */}
      {!empty && isPersonalised(preferences, categories) && (
        <p className="text-[11px] text-ink-muted">{QUICK_LABELS.personalised}</p>
      )}

      <BottomSheet
        open={more}
        title={QUICK_LABELS.moreTitle}
        onClose={() => setMore(false)}
      >
        <ul className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3">
          {rest.map((one) => {
            const Glyph = foodCategoryIcon(one.slug);

            return (
              <li key={one.slug}>
                <Link
                  to={buildNearbyPath({ cuisine: one.slug })}
                  onClick={() => setMore(false)}
                  className={clsx(
                    "flex min-h-14 w-full items-center gap-2 rounded-card border border-line px-3 text-sm text-ink",
                    "hover:border-ink/40",
                  )}
                >
                  <Glyph size={18} className="text-ink-muted" />
                  {one.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </section>
  );
};

export default QuickDiscovery;
